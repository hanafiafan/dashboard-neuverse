'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Mitigasi } from '@/types/database'
import Card from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import StatCard from '@/components/ui/StatCard'
import { PRIORITAS, MITIGASI_STATUS, alertLevel, daysSince } from '@/lib/utils'

export default function MitigasiPage() {
  const [rows, setRows] = useState<Mitigasi[]>([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('mitigasi').select('*').order('created_at', { ascending: false })
    setRows(data || [])
  }

  async function save() {
    const p = {
      risiko: form.risiko || '',
      dampak: form.dampak || '',
      probabilitas: form.probabilitas || 'Rendah',
      prioritas: form.prioritas || 'Sedang',
      pic: form.pic || '',
      deadline: form.deadline || null,
      tindakan: form.tindakan || '',
      status: form.status || MITIGASI_STATUS[0],
    }
    if (editId) await supabase.from('mitigasi').update(p).eq('id', editId)
    else await supabase.from('mitigasi').insert(p)
    setModal(false); loadData()
  }

  async function del(id: string) {
    if (!confirm('Hapus?')) return
    await supabase.from('mitigasi').delete().eq('id', id); loadData()
  }

  const terbuka = rows.filter(r => r.status !== 'Selesai').length
  const kritis = rows.filter(r => r.prioritas === 'Tinggi' && r.status !== 'Selesai').length
  const overdue = rows.filter(r => r.deadline && (daysSince(r.deadline) ?? 0) > 0 && r.status !== 'Selesai').length

  function rowAlertClass(r: Mitigasi) {
    if (r.deadline && (daysSince(r.deadline) ?? 0) > 0 && r.status !== 'Selesai') return 'row-alert'
    if (r.prioritas === 'Tinggi' && r.status !== 'Selesai') return 'row-warn'
    return ''
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Total Risiko" value={String(rows.length)} sub="Semua risiko terdaftar" />
        <StatCard label="Terbuka" value={String(terbuka)} sub="Belum selesai" variant="blue" />
        <StatCard label="Kritis" value={String(kritis)} sub="Prioritas Tinggi aktif" accentColor="var(--danger)" />
        <StatCard label="Overdue" value={String(overdue)} sub="Melewati deadline" accentColor="var(--danger)" />
      </div>

      {overdue > 0 && (
        <div style={{ background: '#fff1f0', border: '1px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <strong style={{ color: 'var(--danger)' }}>⚠️ {overdue} risiko melewati deadline.</strong> Tinjau segera dan perbarui statusnya.
        </div>
      )}

      <Card icon="🛡️" title="Register Risiko & Mitigasi" actions={
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal(true) }}>+ Tambah Risiko</button>
      }>
        <DataTable columns={[
          { key: 'risiko', label: 'Risiko' },
          { key: 'dampak', label: 'Dampak' },
          { key: 'prob', label: 'Probabilitas' },
          { key: 'pri', label: 'Prioritas' },
          { key: 'pic', label: 'PIC' },
          { key: 'dl', label: 'Deadline' },
          { key: 'tindakan', label: 'Tindakan' },
          { key: 'status', label: 'Status' },
          { key: 'ak', label: 'Aksi' },
        ]}>
          {rows.map(r => (
            <tr key={r.id} className={rowAlertClass(r)}>
              <Td><strong>{r.risiko}</strong></Td>
              <Td>{r.dampak}</Td>
              <Td><Tag value={r.probabilitas} /></Td>
              <Td><Tag value={r.prioritas} /></Td>
              <Td>{r.pic}</Td>
              <Td>{r.deadline ? (() => {
                const d = daysSince(r.deadline) ?? 0
                return <span style={{ color: d > 0 && r.status !== 'Selesai' ? 'var(--danger)' : 'inherit', fontWeight: d > 0 ? 700 : 400 }}>
                  {r.deadline} {d > 0 && r.status !== 'Selesai' ? `(+${d} hari)` : ''}
                </span>
              })() : '-'}</Td>
              <Td>{r.tindakan}</Td>
              <Td><Tag value={r.status} /></Td>
              <ActionButtons
                onEdit={() => { setForm(r as any); setEditId(r.id); setModal(true) }}
                onDelete={() => del(r.id)}
              />
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Risiko' : '+ Tambah Risiko'}>
        <FormGroup label="Risiko"><FormInput value={form.risiko || ''} onChange={e => setForm(f => ({ ...f, risiko: e.target.value }))} /></FormGroup>
        <FormGroup label="Dampak"><FormInput value={form.dampak || ''} onChange={e => setForm(f => ({ ...f, dampak: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Probabilitas">
            <FormSelect value={form.probabilitas || 'Rendah'} onChange={e => setForm(f => ({ ...f, probabilitas: e.target.value }))}>
              <option>Rendah</option><option>Sedang</option><option>Tinggi</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Prioritas">
            <FormSelect value={form.prioritas || 'Sedang'} onChange={e => setForm(f => ({ ...f, prioritas: e.target.value }))}>
              {PRIORITAS.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="PIC"><FormInput value={form.pic || ''} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))} /></FormGroup>
          <FormGroup label="Deadline"><FormInput type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Tindakan Mitigasi"><FormInput value={form.tindakan || ''} onChange={e => setForm(f => ({ ...f, tindakan: e.target.value }))} /></FormGroup>
        <FormGroup label="Status">
          <FormSelect value={form.status || MITIGASI_STATUS[0]} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {MITIGASI_STATUS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(false)}>Batal</BtnOutline><BtnPrimary onClick={save}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
