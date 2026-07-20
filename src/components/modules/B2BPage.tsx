'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { B2BClient, B2BPipeline, B2BChecklist, B2BProgres } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { CLIENT_STATUS, STAGE_B2B, PROGRES_STATUS, CHK_STATUS, alertLevel, todayStr } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { Building2, Globe2, CheckCircle2, RefreshCw, Rocket, Link2 } from 'lucide-react'

interface Props { scope: 'internal' | 'external' }

export default function B2BPage({ scope }: Props) {
  const confirm = useConfirm()
  const label = scope === 'internal' ? 'B2B Internal' : 'B2B Eksternal'
  const Icon = scope === 'internal' ? Building2 : Globe2

  const [tab, setTab] = useState('cp')
  const [clients, setClients] = useState<B2BClient[]>([])
  const [pipeline, setPipeline] = useState<B2BPipeline[]>([])
  const [checklist, setChecklist] = useState<B2BChecklist[]>([])
  const [progres, setProgres] = useState<B2BProgres[]>([])
  const [modal, setModal] = useState<'client' | 'pipeline' | 'checklist' | 'progres' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [scope])

  async function loadData() {
    const [{ data: c }, { data: p }, { data: chk }, { data: pr }] = await Promise.all([
      supabase.from('b2b_clients').select('*').eq('scope', scope).order('created_at'),
      supabase.from('b2b_pipeline').select('*').eq('scope', scope).order('created_at'),
      supabase.from('b2b_checklist').select('*').eq('scope', scope).order('created_at'),
      supabase.from('b2b_progres').select('*').order('created_at'),
    ])
    setClients(c || [])
    setPipeline(p || [])
    setChecklist(chk || [])
    setProgres(pr || [])
    setLoading(false)
  }

  const activeClients = clients.filter(c => c.status === 'Aktif')

  async function saveClient() {
    try {
      const payload = { scope, nama: form.nama || '', layanan: form.layanan || '', nilai: Number(form.nilai) || 0, pic: form.pic || '', status: form.status || 'Aktif' }
      if (editId) await (supabase.from('b2b_clients') as any).update(payload).eq('id', editId)
      else await (supabase.from('b2b_clients') as any).insert(payload)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save client:', err)
    }
  }

  async function savePipeline() {
    try {
      const payload = { scope, nama: form.nama || '', layanan: form.layanan || '', nilai: Number(form.nilai) || 0, pic: form.pic || '', stage: form.stage || 'Prospek', prob: Number(form.prob) || 0, score: Number(form.score) || 0 }
      if (editId) await (supabase.from('b2b_pipeline') as any).update(payload).eq('id', editId)
      else await (supabase.from('b2b_pipeline') as any).insert(payload)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save pipeline:', err)
    }
  }

  async function saveChecklist() {
    if (!form.client_id) {
      alert('Silakan pilih client terlebih dahulu')
      return
    }
    try {
      const payload = { scope, client_id: form.client_id, task: form.task || '', target_date: form.target_date || null, status: form.status || 'Belum Mulai', link: form.link || '' }
      if (editId) await (supabase.from('b2b_checklist') as any).update(payload).eq('id', editId)
      else await (supabase.from('b2b_checklist') as any).insert(payload)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save checklist:', err)
    }
  }

  async function saveProgres() {
    try {
      const payload = { client_id: selectedClient, fase: form.fase || '', keterangan: form.keterangan || '', tanggal: form.tanggal || null, status: form.status || 'Belum' }
      if (editId) await (supabase.from('b2b_progres') as any).update(payload).eq('id', editId)
      else await (supabase.from('b2b_progres') as any).insert(payload)
      setModal(null); loadData()
    } catch (err) {
      console.error('Failed to save progres:', err)
    }
  }

  async function delRow(table: string, id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data B2B ini?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id)
    loadData()
  }

  const tabs = [
    { key: 'cp', label: 'Client & Pipeline' },
    { key: 'checklist', label: 'Checklist & Dokumen' },
    ...activeClients.map(c => ({ key: `prog-${c.id}`, label: `${c.nama} — Progres` })),
  ]

  if (loading) return <div className="p-10 text-center text-muted">Memuat data...</div>

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Client Aktif" value={activeClients.length} sub="Dari data client" />
        <StatCard label="Pipeline" value={pipeline.length} sub="Dari data pipeline" variant="accent" />
        <StatCard label="Ratio Closed" value={activeClients.length > 0 ? (pipeline.length / activeClients.length).toFixed(2) : '0'} sub="Pipeline ÷ Client Aktif" variant="gold" />
      </div>

      <InnerTabs tabs={tabs} active={tab} onTab={setTab} />

      {/* Client & Pipeline */}
      {tab === 'cp' && (
        <>
          <Card icon={<CheckCircle2 size={16} />} title="Client Aktif" actions={
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ status: 'Aktif' }); setEditId(null); setModal('client') }}>+ Tambah Client</button>
          }>
            <DataTable columns={[
              { key: 'nama', label: 'Nama Client' }, { key: 'layanan', label: 'Jenis Layanan' },
              { key: 'nilai', label: 'Nilai' }, { key: 'pic', label: 'PIC' },
              { key: 'prog', label: 'Progress Checklist' },
              { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
            ]}>
              {clients.map(c => {
                const clientTasks = checklist.filter(item => item.client_id === c.id)
                let pct = 0
                if (clientTasks.length > 0) {
                  const totalWeight = clientTasks.reduce((acc, item) => {
                    if (item.status === 'Selesai Acc') return acc + 100
                    if (item.status === 'Review Internal') return acc + 75
                    if (item.status === 'Proses Kerja') return acc + 50
                    return acc
                  }, 0)
                  pct = Math.round(totalWeight / clientTasks.length)
                }
                return (
                  <tr key={c.id}>
                    <Td>{c.nama}</Td><Td>{c.layanan}</Td>
                    <Td>Rp {Number(c.nilai).toLocaleString('id-ID')}</Td>
                    <Td>{c.pic}</Td>
                    <Td style={{ minWidth: 110 }}>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-[50px]">
                          <div className={`progress-fill ${pct >= 100 ? 'fill-success' : pct >= 50 ? 'fill-blue' : 'fill-accent'}`} style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-[0.8rem] font-semibold">{pct}%</span>
                      </div>
                    </Td>
                    <Td><Tag value={c.status} /></Td>
                    <ActionButtons onEdit={() => { setForm(c as any); setEditId(c.id); setModal('client') }} onDelete={() => delRow('b2b_clients', c.id)} />
                  </tr>
                )
              })}
            </DataTable>
          </Card>

          <Card icon={<RefreshCw size={16} />} title="Pipeline Client" actions={
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ stage: STAGE_B2B[0], prob: 0, score: 0 }); setEditId(null); setModal('pipeline') }}>+ Tambah Pipeline</button>
          }>
            <DataTable columns={[
              { key: 'nama', label: 'Nama Prospek' }, { key: 'layanan', label: 'Layanan' },
              { key: 'nilai', label: 'Est. Nilai' }, { key: 'pic', label: 'PIC' },
              { key: 'stage', label: 'Stage' }, { key: 'prob', label: 'Probability %' },
              { key: 'score', label: 'Lead Score' }, { key: 'ak', label: 'Aksi' },
            ]}>
              {pipeline.map(p => (
                <tr key={p.id}>
                  <Td>{p.nama}</Td><Td>{p.layanan}</Td>
                  <Td>Rp {Number(p.nilai).toLocaleString('id-ID')}</Td>
                  <Td>{p.pic}</Td><Td><Tag value={p.stage} /></Td>
                  <Td>{p.prob}%</Td>
                  <Td style={{ color: p.score >= 70 ? '#059669' : p.score >= 40 ? '#d97706' : '#64748b', fontWeight: 700 }}>{p.score}</Td>
                  <ActionButtons onEdit={() => { setForm(p as any); setEditId(p.id); setModal('pipeline') }} onDelete={() => delRow('b2b_pipeline', p.id)} />
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      )}

      {/* Checklist */}
      {tab === 'checklist' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
            <StatCard label="Total Milestone" value={checklist.length} sub="Semua tugas klien" />
            <StatCard label="Proses (Kerja & Review)" value={checklist.filter(item => ['Proses Kerja', 'Review Internal'].includes(item.status)).length} sub="Dalam pengerjaan" variant="blue" />
            {(() => {
              const totalTasks = checklist.length
              let pct = 0
              if (totalTasks > 0) {
                const totalWeight = checklist.reduce((acc, item) => {
                  if (item.status === 'Selesai Acc') return acc + 100
                  if (item.status === 'Review Internal') return acc + 75
                  if (item.status === 'Proses Kerja') return acc + 50
                  return acc
                }, 0)
                pct = Math.round(totalWeight / totalTasks)
              }
              return <StatCard label="Rata-rata Progress Checklist" value={`${pct}%`} sub="Bobot status gabungan" variant="gold" />
            })()}
          </div>
          <Card icon={<CheckCircle2 size={16} />} title="Milestone Checklist & Lampiran — Per Klien" actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setForm({ status: CHK_STATUS[0] }); setEditId(null); setModal('checklist') }}>+ Tambah Milestone</button>
          }>
            <DataTable columns={[
              { key: 'a', label: '!', width: 18 }, { key: 'client', label: 'Client' }, { key: 'task', label: 'Tugas / Milestone' },
              { key: 'date', label: 'Target Date' }, { key: 'status', label: 'Status' }, { key: 'link', label: 'Link' }, { key: 'ak', label: 'Aksi' },
            ]}>
              {checklist.map(item => {
                const a = alertLevel({ deadline: item.target_date, status: item.status !== 'Selesai Acc' ? 'Terbuka' : null })
                const client = clients.find(c => c.id === item.client_id)
                return (
                  <tr key={item.id} className={a.cls}>
                    <Td>{a.level === 2 ? <span className="alert-dot red" /> : a.level === 1 ? <span className="alert-dot amber" /> : null}</Td>
                    <Td>{client?.nama || '-'}</Td>
                    <Td>{item.task}</Td>
                    <Td>{item.target_date || '-'}</Td>
                    <Td><Tag value={item.status} /></Td>
                    <Td>{item.link ? <a href={item.link} target="_blank" rel="noreferrer" className="text-info text-[0.78rem] inline-flex items-center gap-1"><Link2 size={12} /> Link</a> : '-'}</Td>
                    <ActionButtons onEdit={() => { setForm(item as any); setEditId(item.id); setModal('checklist') }} onDelete={() => delRow('b2b_checklist', item.id)} />
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {/* Per-client progress */}
      {activeClients.map(c => tab === `prog-${c.id}` && (
        <Card key={c.id} icon={<Rocket size={16} />} title={`Progres End-to-End — ${c.nama}`} actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ status: PROGRES_STATUS[0] }); setEditId(null); setSelectedClient(c.id); setModal('progres') }}>+ Tambah Fase</button>
        }>
          <DataTable columns={[
            { key: 'fase', label: 'Fase / Proses' }, { key: 'ket', label: 'Keterangan Implementasi' },
            { key: 'tgl', label: 'Tanggal' }, { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
          ]}>
            {progres.filter(p => p.client_id === c.id).map(p => (
              <tr key={p.id}>
                <Td>{p.fase}</Td><Td>{p.keterangan}</Td>
                <Td>{p.tanggal || '-'}</Td><Td><Tag value={p.status} /></Td>
                <ActionButtons onEdit={() => { setForm(p as any); setEditId(p.id); setSelectedClient(c.id); setModal('progres') }} onDelete={() => delRow('b2b_progres', p.id)} />
              </tr>
            ))}
          </DataTable>
        </Card>
      ))}

      {/* Modals */}
      <Modal open={modal === 'client'} onClose={() => setModal(null)} title={editId ? 'Edit Client' : '+ Tambah Client'}>
        <FormGroup label="Nama Client"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <FormGroup label="Jenis Layanan"><FormInput value={form.layanan || ''} onChange={e => setForm(f => ({ ...f, layanan: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Nilai (Rp)"><FormInput type="number" value={form.nilai || 0} onChange={e => setForm(f => ({ ...f, nilai: e.target.value }))} /></FormGroup>
          <FormGroup label="PIC"><FormInput value={form.pic || ''} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status">
          <FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {CLIENT_STATUS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveClient}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'pipeline'} onClose={() => setModal(null)} title={editId ? 'Edit Pipeline' : '+ Tambah Pipeline'}>
        <FormGroup label="Nama Prospek"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <FormGroup label="Layanan"><FormInput value={form.layanan || ''} onChange={e => setForm(f => ({ ...f, layanan: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Est. Nilai"><FormInput type="number" value={form.nilai || 0} onChange={e => setForm(f => ({ ...f, nilai: e.target.value }))} /></FormGroup>
          <FormGroup label="PIC"><FormInput value={form.pic || ''} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))} /></FormGroup>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormGroup label="Stage"><FormSelect value={form.stage || ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>{STAGE_B2B.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
          <FormGroup label="Prob %"><FormInput type="number" value={form.prob || 0} onChange={e => setForm(f => ({ ...f, prob: e.target.value }))} /></FormGroup>
          <FormGroup label="Lead Score"><FormInput type="number" value={form.score || 0} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} /></FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={savePipeline}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'checklist'} onClose={() => setModal(null)} title={editId ? 'Edit Milestone' : '+ Tambah Milestone'}>
        <FormGroup label="Client">
          <FormSelect value={form.client_id || ''} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
            <option value="">-- Pilih Client --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Tugas / Milestone"><FormInput value={form.task || ''} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Target Date"><FormInput type="date" value={form.target_date || ''} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} /></FormGroup>
          <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{CHK_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        </div>
        <FormGroup label="Link Dokumen"><FormInput value={form.link || ''} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveChecklist}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'progres'} onClose={() => setModal(null)} title="+ Tambah Fase Progres">
        <FormGroup label="Fase / Proses"><FormInput value={form.fase || ''} onChange={e => setForm(f => ({ ...f, fase: e.target.value }))} placeholder="contoh: Kickoff, Delivery..." /></FormGroup>
        <FormGroup label="Keterangan Implementasi"><FormInput value={form.keterangan || ''} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Tanggal"><FormInput type="date" value={form.tanggal || ''} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></FormGroup>
          <FormGroup label="Status"><FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{PROGRES_STATUS.map(o => <option key={o}>{o}</option>)}</FormSelect></FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveProgres}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
