'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { NPS, Feedback } from '@/types/database'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { SENTIMEN, FB_STATUS, npsCat, todayStr } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { BarChart3, MessageSquare, Smile, Meh, Frown } from 'lucide-react'

export default function ClientSuccessPage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('nps')
  const [npsData, setNpsData] = useState<NPS[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [modal, setModal] = useState<'nps' | 'fb' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: n }, { data: f }] = await Promise.all([
      (supabase.from('nps') as any).select('*').order('tanggal', { ascending: false }),
      (supabase.from('feedback') as any).select('*').order('created_at', { ascending: false }),
    ])
    setNpsData(n || [])
    setFeedback(f || [])
  }

  async function saveNps() {
    try {
      const p = {
        klien: form.klien || '',
        skor: Number(form.skor) || 0,
        tanggal: form.tanggal || todayStr(),
        komentar: form.komentar || '',
      }
      if (editId) await (supabase.from('nps') as any).update(p).eq('id', editId)
      else await (supabase.from('nps') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save NPS:', err)
    }
  }

  async function saveFeedback() {
    try {
      const p = {
        klien: form.klien || '',
        kategori: form.kategori || '',
        isi: form.isi || '',
        sentimen: form.sentimen || SENTIMEN[1],
        status: form.status || FB_STATUS[0],
      }
      if (editId) await (supabase.from('feedback') as any).update(p).eq('id', editId)
      else await (supabase.from('feedback') as any).insert(p)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save Feedback:', err)
    }
  }

  async function delRow(table: string, id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id); loadData()
  }

  // NPS calculations
  const promoters = npsData.filter(n => n.skor >= 9).length
  const passives = npsData.filter(n => n.skor >= 7 && n.skor <= 8).length
  const detractors = npsData.filter(n => n.skor <= 6).length
  const total = npsData.length
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
  const avgScore = total > 0 ? (npsData.reduce((s, n) => s + n.skor, 0) / total).toFixed(1) : '-'

  const npsColor = npsScore >= 50 ? 'var(--success)' : npsScore >= 0 ? 'var(--warning)' : 'var(--danger)'

  // NPS gauge arc helper
  const gaugeAngle = Math.max(-90, Math.min(90, (npsScore / 100) * 90))

  return (
    <div>
      <InnerTabs
        tabs={[
          { key: 'nps', label: 'NPS Score' },
          { key: 'feedback', label: 'Feedback Log' },
        ]}
        active={tab}
        onTab={setTab}
      />

      {/* ───────── NPS TAB ───────── */}
      {tab === 'nps' && (
        <div>
          {/* Gauge + stats */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 mb-4">
            {/* Gauge */}
            <Card>
              <div className="text-center py-4">
                <svg viewBox="0 0 200 110" width="100%" style={{ maxWidth: 200, margin: '0 auto', display: 'block' }}>
                  {/* Background arc */}
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                  {/* Colored arc */}
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={npsColor} strokeWidth="18"
                    strokeDasharray={`${((npsScore + 100) / 200) * 251} 251`} />
                  {/* Center text */}
                  <text x="100" y="90" textAnchor="middle" fontSize="28" fontWeight="800" fill={npsColor}>{npsScore}</text>
                  <text x="100" y="108" textAnchor="middle" fontSize="11" fill="#6b7280">NPS Score</text>
                </svg>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <span className="text-success inline-flex items-center gap-1"><Smile size={14} /> {promoters} Promoter</span>
                  <span className="text-warning inline-flex items-center gap-1"><Meh size={14} /> {passives} Passive</span>
                  <span className="text-danger inline-flex items-center gap-1"><Frown size={14} /> {detractors} Detractor</span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 content-start">
              <StatCard
                label="NPS Score"
                value={String(npsScore)}
                sub={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: npsScore >= 50 ? 'var(--success)' : npsScore >= 0 ? 'var(--warning)' : 'var(--danger)' }} />
                    {npsScore >= 50 ? 'Excellent' : npsScore >= 0 ? 'Cukup' : 'Perlu Perhatian'}
                  </span>
                }
                accentColor={npsColor}
              />
              <StatCard label="Rata-rata Skor" value={avgScore} sub="dari skala 0–10" variant="blue" />
              <StatCard label="Total Responden" value={String(total)} sub="Klien yang mengisi" />
              <StatCard label="Promoters" value={`${promoters} (${total > 0 ? Math.round((promoters / total) * 100) : 0}%)`} sub="Skor ≥ 9" variant="gold" />
            </div>
          </div>

          {/* NPS Table */}
          <Card icon={<BarChart3 size={16} />} title="Data NPS per Klien" actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setForm({ skor: 8, tanggal: todayStr() }); setEditId(null); setModal('nps') }}>+ Tambah Data NPS</button>
          }>
            <DataTable columns={[
              { key: 'klien', label: 'Klien' },
              { key: 'skor', label: 'Skor (0–10)' },
              { key: 'cat', label: 'Kategori' },
              { key: 'tgl', label: 'Tanggal' },
              { key: 'komentar', label: 'Komentar' },
              { key: 'ak', label: 'Aksi' },
            ]}>
              {npsData.map(n => {
                const cat = npsCat(n.skor)
                return (
                  <tr key={n.id}>
                    <Td><strong>{n.klien}</strong></Td>
                    <Td>
                      <span
                        className={`font-extrabold text-[1.1em] ${cat === 'Promoter' ? 'text-success' : cat === 'Passive' ? 'text-warning' : 'text-danger'}`}
                      >
                        {n.skor}
                      </span>
                    </Td>
                    <Td><span className={`tag ${cat === 'Promoter' ? 'tag-success' : cat === 'Passive' ? 'tag-warning' : 'tag-danger'}`}>{cat}</span></Td>
                    <Td>{n.tanggal}</Td>
                    <Td>{n.komentar || '-'}</Td>
                    <ActionButtons
                      onEdit={() => { setForm(n as any); setEditId(n.id); setModal('nps') }}
                      onDelete={() => delRow('nps', n.id)}
                    />
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {/* ───────── FEEDBACK TAB ───────── */}
      {tab === 'feedback' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
            <StatCard label="Total Feedback" value={String(feedback.length)} />
            <StatCard label="Positif" value={String(feedback.filter(f => f.sentimen === 'Positif').length)} variant="accent" />
            <StatCard label="Negatif" value={String(feedback.filter(f => f.sentimen === 'Negatif').length)} accentColor="var(--danger)" />
          </div>

          <Card icon={<MessageSquare size={16} />} title="Feedback Log" actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setForm({ sentimen: SENTIMEN[1], status: FB_STATUS[0] }); setEditId(null); setModal('fb') }}>+ Tambah Feedback</button>
          }>
            <DataTable columns={[
              { key: 'klien', label: 'Klien' },
              { key: 'kat', label: 'Kategori' },
              { key: 'isi', label: 'Isi Feedback' },
              { key: 'sentimen', label: 'Sentimen' },
              { key: 'status', label: 'Status' },
              { key: 'ak', label: 'Aksi' },
            ]}>
              {feedback.map(f => (
                <tr key={f.id}>
                  <Td><strong>{f.klien}</strong></Td>
                  <Td>{f.kategori}</Td>
                  <Td><div className="max-w-[260px]">{f.isi}</div></Td>
                  <Td>
                    <span className={`tag ${f.sentimen === 'Positif' ? 'tag-success' : f.sentimen === 'Negatif' ? 'tag-danger' : 'tag-warning'}`}>
                      {f.sentimen}
                    </span>
                  </Td>
                  <Td><Tag value={f.status} /></Td>
                  <ActionButtons
                    onEdit={() => { setForm(f as any); setEditId(f.id); setModal('fb') }}
                    onDelete={() => delRow('feedback', f.id)}
                  />
                </tr>
              ))}
            </DataTable>
          </Card>
        </div>
      )}

      {/* ───────── MODALS ───────── */}
      <Modal open={modal === 'nps'} onClose={() => setModal(null)} title={editId ? 'Edit NPS' : '+ Tambah Data NPS'}>
        <FormGroup label="Nama Klien"><FormInput value={form.klien || ''} onChange={e => setForm(f => ({ ...f, klien: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Skor NPS (0–10)">
            <FormInput type="number" min={0} max={10} value={form.skor ?? 8} onChange={e => setForm(f => ({ ...f, skor: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Tanggal"><FormInput type="date" value={form.tanggal || ''} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Komentar (opsional)"><FormInput value={form.komentar || ''} onChange={e => setForm(f => ({ ...f, komentar: e.target.value }))} /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveNps}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'fb'} onClose={() => setModal(null)} title={editId ? 'Edit Feedback' : '+ Tambah Feedback'}>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Klien"><FormInput value={form.klien || ''} onChange={e => setForm(f => ({ ...f, klien: e.target.value }))} /></FormGroup>
          <FormGroup label="Kategori"><FormInput value={form.kategori || ''} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} placeholder="mis: Kelas, Trainer, Admin..." /></FormGroup>
        </div>
        <FormGroup label="Isi Feedback"><FormInput value={form.isi || ''} onChange={e => setForm(f => ({ ...f, isi: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Sentimen">
            <FormSelect value={form.sentimen || SENTIMEN[1]} onChange={e => setForm(f => ({ ...f, sentimen: e.target.value }))}>
              {SENTIMEN.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Status">
            <FormSelect value={form.status || FB_STATUS[0]} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {FB_STATUS.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveFeedback}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
