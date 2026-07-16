'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Rekrutmen, Kritis } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { KATEGORI_HH, TAHAP_HH, PRIORITAS, alertLevel, todayStr } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'

export default function HeadhunterPage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('dashboard')
  const [rekrutmen, setRekrutmen] = useState<Rekrutmen[]>([])
  const [kritis, setKritis] = useState<Kritis[]>([])
  const [modal, setModal] = useState<'rekrutmen' | 'kritis' | null>(null)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Rekrutmen & Kritis>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: r }, { data: k }] = await Promise.all([
      supabase.from('rekrutmen').select('*').order('created_at'),
      supabase.from('kritis').select('*').order('created_at'),
    ])
    setRekrutmen(r || [])
    setKritis(k || [])
    setLoading(false)
  }

  async function saveRekrutmen() {
    try {
      const payload = {
        posisi: form.posisi || '',
        entitas: form.entitas || '',
        kategori: form.kategori || KATEGORI_HH[0],
        mulai: form.mulai || null,
        selesai: form.selesai || null,
        pct: Number(form.pct) || 0,
        tahap: form.tahap || TAHAP_HH[0],
        catatan: form.catatan || '',
        file_ol: form.file_ol || '',
        karyawan: form.karyawan || '',
        media: form.media || '',
        deadline: form.deadline || null,
        lokasi: form.lokasi || '',
      }
      if (editIdx !== null) {
        await (supabase.from('rekrutmen') as any).update(payload).eq('id', rekrutmen[editIdx].id)
      } else {
        await (supabase.from('rekrutmen') as any).insert(payload)
      }
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Rekrutmen:', err)
    }
  }

  async function saveKritis() {
    try {
      const payload = {
        posisi: form.posisi || '',
        entitas: form.entitas || '',
        prioritas: form.prioritas || PRIORITAS[0],
        deadline: form.deadline || null,
        catatan: form.catatan || '',
      }
      if (editIdx !== null) {
        await (supabase.from('kritis') as any).update(payload).eq('id', kritis[editIdx].id)
      } else {
        await (supabase.from('kritis') as any).insert(payload)
      }
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Kritis:', err)
    }
  }

  async function delRekrutmen(id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data rekrutmen ini?')) return
    await (supabase.from('rekrutmen') as any).delete().eq('id', id)
    loadData()
  }

  async function delKritis(id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data kritis ini?')) return
    await (supabase.from('kritis') as any).delete().eq('id', id)
    loadData()
  }

  // Derived stats
  const total = rekrutmen.length
  const terp = rekrutmen.filter(r => r.tahap === 'Selesai').length
  const aktif = total - terp
  const pct = total ? Math.round(terp / total * 100) : 0

  // Distribution by kategori
  const distMap: Record<string, { jumlah: number; penuh: number }> = {}
  rekrutmen.forEach(r => {
    if (!distMap[r.kategori]) distMap[r.kategori] = { jumlah: 0, penuh: 0 }
    distMap[r.kategori].jumlah++
    if (r.tahap === 'Selesai') distMap[r.kategori].penuh++
  })

  // Per-entity
  const entMap: Record<string, { kategori: string; butuh: number; penuh: number }> = {}
  rekrutmen.forEach(r => {
    const k = (r.entitas || '-') + '||' + r.kategori
    if (!entMap[k]) entMap[k] = { kategori: r.kategori, butuh: 0, penuh: 0 }
    entMap[k].butuh++
    if (r.tahap === 'Selesai') entMap[k].penuh++
  })

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Memuat data...</div>

  return (
    <div>
      <InnerTabs
        tabs={[
          { key: 'dashboard', label: 'Dashboard Utama' },
          { key: 'pemenuhan', label: 'Pemenuhan Entitas' },
          { key: 'kritis', label: 'Posisi Kritis' },
          { key: 'rekrutmen', label: 'Progres Rekrutmen' },
        ]}
        active={tab}
        onTab={setTab}
      />

      {tab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
            <StatCard label="Total Kandidat / Posisi" value={total} sub="Semua entitas" variant="accent" />
            <StatCard label="Posisi Aktif" value={aktif} sub="Sedang berjalan" variant="blue" />
            <StatCard label="Terpenuhi" value={terp} sub="Posisi closed" variant="gold" />
            <StatCard label="% Keberhasilan" value={pct + '%'} sub="Success rate" accentColor="var(--success)" />
          </div>
          <Card icon="📊" title="Distribusi Headhunter Services">
            <DataTable columns={[
              { key: 'kat', label: 'Kategori' }, { key: 'jml', label: 'Jumlah Posisi' },
              { key: 'trp', label: 'Terpenuhi' }, { key: 'pct', label: '%' }, { key: 'st', label: 'Status' },
            ]}>
              {Object.entries(distMap).map(([kat, m]) => {
                const p = m.jumlah ? Math.round(m.penuh / m.jumlah * 100) : 0
                return (
                  <tr key={kat}>
                    <Td><Tag value={kat} /></Td>
                    <Td>{m.jumlah}</Td>
                    <Td>{m.penuh}</Td>
                    <Td><strong>{p}%</strong></Td>
                    <Td><Tag value={p >= 100 ? 'Selesai' : p >= 50 ? 'Berjalan' : 'Proses'} /></Td>
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {tab === 'pemenuhan' && (
        <Card icon="🏭" title="Pemenuhan Per-Entitas">
          <DataTable columns={[
            { key: 'entitas', label: 'Nama Entitas' }, { key: 'kat', label: 'Kategori' },
            { key: 'butuh', label: 'Kebutuhan' }, { key: 'penuh', label: 'Terpenuhi' },
            { key: 'pct', label: '%' }, { key: 'st', label: 'Status' },
          ]}>
            {Object.entries(entMap).map(([key, m]) => {
              const [entitas] = key.split('||')
              const p = m.butuh ? Math.round(m.penuh / m.butuh * 100) : 0
              return (
                <tr key={key}>
                  <Td>{entitas}</Td>
                  <Td><Tag value={m.kategori} /></Td>
                  <Td>{m.butuh}</Td>
                  <Td>{m.penuh}</Td>
                  <Td><strong>{p}%</strong></Td>
                  <Td><Tag value={p >= 100 ? 'Selesai' : p >= 50 ? 'Berjalan' : 'Proses'} /></Td>
                </tr>
              )
            })}
          </DataTable>
        </Card>
      )}

      {tab === 'kritis' && (
        <Card icon="🚨" title="Posisi Kritis" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditIdx(null); setModal('kritis') }}>+ Tambah Posisi</button>
        }>
          <DataTable columns={[
            { key: 'a', label: '!', width: 18 }, { key: 'posisi', label: 'Posisi' }, { key: 'entitas', label: 'Entitas' },
            { key: 'pri', label: 'Prioritas' }, { key: 'dl', label: 'Deadline' },
            { key: 'cat', label: 'Catatan' }, { key: 'ak', label: 'Aksi' },
          ]}>
            {kritis.map((r, i) => {
              const a = alertLevel({ deadline: r.deadline, status: null, created: r.created_at, priority: r.prioritas })
              return (
                <tr key={r.id} className={a.cls}>
                  <Td>{a.level === 2 ? <span className="alert-dot red" /> : a.level === 1 ? <span className="alert-dot amber" /> : null}</Td>
                  <Td>{r.posisi}</Td>
                  <Td>{r.entitas}</Td>
                  <Td><Tag value={r.prioritas} /></Td>
                  <Td>{r.deadline || '-'}</Td>
                  <Td>{r.catatan}</Td>
                  <ActionButtons onEdit={() => { setForm(r as any); setEditIdx(i); setModal('kritis') }} onDelete={() => delKritis(r.id)} />
                </tr>
              )
            })}
          </DataTable>
        </Card>
      )}

      {tab === 'rekrutmen' && (
        <Card icon="📋" title="Progres Rekrutmen" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({}); setEditIdx(null); setModal('rekrutmen') }}>+ Tambah</button>
        }>
          <DataTable columns={[
            { key: 'pos', label: 'Posisi' }, { key: 'ent', label: 'Entitas' }, { key: 'kat', label: 'Kategori' },
            { key: 'kar', label: 'Karyawan Hired' }, { key: 'mul', label: 'Tgl Mulai' }, { key: 'sel', label: 'Tgl Selesai' },
            { key: 'dl', label: 'Deadline' }, { key: 'lok', label: 'Lokasi' }, { key: 'med', label: 'Media/Portal' },
            { key: 'pct', label: '% Terpenuhi' }, { key: 'tah', label: 'Tahap' }, { key: 'ak', label: 'Aksi' },
          ]}>
            {rekrutmen.map((r, i) => (
              <tr key={r.id}>
                <Td>{r.posisi}</Td>
                <Td>{r.entitas}</Td>
                <Td><Tag value={r.kategori} /></Td>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>{r.karyawan || '-'}</span>
                    {r.file_ol ? (
                      <a href={r.file_ol} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', fontSize: '0.72rem', textDecoration: 'underline' }}>
                        📄 File OL
                      </a>
                    ) : null}
                  </div>
                </Td>
                <Td>{r.mulai || '-'}</Td>
                <Td>{r.selesai || '-'}</Td>
                <Td>{r.deadline || '-'}</Td>
                <Td>{r.lokasi || '-'}</Td>
                <Td>{r.media || '-'}</Td>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <strong>{r.pct}%</strong>
                    {r.catatan ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.catatan}>
                        📝 {r.catatan}
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td><Tag value={r.tahap} /></Td>
                <ActionButtons onEdit={() => { setForm(r as any); setEditIdx(i); setModal('rekrutmen') }} onDelete={() => delRekrutmen(r.id)} />
              </tr>
            ))}
          </DataTable>
        </Card>
      )}

      {/* Modal Rekrutmen */}
      <Modal open={modal === 'rekrutmen'} onClose={() => setModal(null)} title={editIdx !== null ? 'Edit Rekrutmen' : '+ Tambah Rekrutmen'}>
        <FormGroup label="Posisi"><FormInput value={form.posisi || ''} onChange={e => setForm(f => ({ ...f, posisi: e.target.value }))} /></FormGroup>
        <FormGroup label="Entitas"><FormInput value={form.entitas || ''} onChange={e => setForm(f => ({ ...f, entitas: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Kategori">
            <FormSelect value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>
              {KATEGORI_HH.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Tahap">
            <FormSelect value={form.tahap || ''} onChange={e => setForm(f => ({ ...f, tahap: e.target.value }))}>
              {TAHAP_HH.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Tgl Mulai"><FormInput type="date" value={form.mulai || ''} onChange={e => setForm(f => ({ ...f, mulai: e.target.value }))} /></FormGroup>
          <FormGroup label="Tgl Selesai"><FormInput type="date" value={form.selesai || ''} onChange={e => setForm(f => ({ ...f, selesai: e.target.value }))} /></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Karyawan Hired"><FormInput value={form.karyawan || ''} onChange={e => setForm(f => ({ ...f, karyawan: e.target.value }))} /></FormGroup>
          <FormGroup label="Media / Job Portal"><FormInput value={form.media || ''} onChange={e => setForm(f => ({ ...f, media: e.target.value }))} /></FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Lokasi Penempatan"><FormInput value={form.lokasi || ''} onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))} /></FormGroup>
          <FormGroup label="Deadline Posisi"><FormInput type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="File OL (Link / URL)"><FormInput value={form.file_ol || ''} onChange={e => setForm(f => ({ ...f, file_ol: e.target.value }))} placeholder="https://..." /></FormGroup>
        <FormGroup label="Catatan"><FormInput value={form.catatan || ''} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} /></FormGroup>
        <FormGroup label="% Terpenuhi"><FormInput type="number" value={form.pct || 0} onChange={e => setForm(f => ({ ...f, pct: Number(e.target.value) }))} /></FormGroup>
        <ModalActions>
          <BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline>
          <BtnPrimary onClick={saveRekrutmen}>Simpan</BtnPrimary>
        </ModalActions>
      </Modal>

      {/* Modal Kritis */}
      <Modal open={modal === 'kritis'} onClose={() => setModal(null)} title={editIdx !== null ? 'Edit Posisi Kritis' : '+ Tambah Posisi Kritis'}>
        <FormGroup label="Posisi"><FormInput value={form.posisi || ''} onChange={e => setForm(f => ({ ...f, posisi: e.target.value }))} /></FormGroup>
        <FormGroup label="Entitas"><FormInput value={form.entitas || ''} onChange={e => setForm(f => ({ ...f, entitas: e.target.value }))} /></FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Prioritas">
            <FormSelect value={form.prioritas || ''} onChange={e => setForm(f => ({ ...f, prioritas: e.target.value }))}>
              {PRIORITAS.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Deadline"><FormInput type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Catatan"><FormInput value={form.catatan || ''} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} /></FormGroup>
        <ModalActions>
          <BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline>
          <BtnPrimary onClick={saveKritis}>Simpan</BtnPrimary>
        </ModalActions>
      </Modal>
    </div>
  )
}
