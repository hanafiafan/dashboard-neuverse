'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Batch, Kelas } from '@/types/database'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { COURSE_STATUS, KELAS_STATUS } from '@/lib/utils'

export default function CoursesPage() {
  const [tab, setTab] = useState('offline')
  const [offline, setOffline] = useState<Batch[]>([])
  const [online, setOnline] = useState<Batch[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [modal, setModal] = useState<'offline' | 'online' | 'kelas' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: off }, { data: on }, { data: k }] = await Promise.all([
      (supabase.from('batch_offline') as any).select('*').order('created_at'),
      (supabase.from('batch_online') as any).select('*').order('created_at'),
      (supabase.from('kelas') as any).select('*').order('created_at'),
    ])
    setOffline(off || [])
    setOnline(on || [])
    setKelas(k || [])
  }

  async function saveBatch(kind: 'offline' | 'online') {
    const table = kind === 'offline' ? 'batch_offline' : 'batch_online'
    const payload = { nama: form.nama || '', tanggal: form.tanggal || null, tempat: form.tempat || '', trainer: form.trainer || '', peserta: Number(form.peserta) || 0, status: form.status || 'Pipeline' }
    if (editId) await (supabase.from(table) as any).update(payload).eq('id', editId)
    else await (supabase.from(table) as any).insert(payload)
    setModal(null); loadData()
  }

  async function saveKelas() {
    const payload = { nama: form.nama || '', kategori: form.kategori || '', modul: Number(form.modul) || 0, peserta: Number(form.peserta) || 0, progress: Number(form.progress) || 0, status: form.status || 'Baru' }
    if (editId) await (supabase.from('kelas') as any).update(payload).eq('id', editId)
    else await (supabase.from('kelas') as any).insert(payload)
    setModal(null); loadData()
  }

  async function delRow(table: string, id: string) {
    if (!confirm('Hapus?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id)
    loadData()
  }

  const batchCols = [
    { key: 'nama', label: 'Nama Batch' }, { key: 'tgl', label: 'Tanggal' },
    { key: 'tempat', label: tab === 'online' ? 'Platform' : 'Tempat' },
    { key: 'trainer', label: 'Trainer' }, { key: 'peserta', label: 'Peserta' },
    { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
  ]

  function BatchRows({ data, table }: { data: Batch[]; table: string }) {
    return (
      <>
        {data.map(r => (
          <tr key={r.id}>
            <Td>{r.nama}</Td><Td>{r.tanggal || '-'}</Td><Td>{r.tempat}</Td>
            <Td>{r.trainer}</Td><Td>{r.peserta}</Td><Td><Tag value={r.status} /></Td>
            <ActionButtons onEdit={() => { setForm(r as any); setEditId(r.id); setModal(table === 'batch_offline' ? 'offline' : 'online') }} onDelete={() => delRow(table, r.id)} />
          </tr>
        ))}
      </>
    )
  }

  return (
    <div>
      <InnerTabs
        tabs={[
          { key: 'offline', label: 'Offline Batch' },
          { key: 'online', label: 'Online Batch' },
          { key: 'kelas', label: 'Kelas Aktif & Modul' },
        ]}
        active={tab}
        onTab={setTab}
      />

      {tab === 'offline' && (
        <Card icon="🏫" title="Offline Batch" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ status: 'Pipeline' }); setEditId(null); setModal('offline') }}>+ Tambah Batch</button>
        }>
          <DataTable columns={batchCols}><BatchRows data={offline} table="batch_offline" /></DataTable>
        </Card>
      )}

      {tab === 'online' && (
        <Card icon="💻" title="Online Batch" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ status: 'Pipeline' }); setEditId(null); setModal('online') }}>+ Tambah Batch</button>
        }>
          <DataTable columns={batchCols}><BatchRows data={online} table="batch_online" /></DataTable>
        </Card>
      )}

      {tab === 'kelas' && (
        <Card icon="📖" title="Kelas Aktif & Modul" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ status: 'Baru', progress: 0 }); setEditId(null); setModal('kelas') }}>+ Tambah Kelas</button>
        }>
          <DataTable columns={[
            { key: 'nama', label: 'Nama Kelas' }, { key: 'kat', label: 'Kategori' },
            { key: 'modul', label: 'Modul' }, { key: 'peserta', label: 'Peserta' },
            { key: 'prog', label: 'Progress %' }, { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
          ]}>
            {kelas.map(k => (
              <tr key={k.id}>
                <Td>{k.nama}</Td><Td>{k.kategori}</Td><Td>{k.modul}</Td><Td>{k.peserta}</Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill fill-success" style={{ width: Math.min(100, k.progress) + '%' }} />
                    </div>
                    <span>{k.progress}%</span>
                  </div>
                </Td>
                <Td><Tag value={k.status} /></Td>
                <ActionButtons onEdit={() => { setForm(k as any); setEditId(k.id); setModal('kelas') }} onDelete={() => delRow('kelas', k.id)} />
              </tr>
            ))}
          </DataTable>
        </Card>
      )}

      {/* Batch Modal */}
      {(modal === 'offline' || modal === 'online') && (
        <Modal open={true} onClose={() => setModal(null)} title={editId ? 'Edit Batch' : '+ Tambah Batch'}>
          <FormGroup label="Nama Batch"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Tanggal"><FormInput type="date" value={form.tanggal || ''} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></FormGroup>
            <FormGroup label={modal === 'online' ? 'Platform' : 'Tempat'}><FormInput value={form.tempat || ''} onChange={e => setForm(f => ({ ...f, tempat: e.target.value }))} /></FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Trainer"><FormInput value={form.trainer || ''} onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))} /></FormGroup>
            <FormGroup label="Peserta"><FormInput type="number" value={form.peserta || 0} onChange={e => setForm(f => ({ ...f, peserta: e.target.value }))} /></FormGroup>
          </div>
          <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{COURSE_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
          <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={() => saveBatch(modal as any)}>Simpan</BtnPrimary></ModalActions>
        </Modal>
      )}

      {/* Kelas Modal */}
      <Modal open={modal === 'kelas'} onClose={() => setModal(null)} title={editId ? 'Edit Kelas' : '+ Tambah Kelas'}>
        <FormGroup label="Nama Kelas"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <FormGroup label="Kategori"><FormInput value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormGroup label="Modul"><FormInput type="number" value={form.modul || 0} onChange={e => setForm(f => ({ ...f, modul: e.target.value }))} /></FormGroup>
          <FormGroup label="Peserta"><FormInput type="number" value={form.peserta || 0} onChange={e => setForm(f => ({ ...f, peserta: e.target.value }))} /></FormGroup>
          <FormGroup label="Progress %"><FormInput type="number" value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{KELAS_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveKelas}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
