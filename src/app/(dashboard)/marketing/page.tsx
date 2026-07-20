'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Lead, ChannelCost, ContentTracking } from '@/types/database'
import Card from '@/components/ui/Card'
import { InnerTabs } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Modal, { FormGroup, FormInput, FormSelect, ModalActions, BtnPrimary, BtnOutline } from '@/components/ui/Modal'
import DataTable, { Td, ActionButtons } from '@/components/ui/DataTable'
import Tag from '@/components/ui/Tag'
import { formatRp, todayStr, scoreLead, tempLead, LEAD_CH, LEAD_STAGE, FUNNEL_STAGE, PLATFORM, CNT_STATUS } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmProvider'
import { Target, NotebookPen, Flame, CloudSun, Snowflake, Filter, Radio, Users, BarChart3 } from 'lucide-react'

export default function MarketingPage() {
  const confirm = useConfirm()
  const [tab, setTab] = useState('leads')
  const [leads, setLeads] = useState<Lead[]>([])
  const [channels, setChannels] = useState<ChannelCost[]>([])
  const [content, setContent] = useState<ContentTracking[]>([])
  const [modal, setModal] = useState<'lead' | 'channel' | 'content' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: l }, { data: c }, { data: cnt }] = await Promise.all([
      (supabase.from('leads') as any).select('*').order('created_at', { ascending: false }),
      (supabase.from('channel_cost') as any).select('*').order('channel'),
      (supabase.from('content_tracking') as any).select('*').order('created_at', { ascending: false }),
    ])
    setLeads(l || [])
    setChannels(c || [])
    setContent(cnt || [])
  }

  async function saveLead() {
    const p = {
      nama: form.nama || '',
      channel: form.channel || LEAD_CH[0],
      stage: form.stage || LEAD_STAGE[0],
      last_interaction: form.last_interaction || todayStr(),
      notes: form.notes || '',
    }
    if (editId) await (supabase.from('leads') as any).update(p).eq('id', editId)
    else await (supabase.from('leads') as any).insert(p)
    setModal(null); loadData()
  }

  async function saveChannel() {
    const p = { channel: form.channel || LEAD_CH[0], biaya: Number(form.biaya) || 0, leads_count: Number(form.leads_count) || 0 }
    if (editId) await (supabase.from('channel_cost') as any).update(p).eq('id', editId)
    else await (supabase.from('channel_cost') as any).insert(p)
    setModal(null); loadData()
  }

  async function saveContent() {
    const p = {
      judul: form.judul || '',
      platform: form.platform || PLATFORM[0],
      stage: form.stage || FUNNEL_STAGE[0],
      views: Number(form.views) || 0,
      engagement: Number(form.engagement) || 0,
      leads_gen: Number(form.leads_gen) || 0,
      status: form.status || CNT_STATUS[0],
    }
    if (editId) await (supabase.from('content_tracking') as any).update(p).eq('id', editId)
    else await (supabase.from('content_tracking') as any).insert(p)
    setModal(null); loadData()
  }

  async function delRow(table: string, id: string) {
    if (!await confirm('Apakah Anda yakin ingin menghapus data ini?')) return
    await (supabase.from(table as any) as any).delete().eq('id', id); loadData()
  }

  // Funnel counts
  const funnel: Record<string, number> = {}
  FUNNEL_STAGE.forEach(s => { funnel[s] = leads.filter(l => l.stage === s).length })

  // Lead temp breakdown
  const hot = leads.filter(l => tempLead(scoreLead(l)) === 'Hot').length
  const warm = leads.filter(l => tempLead(scoreLead(l)) === 'Warm').length
  const cold = leads.filter(l => tempLead(scoreLead(l)) === 'Cold').length

  return (
    <div>
      <InnerTabs
        tabs={[
          { key: 'leads', label: <span className="inline-flex items-center gap-1.5"><Target size={14} /> Leads & Scoring</span> },
          { key: 'funnel', label: <span className="inline-flex items-center gap-1.5"><Filter size={14} /> Funnel & Konversi</span> },
          { key: 'content', label: <span className="inline-flex items-center gap-1.5"><NotebookPen size={14} /> Konten TOFU/MOFU/BOFU</span> },
        ]}
        active={tab}
        onTab={setTab}
      />

      {/* ───────── LEADS TAB ───────── */}
      {tab === 'leads' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <StatCard label="Total Leads" value={String(leads.length)} sub="Semua lead aktif" variant="blue" />
            <StatCard label="Hot" value={String(hot)} sub="Score ≥ 70" accentColor="var(--danger)" icon={<Flame size={16} className="text-danger" />} />
            <StatCard label="Warm" value={String(warm)} sub="Score 40–69" accentColor="var(--warning)" icon={<CloudSun size={16} className="text-warning" />} />
            <StatCard label="Cold" value={String(cold)} sub="Score < 40" icon={<Snowflake size={16} className="text-muted" />} />
          </div>

          <Card icon={<Users size={16} />} title="Daftar Lead & Lead Score" actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setForm({ channel: LEAD_CH[0], stage: LEAD_STAGE[0], last_interaction: todayStr() }); setEditId(null); setModal('lead') }}>+ Tambah Lead</button>
          }>
            <DataTable columns={[
              { key: 'nama', label: 'Nama' }, { key: 'ch', label: 'Channel' }, { key: 'st', label: 'Stage' },
              { key: 'last', label: 'Last Interaction' }, { key: 'score', label: 'Score' },
              { key: 'temp', label: 'Suhu' }, { key: 'notes', label: 'Notes' }, { key: 'ak', label: 'Aksi' },
            ]}>
              {leads.map(l => {
                const score = scoreLead(l)
                const temp = tempLead(score)
                return (
                  <tr key={l.id}>
                    <Td><strong>{l.nama}</strong></Td>
                    <Td><Tag value={l.channel} /></Td>
                    <Td><Tag value={l.stage} /></Td>
                    <Td>{l.last_interaction}</Td>
                    <Td>
                      <span className={`font-bold text-[1.05em] ${temp === 'Hot' ? 'text-danger' : temp === 'Warm' ? 'text-warning' : 'text-muted'}`}>
                        {score}
                      </span>
                    </Td>
                    <Td>
                      <span className={`tag ${temp === 'Hot' ? 'tag-danger' : temp === 'Warm' ? 'tag-warning' : 'tag-primary'}`}>{temp}</span>
                    </Td>
                    <Td>{l.notes || '-'}</Td>
                    <ActionButtons
                      onEdit={() => { setForm(l as any); setEditId(l.id); setModal('lead') }}
                      onDelete={() => delRow('leads', l.id)}
                    />
                  </tr>
                )
              })}
            </DataTable>
          </Card>

          <Card icon={<Radio size={16} />} title="Cost per Channel & CPL" actions={
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ channel: LEAD_CH[0] }); setEditId(null); setModal('channel') }}>+ Tambah Channel</button>
          }>
            <DataTable columns={[{ key: 'ch', label: 'Channel' }, { key: 'biaya', label: 'Biaya (Rp)' }, { key: 'leads', label: 'Leads' }, { key: 'cpl', label: 'CPL' }, { key: 'ak', label: 'Aksi' }]}>
              {channels.map(c => {
                const cpl = c.leads_count > 0 ? Math.round(Number(c.biaya) / c.leads_count) : 0
                return (
                  <tr key={c.id}>
                    <Td><strong>{c.channel}</strong></Td>
                    <Td>{formatRp(Number(c.biaya))}</Td>
                    <Td>{c.leads_count}</Td>
                    <Td><span className="font-bold">{c.leads_count > 0 ? formatRp(cpl) : '-'}</span></Td>
                    <ActionButtons
                      onEdit={() => { setForm(c as any); setEditId(c.id); setModal('channel') }}
                      onDelete={() => delRow('channel_cost', c.id)}
                    />
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {/* ───────── FUNNEL TAB ───────── */}
      {tab === 'funnel' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-4">
            {FUNNEL_STAGE.map(s => (
              <div key={s} className="bg-white border border-border rounded-xl py-4 px-3.5 text-center">
                <div className="text-[1.6rem] font-extrabold text-accent">{funnel[s] || 0}</div>
                <div className="text-xs font-semibold mt-1">{s}</div>
                {FUNNEL_STAGE.indexOf(s) > 0 && funnel[FUNNEL_STAGE[FUNNEL_STAGE.indexOf(s) - 1]] > 0 && (
                  <div className="text-[0.7rem] text-muted mt-0.5">
                    {Math.round((funnel[s] / funnel[FUNNEL_STAGE[FUNNEL_STAGE.indexOf(s) - 1]]) * 100)}% konversi
                  </div>
                )}
              </div>
            ))}
          </div>

          <Card icon={<BarChart3 size={16} />} title="Distribusi Leads per Channel">
            <DataTable columns={[{ key: 'ch', label: 'Channel' }, ...FUNNEL_STAGE.map(s => ({ key: s, label: s })), { key: 'total', label: 'Total' }]}>
              {LEAD_CH.map(ch => {
                const chLeads = leads.filter(l => l.channel === ch)
                if (chLeads.length === 0) return null
                return (
                  <tr key={ch}>
                    <Td><Tag value={ch} /></Td>
                    {FUNNEL_STAGE.map(s => <Td key={s}>{chLeads.filter(l => l.stage === s).length || '-'}</Td>)}
                    <Td><strong>{chLeads.length}</strong></Td>
                  </tr>
                )
              })}
            </DataTable>
          </Card>
        </div>
      )}

      {/* ───────── CONTENT TAB ───────── */}
      {tab === 'content' && (
        <Card icon={<NotebookPen size={16} />} title="Content Tracking TOFU/MOFU/BOFU" actions={
          <button className="btn btn-primary btn-sm" onClick={() => { setForm({ platform: PLATFORM[0], stage: FUNNEL_STAGE[0], status: CNT_STATUS[0] }); setEditId(null); setModal('content') }}>+ Tambah Konten</button>
        }>
          <DataTable columns={[
            { key: 'judul', label: 'Judul' }, { key: 'platform', label: 'Platform' },
            { key: 'stage', label: 'Stage' }, { key: 'views', label: 'Views' },
            { key: 'eng', label: 'Engagement' }, { key: 'leads', label: 'Leads Gen' },
            { key: 'status', label: 'Status' }, { key: 'ak', label: 'Aksi' },
          ]}>
            {content.map(c => (
              <tr key={c.id}>
                <Td><strong>{c.judul}</strong></Td>
                <Td><Tag value={c.platform} /></Td>
                <Td><span className={`tag ${c.stage.startsWith('TOFU') ? 'tag-info' : c.stage.startsWith('MOFU') ? 'tag-warning' : 'tag-success'}`}>{c.stage}</span></Td>
                <Td>{c.views.toLocaleString('id-ID')}</Td>
                <Td>{c.engagement.toLocaleString('id-ID')}</Td>
                <Td><span className="font-bold text-accent">{c.leads_gen}</span></Td>
                <Td><Tag value={c.status} /></Td>
                <ActionButtons
                  onEdit={() => { setForm(c as any); setEditId(c.id); setModal('content') }}
                  onDelete={() => delRow('content_tracking', c.id)}
                />
              </tr>
            ))}
          </DataTable>
        </Card>
      )}

      {/* ───────── MODALS ───────── */}
      <Modal open={modal === 'lead'} onClose={() => setModal(null)} title={editId ? 'Edit Lead' : '+ Tambah Lead'}>
        <FormGroup label="Nama Lead"><FormInput value={form.nama || ''} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Channel">
            <FormSelect value={form.channel || ''} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
              {LEAD_CH.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Stage">
            <FormSelect value={form.stage || ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {LEAD_STAGE.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
        </div>
        <FormGroup label="Last Interaction"><FormInput type="date" value={form.last_interaction || ''} onChange={e => setForm(f => ({ ...f, last_interaction: e.target.value }))} /></FormGroup>
        <FormGroup label="Notes"><FormInput value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveLead}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'channel'} onClose={() => setModal(null)} title={editId ? 'Edit Channel' : '+ Tambah Channel'}>
        <FormGroup label="Channel">
          <FormSelect value={form.channel || ''} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
            {LEAD_CH.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Biaya (Rp)"><FormInput type="number" value={form.biaya || 0} onChange={e => setForm(f => ({ ...f, biaya: e.target.value }))} /></FormGroup>
          <FormGroup label="Jumlah Leads"><FormInput type="number" value={form.leads_count || 0} onChange={e => setForm(f => ({ ...f, leads_count: e.target.value }))} /></FormGroup>
        </div>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveChannel}>Simpan</BtnPrimary></ModalActions>
      </Modal>

      <Modal open={modal === 'content'} onClose={() => setModal(null)} title={editId ? 'Edit Konten' : '+ Tambah Konten'}>
        <FormGroup label="Judul Konten"><FormInput value={form.judul || ''} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} /></FormGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Platform">
            <FormSelect value={form.platform || ''} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
              {PLATFORM.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Stage TOFU/MOFU/BOFU">
            <FormSelect value={form.stage || ''} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
              {FUNNEL_STAGE.map(o => <option key={o}>{o}</option>)}
            </FormSelect>
          </FormGroup>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormGroup label="Views"><FormInput type="number" value={form.views || 0} onChange={e => setForm(f => ({ ...f, views: e.target.value }))} /></FormGroup>
          <FormGroup label="Engagement"><FormInput type="number" value={form.engagement || 0} onChange={e => setForm(f => ({ ...f, engagement: e.target.value }))} /></FormGroup>
          <FormGroup label="Leads Gen"><FormInput type="number" value={form.leads_gen || 0} onChange={e => setForm(f => ({ ...f, leads_gen: e.target.value }))} /></FormGroup>
        </div>
        <FormGroup label="Status">
          <FormSelect value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {CNT_STATUS.map(o => <option key={o}>{o}</option>)}
          </FormSelect>
        </FormGroup>
        <ModalActions><BtnOutline onClick={() => setModal(null)}>Batal</BtnOutline><BtnPrimary onClick={saveContent}>Simpan</BtnPrimary></ModalActions>
      </Modal>
    </div>
  )
}
