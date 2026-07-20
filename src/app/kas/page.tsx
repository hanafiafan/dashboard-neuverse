'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Kas } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import { formatRp, todayStr, isGoogleDocLink } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { NotebookPen, FolderOpen, ClipboardList, FileText, BarChart3 } from 'lucide-react'

const TABS = [
  { key: 'master', label: <span className="inline-flex items-center gap-1.5"><BarChart3 size={14} /> Konsolidasi</span> },
  { key: 'headhunter', label: 'Headhunter' },
  { key: 'b2b-internal', label: 'B2B Internal' },
  { key: 'b2b-external', label: 'B2B Eksternal' },
  { key: 'courses', label: 'Courses' },
  { key: 'lms', label: 'LMS' },
]

export default function KasPage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('master')
  const [kas, setKas] = useState<Kas[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({ jenis: 'masuk', tgl: todayStr() })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const { data } = await (supabase.from('kas') as any).select('*').order('tgl', { ascending: false })
    setKas(data || [])
  }
  async function saveKas() {
    const fileUrl = (form.file_url || '').trim()
    if (fileUrl && !isGoogleDocLink(fileUrl)) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neuverse-toast', {
          detail: { message: 'Link bukti harus berupa link Google Drive/Docs/Sheets/Slides/Forms.', type: 'error' }
        }))
      }
      return
    }
    setSaving(true)
    try {
      await (supabase.from('kas') as any).insert({
        divisi: form.divisi || 'headhunter',
        tgl: form.tgl || todayStr(),
        ket: form.ket || '',
        jenis: form.jenis as 'masuk' | 'keluar',
        nominal: Number(form.nominal) || 0,
        file_url: fileUrl,
      })

      setModal(false)
      loadData()
    } catch (err: any) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }
  async function delKas(id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus transaksi kas ini?')) return
    await (supabase.from('kas') as any).delete().eq('id', id); loadData()
  }

  const divData = (divisi: string) => kas.filter(k => k.divisi === divisi)
  const totals = (data: Kas[]) => data.reduce((a, k) => ({ m: a.m + (k.jenis === 'masuk' ? k.nominal : 0), k: a.k + (k.jenis === 'keluar' ? k.nominal : 0) }), { m: 0, k: 0 })
  const allTotals = totals(kas)

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard label="Total Pemasukan" value={formatRp(allTotals.m)} accentColor="var(--success)" />
        <StatCard label="Total Pengeluaran" value={formatRp(allTotals.k)} accentColor="var(--danger)" />
        <StatCard label="Saldo" value={formatRp(allTotals.m - allTotals.k)} accentColor="var(--accent)" />
      </div>

      <InnerTabs tabs={TABS} active={tab} onTab={setTab} />

      {tab === 'master' && (
        <>
          <Card icon={<FolderOpen size={16} />} title="Rekap per Tab">
            <DataTable columns={[{ key: 't', label: 'Tab / Divisi' }, { key: 'm', label: 'Pemasukan' }, { key: 'k', label: 'Pengeluaran' }, { key: 's', label: 'Saldo' }, { key: 'n', label: 'Jml Transaksi' }]}>
              {TABS.filter(t => t.key !== 'master').map(t => {
                const data = divData(t.key); const tot = totals(data)
                return (
                  <tr key={t.key}>
                    <Td><strong>{t.label}</strong></Td>
                    <Td><span className="text-success">{formatRp(tot.m)}</span></Td>
                    <Td><span className="text-danger">{formatRp(tot.k)}</span></Td>
                    <Td><span className="font-bold">{formatRp(tot.m - tot.k)}</span></Td>
                    <Td>{data.length}</Td>
                  </tr>
                )
              })}
            </DataTable>
          </Card>
          <Card icon={<ClipboardList size={16} />} title="Semua Transaksi (Konsolidasi)">
            <DataTable columns={[{ key: 'tgl', label: 'Tanggal' }, { key: 'tab', label: 'Tab' }, { key: 'ket', label: 'Keterangan' }, { key: 'jenis', label: 'Jenis' }, { key: 'nom', label: 'Nominal' }, { key: 'file', label: 'Bukti' }]}>
              {kas.map(k => (
                <tr key={k.id}>
                  <Td>{new Date(k.tgl).toLocaleDateString('id-ID')}</Td>
                  <Td>{k.divisi}</Td><Td>{k.ket}</Td>
                  <Td><span className={`tag ${k.jenis === 'masuk' ? 'tag-success' : 'tag-danger'}`}>{k.jenis === 'masuk' ? 'Masuk' : 'Keluar'}</span></Td>
                  <Td><span className={`font-bold ${k.jenis === 'masuk' ? 'text-success' : 'text-danger'}`}>{formatRp(k.nominal)}</span></Td>
                  <Td>{k.file_url ? (
                    <a href={k.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[0.72rem] font-semibold text-accent hover:bg-slate-50 transition-colors">
                      <FileText size={12} /> Lihat
                    </a>
                  ) : '-'}</Td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      )}

      {tab !== 'master' && (
        <Card icon={<NotebookPen size={16} />} title={`Kas ${TABS.find(t => t.key === tab)?.label}`} actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ jenis: 'masuk', tgl: todayStr(), divisi: tab }); setModal(true) }}>+ Tambah Transaksi</button>
        }>
          {(() => {
            const data = divData(tab); const tot = totals(data)
            return (
              <>
                <div className="grid grid-cols-3 gap-3.5 mb-3.5">
                  <StatCard label="Pemasukan" value={formatRp(tot.m)} accentColor="var(--success)" />
                  <StatCard label="Pengeluaran" value={formatRp(tot.k)} accentColor="var(--danger)" />
                  <StatCard label="Saldo" value={formatRp(tot.m - tot.k)} accentColor="var(--accent)" />
                </div>
                <DataTable columns={[{ key: 'tgl', label: 'Tanggal' }, { key: 'ket', label: 'Keterangan' }, { key: 'j', label: 'Jenis' }, { key: 'nom', label: 'Nominal' }, { key: 'file', label: 'Bukti' }, { key: 'ak', label: 'Aksi' }]}>
                  {data.map(k => (
                    <tr key={k.id}>
                      <Td>{new Date(k.tgl).toLocaleDateString('id-ID')}</Td>
                      <Td>{k.ket}</Td>
                      <Td><span className={`tag ${k.jenis === 'masuk' ? 'tag-success' : 'tag-danger'}`}>{k.jenis === 'masuk' ? 'Masuk' : 'Keluar'}</span></Td>
                      <Td><span className={`font-bold ${k.jenis === 'masuk' ? 'text-success' : 'text-danger'}`}>{formatRp(k.nominal)}</span></Td>
                      <Td>{k.file_url ? (
                        <a href={k.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[0.72rem] font-semibold text-accent hover:bg-slate-50 transition-colors">
                          <FileText size={12} /> Lihat
                        </a>
                      ) : '-'}</Td>
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
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Jenis">
            <FormSelect value={form.jenis || 'masuk'} onChange={e => setForm(f => ({ ...f, jenis: e.target.value }))}>
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Nominal (Rp)"><FormInput type="number" value={form.nominal || ''} onChange={e => setForm(f => ({ ...f, nominal: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Link Bukti (Google Drive/Docs/Sheets/Slides/Forms)">
          <FormInput
            value={form.file_url || ''}
            onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
            placeholder="https://drive.google.com/..."
          />
        </FormGroup>
        <ModalActions>
          <BtnOutline onClick={() => setModal(false)} disabled={saving}>Batal</BtnOutline>
          <BtnPrimary onClick={saveKas} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </BtnPrimary>
        </ModalActions>
      </Modal>
    </div>
  )
}
