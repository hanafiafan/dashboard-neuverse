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
import { Target, TrendingUp, Wallet, Pencil, Trash2 } from 'lucide-react'

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
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[0.78rem] font-semibold">Tahun:</label>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="px-2.5 py-1.5 border border-border rounded-lg text-[0.82rem]"
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        <StatCard label="Total Target Revenue" value={formatRp(annualRev)} sub={`Tahun ${year}`} variant="accent" icon={<Target size={18} />} />
        <StatCard label="Total Projected Cost" value={formatRp(annualCost)} sub={`Tahun ${year}`} variant="blue" icon={<Wallet size={18} />} />
        <StatCard label="Projected Net" value={formatRp(annualRev - annualCost)} sub="Revenue - Cost" variant={annualRev >= annualCost ? 'gold' : 'default'} accentColor={annualRev < annualCost ? '#dc2626' : undefined} />
      </div>

      <InnerTabs
        tabs={[{ key: 'target', label: 'Target Pendapatan' }, { key: 'cost', label: 'Cost Matrix' }]}
        active={tab}
        onTab={setTab}
      />

      {tab === 'target' && (
        <Card icon={<TrendingUp size={18} />} title="Target Revenue per Divisi" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('fc') }}>+ Tambah Target</button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.8rem]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left sticky left-0 bg-slate-50 z-[1]">Divisi</th>
                  {BULAN.map(b => <th key={b} className="px-2 py-2 text-right whitespace-nowrap">{b}</th>)}
                  <th className="px-2 py-2 text-right font-bold">Total</th>
                  <th className="px-2 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map(r => {
                  const total = MONTHS.reduce((s, m) => s + (Number((r as any)[m]) || 0), 0)
                  return (
                    <tr key={r.id} className="border-b border-border">
                      <td className="px-3 py-2 font-semibold sticky left-0 bg-white">{r.divisi}</td>
                      {MONTHS.map(m => <td key={m} className="px-2 py-2 text-right">{formatRp(Number((r as any)[m]) || 0)}</td>)}
                      <td className="px-2 py-2 text-right font-bold text-success">{formatRp(total)}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => { setForm(r as any); setEditId(r.id); setModal('fc') }}><Pencil size={14} /></button>
                          <button className="btn btn-outline btn-sm text-danger" onClick={() => delRow('forecast', r.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-3 py-2 sticky left-0 bg-slate-50">TOTAL</td>
                  {MONTHS.map(m => <td key={m} className="px-2 py-2 text-right text-success">{formatRp(fcTotals[m] || 0)}</td>)}
                  <td className="px-2 py-2 text-right text-success">{formatRp(annualRev)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'cost' && (
        <Card icon={<Wallet size={18} />} title="Cost Matrix 12 Bulan" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ tipe: 'Fixed' }); setEditId(null); setModal('cost') }}>+ Tambah Baris</button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.8rem]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left sticky left-0 bg-slate-50 z-[1]">Kategori</th>
                  <th className="px-2 py-2 text-left">Tipe</th>
                  {BULAN.map(b => <th key={b} className="px-2 py-2 text-right whitespace-nowrap">{b}</th>)}
                  <th className="px-2 py-2 text-right font-bold">Total</th>
                  <th className="px-2 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {costs.map(r => {
                  const total = MONTHS.reduce((s, m) => s + (Number((r as any)[m]) || 0), 0)
                  return (
                    <tr key={r.id} className="border-b border-border">
                      <td className="px-3 py-2 font-semibold sticky left-0 bg-white">{r.kategori}</td>
                      <td className="px-2 py-2"><span className={`tag ${r.tipe === 'Fixed' ? 'tag-info' : 'tag-warning'}`}>{r.tipe}</span></td>
                      {MONTHS.map(m => <td key={m} className="px-2 py-2 text-right">{formatRp(Number((r as any)[m]) || 0)}</td>)}
                      <td className="px-2 py-2 text-right font-bold text-danger">{formatRp(total)}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => { setForm(r as any); setEditId(r.id); setModal('cost') }}><Pencil size={14} /></button>
                          <button className="btn btn-outline btn-sm text-danger" onClick={() => delRow('forecast_cost', r.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-3 py-2 sticky left-0 bg-slate-50" colSpan={2}>TOTAL</td>
                  {MONTHS.map(m => <td key={m} className="px-2 py-2 text-right text-danger">{formatRp(costTotals[m] || 0)}</td>)}
                  <td className="px-2 py-2 text-right text-danger">{formatRp(annualCost)}</td>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Kategori"><FormInput value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} /></FormGroup>
          <FormGroup label="Tipe">
            <FormSelect value={form.tipe || 'Fixed'} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}>
              <option>Fixed</option><option>Variable</option>
            </FormSelect>
          </FormGroup>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
