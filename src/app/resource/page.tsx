'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { CapTrainer, StaffLoad } from '@/types/database'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { CAP_STATUS, LOAD_STATUS } from '@/lib/utils'

export default function ResourcePage() {
  const [tab, setTab] = useState('trainer')
  const [caps, setCaps] = useState<CapTrainer[]>([])
  const [loads, setLoads] = useState<StaffLoad[]>([])
  const [modal, setModal] = useState<'cap' | 'load' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: c }, { data: l }] = await Promise.all([
      supabase.from('cap_trainer').select('*').order('nama'),
      supabase.from('staff_load').select('*').order('nama'),
    ])
    setCaps(c || [])
    setLoads(l || [])
  }

  async function saveCap() {
    const p = {
      nama: form.nama || '',
      max_batch: Number(form.max_batch) || 0,
      current_batch: Number(form.current_batch) || 0,
      status: form.status || CAP_STATUS[0],
      kpi: form.kpi || '',
    }
    if (editId) await supabase.from('cap_trainer').update(p).eq('id', editId)
    else await supabase.from('cap_trainer').insert(p)
    setModal(null); loadData()
  }

  async function saveLoad() {
    const p = {
      nama: form.nama || '',
      jabatan: form.jabatan || '',
      max_jam: Number(form.max_jam) || 0,
      current_jam: Number(form.current_jam) || 0,
      status: form.status || LOAD_STATUS[0],
      kpi: form.kpi || '',
    }
    if (editId) await supabase.from('staff_load').update(p).eq('id', editId)
    else await supabase.from('staff_load').insert(p)
    setModal(null); loadData()
  }

  async function delRow(table: string, id: string) {
    if (!confirm('Hapus?')) return
    await supabase.from(table as any).delete().eq('id', id); loadData()
  }

  const overloadedTrainers = caps.filter(c => c.current_batch >= c.max_batch && c.max_batch > 0).length
  const overloadedStaff = loads.filter(l => l.current_jam >= l.max_jam && l.max_jam > 0).length
  const avgTrainerUtil = caps.length ? Math.round(caps.reduce((s, c) => s + (c.max_batch > 0 ? (c.current_batch / c.max_batch) * 100 : 0), 0) / caps.length) : 0
  const avgStaffUtil = loads.length ? Math.round(loads.reduce((s, l) => s + (l.max_jam > 0 ? (l.current_jam / l.max_jam) * 100 : 0), 0) / loads.length) : 0

  function utilColor(pct: number) {
    if (pct >= 100) return 'var(--danger)'
    if (pct >= 80) return 'var(--gold)'
    return 'var(--success)'
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Trainer Overload" value={String(overloadedTrainers)} sub="Max kapasitas tercapai" accentColor={overloadedTrainers > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard label="Rata-rata Utilisasi Trainer" value={`${avgTrainerUtil}%`} sub="dari kapasitas max" variant="blue" />
        <StatCard label="Staff Overload" value={String(overloadedStaff)} sub="Jam kerja penuh" accentColor={overloadedStaff > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard label="Rata-rata Utilisasi Staff" value={`${avgStaffUtil}%`} sub="dari jam max" variant="gold" />
      </div>

      <InnerTabs
        tabs={[
          { key: 'trainer', label: '🏋️ Trainer Capacity' },
          { key: 'staff', label: '👔 Staff Workload' },
        ]}
        active={tab}
        onTab={setTab}
      />

      {/* ───────── TRAINER TAB ───────── */}
      {tab === 'trainer' && (
        <Card icon="🏋️" title="Kapasitas Trainer" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('cap') }}>+ Tambah Trainer</button>
        }>
          <DataTable columns={[
            { key: 'nama', label: 'Nama Trainer' },
            { key: 'max', label: 'Max Batch' },
            { key: 'cur', label: 'Batch Aktif' },
            { key: 'util', label: 'Utilisasi' },
            { key: 'status', label: 'Status' },
            { key: 'kpi', label: 'KPI / Target' },
            { key: 'ak', label: 'Aksi' },
          ]}>
            {caps.map(c => {
              const pct = c.max_batch > 0 ? Math.round((c.current_batch / c.max_batch) * 100) : 0
              return (
                <tr key={c.id} className={pct >= 100 ? 'row-alert' : pct >= 80 ? 'row-warn' : ''}>
                  <Td><strong>{c.nama}</strong></Td>
                  <Td>{c.max_batch}</Td>
                  <Td>{c.current_batch}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: Math.min(100, pct) + '%', background: utilColor(pct) }} />
                      </div>
                      <span style={{ fontWeight: 700, color: utilColor(pct) }}>{pct}%</span>
                    </div>
                  </Td>
                  <Td><Tag value={c.status} /></Td>
                  <Td>{c.kpi || '-'}</Td>
                  <ActionButtons
                    onEdit={() => { setForm(c as any); setEditId(c.id); setModal('cap') }}
                    onDelete={() => delRow('cap_trainer', c.id)}
                  />
                </tr>
              )
            })}
          </DataTable>
        </Card>
      )}

      {/* ───────── STAFF TAB ───────── */}
      {tab === 'staff' && (
        <Card icon="👔" title="Staff Workload Extended Matrix" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditId(null); setModal('load') }}>+ Tambah Staff</button>
        }>
          <DataTable columns={[
            { key: 'nama', label: 'Nama Staff' },
            { key: 'jabatan', label: 'Jabatan' },
            { key: 'max', label: 'Max Jam' },
            { key: 'cur', label: 'Jam Aktif' },
            { key: 'util', label: 'Utilisasi' },
            { key: 'status', label: 'Status' },
            { key: 'kpi', label: 'KPI / Target' },
            { key: 'ak', label: 'Aksi' },
          ]}>
            {loads.map(l => {
              const pct = l.max_jam > 0 ? Math.round((l.current_jam / l.max_jam) * 100) : 0
              return (
                <tr key={l.id} className={pct >= 100 ? 'row-alert' : pct >= 80 ? 'row-warn' : ''}>
                  <Td><strong>{l.nama}</strong></Td>
                  <Td>{l.jabatan}</Td>
                  <Td>{l.max_jam} jam</Td>
                  <Td>{l.current_jam} jam</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: Math.min(100, pct) + '%', background: utilColor(pct) }} />
                      </div>
                      <span style={{ fontWeight: 700, color: utilColor(pct) }}>{pct}%</span>
                    </div>
                  </Td>
                  <Td><Tag value={l.status} /></Td>
                  <Td>{l.kpi || '-'}</Td>
                  <ActionButtons
                    onEdit={() => { setForm(l as any); setEditId(l.id); setModal('load') }}
                    onDelete={() => delRow('staff_load', l.id)}
                  />
                </tr>
              )
            })}
          </DataTable>
        </Card>
      )}

      {/* ───────── MODALS ───────── */}
      <Modal open={modal === 'cap'} onClose={() => setModal(null)} title={editId ? 'Edit Trainer' : '+ Tambah Trainer'}>
        <FormGroup label="Nama Trainer"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Max Batch"><FormInput type="number" value={form.max_batch || 0} onChange={e => setForm(f => ({ ...f, max_batch: e.target.value }))} /></FormGroup>
          <FormGroup label="Batch Aktif Saat Ini"><FormInput type="number" value={form.current_batch || 0} onChange={e => setForm(f => ({ ...f, current_batch: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status">
          <FormSelect value={form.status || CAP_STATUS[0]} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {CAP_STATUS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="KPI / Target"><FormInput value={form.kpi || ''} onChange={e => setForm(f => ({ ...f, kpi: e.target.value }))} placeholder="mis: 4 batch/bulan" /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveCap}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'load'} onClose={() => setModal(null)} title={editId ? 'Edit Staff' : '+ Tambah Staff'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Nama Staff"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
          <FormGroup label="Jabatan"><FormInput value={form.jabatan || ''} onChange={e => setForm(f => ({ ...f, jabatan: e.target.value }))} /></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Max Jam/Bulan"><FormInput type="number" value={form.max_jam || 0} onChange={e => setForm(f => ({ ...f, max_jam: e.target.value }))} /></FormGroup>
          <FormGroup label="Jam Aktif Saat Ini"><FormInput type="number" value={form.current_jam || 0} onChange={e => setForm(f => ({ ...f, current_jam: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status">
          <FormSelect value={form.status || LOAD_STATUS[0]} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {LOAD_STATUS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="KPI / Target"><FormInput value={form.kpi || ''} onChange={e => setForm(f => ({ ...f, kpi: e.target.value }))} placeholder="mis: Max 160 jam/bulan" /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveLoad}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
