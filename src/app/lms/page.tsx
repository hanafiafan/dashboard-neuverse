'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { LmsFase, LmsKendala, Trainer } from '@/types/database'
import Card from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { LMS_FASE_STATUS, LMS_PRIORITAS, TRAINER_STATUS } from '@/lib/utils'

export default function LMSPage() {
  const [fase, setFase] = useState<LmsFase[]>([])
  const [kendala, setKendala] = useState<LmsKendala[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [modal, setModal] = useState<'fase' | 'kendala' | 'trainer' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])
  async function loadData() {
    const [{ data: f }, { data: k }, { data: t }] = await Promise.all([
      supabase.from('lms_fase').select('*').order('created_at'),
      supabase.from('lms_kendala').select('*').order('created_at'),
      supabase.from('trainer').select('*').order('created_at'),
    ])
    setFase(f || []); setKendala(k || []); setTrainers(t || [])
  }

  async function saveFase() {
    const p = { fase: form.fase || '', deskripsi: form.deskripsi || '', target: form.target || '', progress: Number(form.progress) || 0, status: form.status || LMS_FASE_STATUS[0] }
    if (editId) await supabase.from('lms_fase').update(p).eq('id', editId)
    else await supabase.from('lms_fase').insert(p)
    setModal(null); loadData()
  }
  async function saveKendala() {
    const p = { kendala: form.kendala || '', prioritas: form.prioritas || LMS_PRIORITAS[1], pic: form.pic || '', deadline: form.deadline || null, status: form.status || 'Antre' }
    if (editId) await supabase.from('lms_kendala').update(p).eq('id', editId)
    else await supabase.from('lms_kendala').insert(p)
    setModal(null); loadData()
  }
  async function saveTrainer() {
    const p = { nama: form.nama || '', bidang: form.bidang || '', email: form.email || '', hp: form.hp || '', sertifikasi: form.sertifikasi || '', materi: form.materi || '', status: form.status || 'Aktif' }
    if (editId) await supabase.from('trainer').update(p).eq('id', editId)
    else await supabase.from('trainer').insert(p)
    setModal(null); loadData()
  }
  async function delRow(table: string, id: string) {
    if (!confirm('Hapus?')) return
    await supabase.from(table as any).delete().eq('id', id); loadData()
  }

  return (
    <div>
      <Card icon="📊" title="Progress LMS per Fase" actions={
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('fase') }}>+ Tambah Fase</button>
      }>
        <DataTable columns={[
          { key: 'fase', label: 'Fase' }, { key: 'desk', label: 'Deskripsi' }, { key: 'target', label: 'Target' },
          { key: 'prog', label: '% Progress' }, { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
        ]}>
          {fase.map(r => (
            <tr key={r.id}>
              <Td>{r.fase}</Td><Td>{r.deskripsi}</Td><Td>{r.target}</Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill fill-blue" style={{ width: Math.min(100, r.progress) + '%' }} />
                  </div>
                  <span>{r.progress}%</span>
                </div>
              </Td>
              <Td><Tag value={r.status} /></Td>
              <ActionButtons onEdit={() => { setForm(r as any); setEditId(r.id); setModal('fase') }} onDelete={() => delRow('lms_fase', r.id)} />
            </tr>
          ))}
        </DataTable>
      </Card>

      <Card icon="⚠️" title="Kendala & Prioritas" actions={
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('kendala') }}>+ Tambah Kendala</button>
      }>
        <DataTable columns={[
          { key: 'k', label: 'Kendala' }, { key: 'p', label: 'Prioritas' }, { key: 'pic', label: 'PIC' },
          { key: 'dl', label: 'Deadline' }, { key: 'st', label: 'Status' }, { key: 'ak', label: 'Aksi' },
        ]}>
          {kendala.map(r => (
            <tr key={r.id}>
              <Td>{r.kendala}</Td><Td><Tag value={r.prioritas} /></Td><Td>{r.pic}</Td>
              <Td>{r.deadline || '-'}</Td><Td><Tag value={r.status} /></Td>
              <ActionButtons onEdit={() => { setForm(r as any); setEditId(r.id); setModal('kendala') }} onDelete={() => delRow('lms_kendala', r.id)} />
            </tr>
          ))}
        </DataTable>
      </Card>

      <Card icon="👨‍🏫" title="List Trainer & Kelengkapan" actions={
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('trainer') }}>+ Tambah Trainer</button>
      }>
        <DataTable columns={[
          { key: 'nama', label: 'Nama' }, { key: 'bidang', label: 'Bidang/Keahlian' }, { key: 'email', label: 'Email' },
          { key: 'hp', label: 'No. HP' }, { key: 'sert', label: 'Sertifikasi' }, { key: 'mat', label: 'Materi/Modul' },
          { key: 'st', label: 'Status' }, { key: 'ak', label: 'Aksi' },
        ]}>
          {trainers.map(r => (
            <tr key={r.id}>
              <Td>{r.nama}</Td><Td>{r.bidang}</Td><Td>{r.email}</Td><Td>{r.hp}</Td>
              <Td>{r.sertifikasi}</Td><Td>{r.materi}</Td><Td><Tag value={r.status} /></Td>
              <ActionButtons onEdit={() => { setForm(r as any); setEditId(r.id); setModal('trainer') }} onDelete={() => delRow('trainer', r.id)} />
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal open={modal === 'fase'} onClose={() => setModal(null)} title={editId ? 'Edit Fase' : '+ Tambah Fase'}>
        <FormGroup label="Fase"><FormInput value={form.fase || ''} onChange={e => setForm(f => ({ ...f, fase: e.target.value }))} /></FormGroup>
        <FormGroup label="Deskripsi"><FormInput value={form.deskripsi || ''} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Target"><FormInput value={form.target || ''} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} /></FormGroup>
          <FormGroup label="Progress %"><FormInput type="number" value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{LMS_FASE_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveFase}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'kendala'} onClose={() => setModal(null)} title={editId ? 'Edit Kendala' : '+ Tambah Kendala'}>
        <FormGroup label="Kendala"><FormInput value={form.kendala || ''} onChange={e => setForm(f => ({ ...f, kendala: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Prioritas"><FormSelect value={form.prioritas || ''} onChange={e => setForm(f => ({ ...f, prioritas: e.target.value }))}>{LMS_PRIORITAS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
          <FormGroup label="PIC"><FormInput value={form.pic || ''} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))} /></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Deadline"><FormInput type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></FormGroup>
          <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Antre</option><option>Proses</option><option>Selesai</option></FormSelect></FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveKendala}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'trainer'} onClose={() => setModal(null)} title={editId ? 'Edit Trainer' : '+ Tambah Trainer'}>
        <FormGroup label="Nama Trainer"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Bidang/Keahlian"><FormInput value={form.bidang || ''} onChange={e => setForm(f => ({ ...f, bidang: e.target.value }))} /></FormGroup>
          <FormGroup label="Email"><FormInput type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="No. HP"><FormInput value={form.hp || ''} onChange={e => setForm(f => ({ ...f, hp: e.target.value }))} /></FormGroup>
          <FormGroup label="Sertifikasi"><FormInput value={form.sertifikasi || ''} onChange={e => setForm(f => ({ ...f, sertifikasi: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Materi / Modul"><FormInput value={form.materi || ''} onChange={e => setForm(f => ({ ...f, materi: e.target.value }))} /></FormGroup>
        <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{TRAINER_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveTrainer}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
