'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Cashflow, FinRekap } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { formatRp, CASH_TIPE, DIVISI, todayStr } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'

export default function FinancePage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('kesehatan')
  const [cashflow, setCashflow] = useState<Cashflow[]>([])
  const [finRekap, setFinRekap] = useState<FinRekap[]>([])
  const [saldoAwal, setSaldoAwal] = useState(0)
  const [modal, setModal] = useState<'cash' | 'rekap' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({ tipe: 'Revenue', tanggal: todayStr() })

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const [{ data: cf }, { data: fr }, { data: st }] = await Promise.all([
      (supabase.from('cashflow') as any).select('*').order('tanggal', { ascending: false }),
      (supabase.from('fin_rekap') as any).select('*').order('created_at'),
      (supabase.from('settings') as any).select('*').eq('key', 'saldo_awal').single(),
    ])
    setCashflow(cf || [])
    setFinRekap(fr || [])
    if (st) setSaldoAwal(Number(st.value) || 0)
  }

  async function saveSaldoAwal(val: number) {
    await (supabase.from('settings') as any).update({ value: String(val) }).eq('key', 'saldo_awal')
    setSaldoAwal(val)
  }

  async function saveCash() {
    try {
      const p = { tanggal: form.tanggal || todayStr(), tipe: form.tipe as any, kategori: form.kategori || '', divisi: form.divisi || '', nominal: Number(form.nominal) || 0 }
      if (editId) await (supabase.from('cashflow') as any).update(p).eq('id', editId)
      else await (supabase.from('cashflow') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Cash:', err)
    }
  }

  async function saveRekap() {
    try {
      const p = { divisi: form.divisi || '', masuk: Number(form.masuk) || 0, keluar: Number(form.keluar) || 0, ket: form.ket || '' }
      if (editId) await (supabase.from('fin_rekap') as any).update(p).eq('id', editId)
      else await (supabase.from('fin_rekap') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Rekap:', err)
    }
  }

  async function delRow(table: string, id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data keuangan ini?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id); loadData()
  }

  // Burn rate calculations
  const byMonth: Record<string, { rev: number; fixed: number; variable: number }> = {}
  cashflow.forEach(c => {
    const mk = c.tanggal.slice(0, 7)
    if (!byMonth[mk]) byMonth[mk] = { rev: 0, fixed: 0, variable: 0 }
    if (c.tipe === 'Revenue') byMonth[mk].rev += Number(c.nominal)
    else if (c.tipe === 'Fixed') byMonth[mk].fixed += Number(c.nominal)
    else byMonth[mk].variable += Number(c.nominal)
  })
  const months = Object.keys(byMonth).sort()
  const last3 = months.slice(-3)
  let netSum = 0
  last3.forEach(m => { netSum += (byMonth[m].fixed + byMonth[m].variable) - byMonth[m].rev })
  const avgNet = last3.length ? netSum / last3.length : 0

  // Total cash
  const totalRev = cashflow.filter(c => c.tipe === 'Revenue').reduce((s, c) => s + Number(c.nominal), 0)
  const totalExp = cashflow.filter(c => c.tipe !== 'Revenue').reduce((s, c) => s + Number(c.nominal), 0)
  const kasSaatIni = saldoAwal + totalRev - totalExp

  const runwayMonths = avgNet > 0 ? kasSaatIni / avgNet : Infinity
  const runwayTxt = avgNet > 0 ? (runwayMonths < 0 ? '0' : runwayMonths.toFixed(1) + ' bln') : '∞'

  const totalMasuk = finRekap.reduce((s, r) => s + Number(r.masuk), 0)
  const totalKeluar = finRekap.reduce((s, r) => s + Number(r.keluar), 0)

  return (
    <div>
      <InnerTabs
        tabs={[
          { key: 'kesehatan', label: '🫀 Kesehatan Kas' },
          { key: 'konsolidasi', label: 'Konsolidasi' },
          { key: 'capaian', label: 'Capaian Bulanan' },
        ]}
        active={tab}
        onTab={setTab}
      />

      {tab === 'kesehatan' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Saldo Awal Kas (Rp):</label>
            <input
              type="number"
              value={saldoAwal}
              onChange={e => saveSaldoAwal(Number(e.target.value))}
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, width: 160, fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
            <StatCard label="Kas Saat Ini" value={formatRp(kasSaatIni)} sub="Saldo awal + arus kas" variant="blue" />
            <StatCard label="Net Burn / Bulan" value={avgNet > 0 ? formatRp(Math.round(avgNet)) : 'Surplus'} sub="Rata-rata 3 bln terakhir" accentColor="var(--danger)" />
            <StatCard label="Runway" value={runwayTxt} sub="Sisa bulan operasional" variant="gold" />
            <StatCard label="Estimasi Kas Habis" value={avgNet > 0 ? new Date(Date.now() + runwayMonths * 30 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Surplus'} sub="Proyeksi tanggal" />
          </div>

          {avgNet > 0 && runwayMonths < 3 && (
            <div style={{ background: '#fff1f0', border: '1px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <strong style={{ color: 'var(--danger)' }}>🔴 Runway kritis (&lt; 3 bulan).</strong> Segera tingkatkan revenue atau pangkas biaya variabel.
            </div>
          )}

          <Card icon="💸" title="Arus Kas Terstruktur" actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setForm({ tipe: 'Revenue', tanggal: todayStr() }); setEditId(null); setModal('cash') }}>+ Tambah Transaksi</button>
          }>
            <DataTable columns={[
              { key: 'tgl', label: 'Tanggal' }, { key: 'tipe', label: 'Tipe' }, { key: 'kat', label: 'Kategori' },
              { key: 'div', label: 'Divisi' }, { key: 'nom', label: 'Nominal' }, { key: 'ak', label: 'Aksi' },
            ]}>
              {cashflow.map(c => (
                <tr key={c.id}>
                  <Td>{c.tanggal}</Td>
                  <Td><span className={`tag ${c.tipe === 'Revenue' ? 'tag-success' : 'tag-danger'}`}>{c.tipe}</span></Td>
                  <Td>{c.kategori}</Td><Td>{c.divisi || '-'}</Td>
                  <Td style={{ fontWeight: 700, color: c.tipe === 'Revenue' ? 'var(--success)' : 'var(--danger)' }}>{formatRp(Number(c.nominal))}</Td>
                  <ActionButtons onEdit={() => { setForm(c as any); setEditId(c.id); setModal('cash') }} onDelete={() => delRow('cashflow', c.id)} />
                </tr>
              ))}
            </DataTable>
          </Card>

          <Card icon="📅" title="Rekap Bulanan">
            <DataTable columns={[{ key: 'bln', label: 'Bulan' }, { key: 'rev', label: 'Revenue' }, { key: 'fixed', label: 'Fixed' }, { key: 'var', label: 'Variable' }, { key: 'net', label: 'Net Burn' }, { key: 'st', label: 'Status' }]}>
              {months.map(m => {
                const d = byMonth[m]; const net = (d.fixed + d.variable) - d.rev
                return (
                  <tr key={m}>
                    <Td><strong>{m}</strong></Td>
                    <Td style={{ color: 'var(--success)' }}>{formatRp(d.rev)}</Td>
                    <Td>{formatRp(d.fixed)}</Td><Td>{formatRp(d.variable)}</Td>
                    <Td style={{ fontWeight: 700, color: net <= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatRp(net)}</Td>
                    <Td><Tag value={net <= 0 ? 'Surplus' : 'Burn'} /></Td>
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {tab === 'konsolidasi' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            <StatCard label="Total Pemasukan" value={formatRp(totalMasuk)} variant="accent" />
            <StatCard label="Total Pengeluaran" value={formatRp(totalKeluar)} variant="blue" />
            <StatCard label="Net Cash Flow" value={formatRp(totalMasuk - totalKeluar)} variant="gold" />
          </div>
          <Card icon="📂" title="Rekapitulasi per Divisi" actions={
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('rekap') }}>+ Tambah Divisi</button>
          }>
            <DataTable columns={[{ key: 'd', label: 'Divisi / Sumber' }, { key: 'm', label: 'Pemasukan' }, { key: 'k', label: 'Pengeluaran' }, { key: 's', label: 'Saldo' }, { key: 'ket', label: 'Keterangan' }, { key: 'ak', label: 'Aksi' }]}>
              {finRekap.map(r => {
                const s = Number(r.masuk) - Number(r.keluar)
                return (
                  <tr key={r.id}>
                    <Td>{r.divisi}</Td>
                    <Td style={{ color: 'var(--success)' }}>{formatRp(Number(r.masuk))}</Td>
                    <Td style={{ color: 'var(--danger)' }}>{formatRp(Number(r.keluar))}</Td>
                    <Td style={{ fontWeight: 700, color: s >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatRp(s)}</Td>
                    <Td>{r.ket}</Td>
                    <ActionButtons onEdit={() => { setForm(r as any); setEditId(r.id); setModal('rekap') }} onDelete={() => delRow('fin_rekap', r.id)} />
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {tab === 'capaian' && (
        <Card icon="📅" title="Capaian Bulanan (dari Forecasting)">
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>Data ini otomatis dari modul Forecasting. Isi target dan realisasi di sana.</p>
        </Card>
      )}

      <Modal open={modal === 'cash'} onClose={() => setModal(null)} title={editId ? 'Edit Transaksi' : '+ Tambah Transaksi'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Tanggal"><FormInput type="date" value={form.tanggal || ''} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></FormGroup>
          <FormGroup label="Tipe"><FormSelect value={form.tipe || ''} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}>{[...CASH_TIPE].map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Kategori"><FormInput value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} placeholder="mis: Gaji, Ads..." /></FormGroup>
          <FormGroup label="Divisi"><FormSelect value={form.divisi || ''} onChange={e => setForm(f => ({ ...f, divisi: e.target.value }))}><option value="">-</option>{DIVISI.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        </div>
        <FormGroup label="Nominal (Rp)"><FormInput type="number" value={form.nominal || ''} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveCash}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'rekap'} onClose={() => setModal(null)} title={editId ? 'Edit Rekap' : '+ Tambah Rekap Divisi'}>
        <FormGroup label="Divisi / Sumber"><FormInput value={form.divisi || ''} onChange={e => setForm(f => ({ ...f, divisi: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Pemasukan"><FormInput type="number" value={form.masuk || 0} onChange={e => setForm(f => ({ ...f, masuk: e.target.value }))} /></FormGroup>
          <FormGroup label="Pengeluaran"><FormInput type="number" value={form.keluar || 0} onChange={e => setForm(f => ({ ...f, keluar: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Keterangan"><FormInput value={form.ket || ''} onChange={e => setForm(f => ({ ...f, ket: e.target.value }))} /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveRekap}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
