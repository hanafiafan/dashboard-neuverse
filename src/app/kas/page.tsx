'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Kas } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import { formatRp, todayStr } from '@/lib/utils'

const TABS = [
  { key: 'master', label: '📊 Konsolidasi' },
  { key: 'headhunter', label: 'Headhunter' },
  { key: 'b2b-internal', label: 'B2B Internal' },
  { key: 'b2b-external', label: 'B2B Eksternal' },
  { key: 'courses', label: 'Courses' },
  { key: 'lms', label: 'LMS' },
]

export default function KasPage() {
  const [tab, setTab] = useState('master')
  const [kas, setKas] = useState<Kas[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({ jenis: 'masuk', tgl: todayStr() })

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const { data } = await supabase.from('kas').select('*').order('tgl', { ascending: false })
    setKas(data || [])
  }
  async function saveKas() {
    await supabase.from('kas').insert({
      divisi: form.divisi || 'headhunter',
      tgl: form.tgl || todayStr(),
      ket: form.ket || '',
      jenis: form.jenis as 'masuk' | 'keluar',
      nominal: Number(form.nominal) || 0,
      file_url: '',
    })
    setModal(false); loadData()
  }
  async function delKas(id: string) {
    if (!confirm('Hapus?')) return
    await supabase.from('kas').delete().eq('id', id); loadData()
  }

  const divData = (divisi: string) => kas.filter(k => k.divisi === divisi)
  const totals = (data: Kas[]) => data.reduce((a, k) => ({ m: a.m + (k.jenis === 'masuk' ? k.nominal : 0), k: a.k + (k.jenis === 'keluar' ? k.nominal : 0) }), { m: 0, k: 0 })
  const allTotals = totals(kas)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Pemasukan" value={formatRp(allTotals.m)} accentColor="var(--success)" />
        <StatCard label="Total Pengeluaran" value={formatRp(allTotals.k)} accentColor="var(--danger)" />
        <StatCard label="Saldo" value={formatRp(allTotals.m - allTotals.k)} accentColor="var(--accent2)" />
      </div>

      <InnerTabs tabs={TABS} active={tab} onTab={setTab} />

      {tab === 'master' && (
        <>
          <Card icon="📂" title="Rekap per Tab">
            <DataTable columns={[{ key: 't', label: 'Tab / Divisi' }, { key: 'm', label: 'Pemasukan' }, { key: 'k', label: 'Pengeluaran' }, { key: 's', label: 'Saldo' }, { key: 'n', label: 'Jml Transaksi' }]}>
              {TABS.filter(t => t.key !== 'master').map(t => {
                const data = divData(t.key); const tot = totals(data)
                return (
                  <tr key={t.key}>
                    <Td><strong>{t.label}</strong></Td>
                    <Td style={{ color: 'var(--success)' }}>{formatRp(tot.m)}</Td>
                    <Td style={{ color: 'var(--danger)' }}>{formatRp(tot.k)}</Td>
                    <Td style={{ fontWeight: 700 }}>{formatRp(tot.m - tot.k)}</Td>
                    <Td>{data.length}</Td>
                  </tr>
                )
              })}
            </DataTable>
          </Card>
          <Card icon="📋" title="Semua Transaksi (Konsolidasi)">
            <DataTable columns={[{ key: 'tgl', label: 'Tanggal' }, { key: 'tab', label: 'Tab' }, { key: 'ket', label: 'Keterangan' }, { key: 'jenis', label: 'Jenis' }, { key: 'nom', label: 'Nominal' }]}>
              {kas.map(k => (
                <tr key={k.id}>
                  <Td>{new Date(k.tgl).toLocaleDateString('id-ID')}</Td>
                  <Td>{k.divisi}</Td><Td>{k.ket}</Td>
                  <Td><span className={`tag ${k.jenis === 'masuk' ? 'tag-success' : 'tag-danger'}`}>{k.jenis === 'masuk' ? 'Masuk' : 'Keluar'}</span></Td>
                  <Td style={{ fontWeight: 700, color: k.jenis === 'masuk' ? 'var(--success)' : 'var(--danger)' }}>{formatRp(k.nominal)}</Td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      )}

      {tab !== 'master' && (
        <Card title={`📝 Kas ${TABS.find(t => t.key === tab)?.label}`} actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ jenis: 'masuk', tgl: todayStr(), divisi: tab }); setModal(true) }}>+ Tambah Transaksi</button>
        }>
          {(() => {
            const data = divData(tab); const tot = totals(data)
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
                  <StatCard label="Pemasukan" value={formatRp(tot.m)} accentColor="var(--success)" />
                  <StatCard label="Pengeluaran" value={formatRp(tot.k)} accentColor="var(--danger)" />
                  <StatCard label="Saldo" value={formatRp(tot.m - tot.k)} accentColor="var(--accent2)" />
                </div>
                <DataTable columns={[{ key: 'tgl', label: 'Tanggal' }, { key: 'ket', label: 'Keterangan' }, { key: 'j', label: 'Jenis' }, { key: 'nom', label: 'Nominal' }, { key: 'ak', label: 'Aksi' }]}>
                  {data.map(k => (
                    <tr key={k.id}>
                      <Td>{new Date(k.tgl).toLocaleDateString('id-ID')}</Td>
                      <Td>{k.ket}</Td>
                      <Td><span className={`tag ${k.jenis === 'masuk' ? 'tag-success' : 'tag-danger'}`}>{k.jenis === 'masuk' ? 'Masuk' : 'Keluar'}</span></Td>
                      <Td style={{ fontWeight: 700, color: k.jenis === 'masuk' ? 'var(--success)' : 'var(--danger)' }}>{formatRp(k.nominal)}</Td>
                      <ActionButtons onDelete={() => delKas(k.id)} />
                    </tr>
                  ))}
                </DataTable>
              </>
            )
          })()}
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="+ Tambah Transaksi Kas">
        <FormGroup label="Tanggal"><FormInput type="date" value={form.tgl || ''} onChange={e => setForm(f => ({ ...f, tgl: e.target.value }))} /></FormGroup>
        <FormGroup label="Keterangan"><FormInput value={form.ket || ''} onChange={e => setForm(f => ({ ...f, ket: e.target.value }))} /></FormGroup>
        <FormGroup label="Tab / Divisi">
          <FormSelect value={form.divisi || ''} onChange={e => setForm(f => ({ ...f, divisi: e.target.value }))}>
            {TABS.filter(t => t.key !== 'master').map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </FormSelect>
        </FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Jenis">
            <FormSelect value={form.jenis || 'masuk'} onChange={e => setForm(f => ({ ...f, jenis: e.target.value }))}>
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Nominal (Rp)"><FormInput type="number" value={form.nominal || ''} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} /></FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(false)}>Batal</BtnOutline><BtnPrimary onClick={saveKas}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
