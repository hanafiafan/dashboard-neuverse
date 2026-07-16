'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Forecast, ForecastCost } from '@/types/database'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import StatCard from '@/components/ui/StatCard'
import { formatRp, DIVISI, MONTH_KEYS, BULAN } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'

const MONTHS = MONTH_KEYS // ['jan','feb',...,'des']

export default function ForecastingPage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('target')
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [costs, setCosts] = useState<ForecastCost[]>([])
  const [modal, setModal] = useState<'fc' | 'cost' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => { loadData() }, [year])

  async function loadData() {
    const [{ data: fc }, { data: cs }] = await Promise.all([
      (supabase.from('forecast') as any).select('*').eq('tahun', year).order('divisi'),
      (supabase.from('forecast_cost') as any).select('*').eq('tahun', year).order('kategori'),
    ])
    setForecasts(fc || [])
    setCosts(cs || [])
  }

  async function saveFc() {
    try {
      const p: any = { divisi: form.divisi || '', tahun: year }
      MONTHS.forEach(m => { p[m] = Number(form[m]) || 0 })
      if (editId) await (supabase.from('forecast') as any).update(p).eq('id', editId)
      else await (supabase.from('forecast') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Target Revenue:', err)
    }
  }

  async function saveCost() {
    try {
      const p: any = { kategori: form.kategori || '', tipe: form.tipe || 'Fixed', tahun: year }
      MONTHS.forEach(m => { p[m] = Number(form[m]) || 0 })
      if (editId) await (supabase.from('forecast_cost') as any).update(p).eq('id', editId)
      else await (supabase.from('forecast_cost') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Cost:', err)
    }
  }

  async function delRow(table: string, id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id); loadData()
  }

  const totalPerMonth = (rows: (Forecast | ForecastCost)[]) => {
    const totals: Record<string, number> = {}
    MONTHS.forEach(m => { totals[m] = rows.reduce((s, r) => s + (Number((r as any)[m]) || 0), 0) })
    return totals
  }

  const fcTotals = totalPerMonth(forecasts)
  const costTotals = totalPerMonth(costs)
  const annualRev = Object.values(fcTotals).reduce((a, b) => a + b, 0)
  const annualCost = Object.values(costTotals).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Tahun:</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.82rem' }}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Total Target Revenue" value={formatRp(annualRev)} sub={`Tahun ${year}`} variant="accent" />
        <StatCard label="Total Projected Cost" value={formatRp(annualCost)} sub={`Tahun ${year}`} variant="blue" />
        <StatCard label="Projected Net" value={formatRp(annualRev - annualCost)} sub="Revenue - Cost" variant={annualRev >= annualCost ? 'gold' : 'default'} accentColor={annualRev < annualCost ? 'var(--danger)' : undefined} />
      </div>

      <InnerTabs
        tabs={[{ key: 'target', label: '🎯 Target Pendapatan' }, { key: 'cost', label: '💰 Cost Matrix' }]}
        active={tab}
        onTab={setTab}
      />

      {tab === 'target' && (
        <Card icon="📈" title="Target Revenue per Divisi" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('fc') }}>+ Tambah Target</button>
        }>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--surface2)', zIndex: 1 }}>Divisi</th>
                  {BULAN.map(b => <th key={b} style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>{b}</th>)}
                  <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700 }}>Total</th>
                  <th style={{ padding: '8px 8px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map(r => {
                  const total = MONTHS.reduce((s, m) => s + (Number((r as any)[m]) || 0), 0)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, position: 'sticky', left: 0, background: 'var(--surface)' }}>{r.divisi}</td>
                      {MONTHS.map(m => <td key={m} style={{ padding: '8px 8px', textAlign: 'right' }}>{formatRp(Number((r as any)[m]) || 0)}</td>)}
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{formatRp(total)}</td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setForm(r as any); setEditId(r.id); setModal('fc') }}>✏️</button>
                          <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => delRow('forecast', r.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr style={{ background: 'var(--surface2)', fontWeight: 700 }}>
                  <td style={{ padding: '8px 12px', position: 'sticky', left: 0, background: 'var(--surface2)' }}>TOTAL</td>
                  {MONTHS.map(m => <td key={m} style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--success)' }}>{formatRp(fcTotals[m] || 0)}</td>)}
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--success)' }}>{formatRp(annualRev)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'cost' && (
        <Card icon="💸" title="Cost Matrix 12 Bulan" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ tipe: 'Fixed' }); setEditId(null); setModal('cost') }}>+ Tambah Baris</button>
        }>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--surface2)', zIndex: 1 }}>Kategori</th>
                  <th style={{ padding: '8px 8px', textAlign: 'left' }}>Tipe</th>
                  {BULAN.map(b => <th key={b} style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>{b}</th>)}
                  <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700 }}>Total</th>
                  <th style={{ padding: '8px 8px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {costs.map(r => {
                  const total = MONTHS.reduce((s, m) => s + (Number((r as any)[m]) || 0), 0)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, position: 'sticky', left: 0, background: 'var(--surface)' }}>{r.kategori}</td>
                      <td style={{ padding: '8px 8px' }}><span className={`tag ${r.tipe === 'Fixed' ? 'tag-info' : 'tag-warning'}`}>{r.tipe}</span></td>
                      {MONTHS.map(m => <td key={m} style={{ padding: '8px 8px', textAlign: 'right' }}>{formatRp(Number((r as any)[m]) || 0)}</td>)}
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>{formatRp(total)}</td>
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setForm(r as any); setEditId(r.id); setModal('cost') }}>✏️</button>
                          <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => delRow('forecast_cost', r.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr style={{ background: 'var(--surface2)', fontWeight: 700 }}>
                  <td style={{ padding: '8px 12px', position: 'sticky', left: 0, background: 'var(--surface2)' }} colSpan={2}>TOTAL</td>
                  {MONTHS.map(m => <td key={m} style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--danger)' }}>{formatRp(costTotals[m] || 0)}</td>)}
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--danger)' }}>{formatRp(annualCost)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Target Revenue */}
      <Modal open={modal === 'fc'} onClose={() => setModal(null)} title={editId ? 'Edit Target' : '+ Tambah Target Divisi'} maxWidth={760}>
        <FormGroup label="Divisi">
          <FormSelect value={form.divisi || ''} onChange={e => setForm(f => ({ ...f, divisi: e.target.value }))}>
            <option value="">-- Pilih --</option>
            {DIVISI.map(d => <option key={d}>{d}</option>)}
          </FormSelect>
        </FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {MONTHS.map((m, i) => (
            <FormGroup key={m} label={BULAN[i]}>
              <FormInput type="number" value={form[m] || 0} onChange={e => setForm(f => ({ ...f, [m]: e.target.value }))} />
            </FormGroup>
          ))}
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveFc}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      {/* Modal: Cost */}
      <Modal open={modal === 'cost'} onClose={() => setModal(null)} title={editId ? 'Edit Cost' : '+ Tambah Cost'} maxWidth={760}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Kategori"><FormInput value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} /></FormGroup>
          <FormGroup label="Tipe">
            <FormSelect value={form.tipe || 'Fixed'} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}>
              <option>Fixed</option><option>Variable</option>
            </FormSelect>
          </FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {MONTHS.map((m, i) => (
            <FormGroup key={m} label={BULAN[i]}>
              <FormInput type="number" value={form[m] || 0} onChange={e => setForm(f => ({ ...f, [m]: e.target.value }))} />
            </FormGroup>
          ))}
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveCost}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
