'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { formatRp, scoreLead, tempLead, daysSince, BULAN } from '@/lib/utils'

export default function HomeClient() {
  const [stats, setStats] = useState({
    klienAktif: 0, revenueBulanIni: 0, posisiTerpenuhi: '0%',
    coursePipeline: 0, hotLeadsOverdue: 0, runway: '∞', netBurn: 0,
    targetRevenue: 0, realisasiRevenue: 0, checklistOverdue: 0,
  })
  const [actionItems, setActionItems] = useState<{ lvl: number; icon: string; txt: string; act: string; href: string }[]>([])
  const [targetPerDivisi, setTargetPerDivisi] = useState<{ divisi: string; pct: number; target: number; real: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [
      { data: clients },
      { data: rekrutmen },
      { data: batches_off },
      { data: batches_on },
      { data: leads },
      { data: forecast },
      { data: cashflow },
      { data: checklist },
      { data: kritis },
      { data: mitigasi },
    ] = await Promise.all([
      (supabase.from('b2b_clients') as any).select('*'),
      (supabase.from('rekrutmen') as any).select('*'),
      (supabase.from('batch_offline') as any).select('status'),
      (supabase.from('batch_online') as any).select('status'),
      (supabase.from('leads') as any).select('*'),
      (supabase.from('forecast') as any).select('*'),
      (supabase.from('cashflow') as any).select('*'),
      (supabase.from('b2b_checklist') as any).select('*'),
      (supabase.from('kritis') as any).select('*'),
      (supabase.from('mitigasi') as any).select('*'),
    ])

    // KPIs
    const klienAktif = (clients || []).filter((c: any) => c.status === 'Aktif').length
    const total = (rekrutmen || []).length
    const terp = (rekrutmen || []).filter((r: any) => r.tahap === 'Selesai').length
    const posisiTerpenuhi = total ? Math.round(terp / total * 100) + '%' : '0%'

    const allBatches = [...(batches_off || []), ...(batches_on || [])]
    const coursePipeline = allBatches.filter((b: any) => ['Pipeline','Akan Datang'].includes(b.status)).length

    // Revenue this month
    const thisMonth = new Date().toISOString().slice(0, 7)
    const revBulanIni = (cashflow || [])
      .filter((c: any) => c.tanggal.startsWith(thisMonth) && c.tipe === 'Revenue')
      .reduce((s: number, c: any) => s + Number(c.nominal), 0)

    // Hot leads overdue
    let hotOver = 0
    ;(leads || []).forEach((l: any) => {
      const s = scoreLead({ channel: l.channel, last_interaction: l.last_interaction, stage: l.stage })
      const t = tempLead(s)
      const d = daysSince(l.last_interaction)
      if (t === 'Hot' && d != null && d > 7 && l.stage !== 'Deal' && l.stage !== 'Lost') hotOver++
    })

    // Forecast totals
    const totalTarget = (forecast || []).reduce((s: number, r: any) => s + Number(r.target), 0)
    const totalReal = (forecast || []).reduce((s: number, r: any) => s + Number(r.real), 0)

    // Per divisi target
    const map: Record<string, { target: number; real: number }> = {}
    ;(forecast || []).forEach((r: any) => {
      if (!map[r.divisi]) map[r.divisi] = { target: 0, real: 0 }
      map[r.divisi].target += Number(r.target)
      map[r.divisi].real += Number(r.real)
    })
    const perDivisi = Object.entries(map).map(([divisi, v]: any) => ({
      divisi, pct: v.target ? Math.round(v.real / v.target * 100) : 0,
      target: v.target, real: v.real,
    }))

    // Checklist overdue
    const today = new Date()
    const chkOverdue = (checklist || []).filter((c: any) => {
      if (c.status === 'Selesai Acc' || !c.target_date) return false
      return new Date(c.target_date) < today
    }).length

    // Burn / runway
    const byMonth: Record<string, { rev: number; exp: number }> = {}
    ;(cashflow || []).forEach((c: any) => {
      const mk = c.tanggal.slice(0, 7)
      if (!byMonth[mk]) byMonth[mk] = { rev: 0, exp: 0 }
      if (c.tipe === 'Revenue') byMonth[mk].rev += Number(c.nominal)
      else byMonth[mk].exp += Number(c.nominal)
    })
    const months = Object.keys(byMonth).sort().slice(-3)
    let netSum = 0
    months.forEach(m => { netSum += byMonth[m].exp - byMonth[m].rev })
    const avgNet = months.length ? netSum / months.length : 0

    // Action center
    const items: typeof actionItems = []
    if (hotOver > 0) items.push({ lvl: 2, icon: '🔥', txt: `${hotOver} Hot lead diam > 7 hari`, act: 'Follow-up hari ini', href: '/marketing' })
    if (chkOverdue > 0) items.push({ lvl: 2, icon: '✅', txt: `${chkOverdue} milestone B2B overdue`, act: 'Tinjau checklist B2B', href: '/b2b-internal' })
    ;(kritis || []).forEach((r: any) => {
      if (r.deadline && new Date(r.deadline) < today)
        items.push({ lvl: 2, icon: '🚨', txt: `Posisi kritis "${r.posisi}" melewati deadline`, act: 'Headhunter → Posisi Kritis', href: '/headhunter' })
    })
    ;(mitigasi || []).filter((r: any) => r.status === 'Terbuka').slice(0, 3).forEach((r: any) => {
      items.push({ lvl: 1, icon: '🛡️', txt: `Resiko "${r.risiko}" belum ditangani`, act: 'Mitigasi Resiko', href: '/mitigasi' })
    })

    setStats({
      klienAktif, revenueBulanIni: revBulanIni, posisiTerpenuhi,
      coursePipeline, hotLeadsOverdue: hotOver,
      runway: avgNet > 0 ? (0 / avgNet).toFixed(1) + ' bln' : '∞',
      netBurn: avgNet, targetRevenue: totalTarget, realisasiRevenue: totalReal,
      checklistOverdue: chkOverdue,
    })
    setActionItems(items.sort((a, b) => b.lvl - a.lvl))
    setTargetPerDivisi(perDivisi)
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Memuat data...</div>

  return (
    <div>
      {/* Promise Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent2) 100%)',
        borderRadius: 14, padding: '28px 32px', color: '#fff', marginBottom: 22,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8, fontWeight: 700 }}>
          💎 Janji Neuverse
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 12 }}>Komitmen Tim Kami</div>
        <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxWidth: 680, fontStyle: 'italic' }}>
          "Kami tim Neuverse berkomitmen untuk selalu mendengarkan kebutuhan klien, memberikan solusi pelatihan yang berdampak, dan bekerja sama sebagai satu kesatuan tim yang tangguh demi mencapai keunggulan layanan."
        </div>
      </div>

      {/* Action Center */}
      <Card
        icon="🚨"
        title={`Pusat Tindakan — Management by Exception (${actionItems.length})`}
        style={{ borderLeft: actionItems.some(i => i.lvl === 2) ? '4px solid var(--danger)' : actionItems.length ? '4px solid var(--warning)' : '4px solid var(--success)' }}
      >
        {actionItems.length === 0 ? (
          <div style={{ padding: '14px', color: 'var(--success)', fontWeight: 600 }}>✅ Tidak ada yang membutuhkan tindakan segera. Semua sehat.</div>
        ) : (
          actionItems.map((it, i) => (
            <a key={i} href={it.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'start', gap: 12, padding: '10px 12px',
                borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                background: it.lvl === 2 ? '#fff1f0' : '#fffbe6',
                borderLeft: `3px solid ${it.lvl === 2 ? 'var(--danger)' : 'var(--warning)'}`,
              }}>
                <span style={{ fontSize: '1.1rem', marginTop: 2 }}>{it.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{it.txt}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>→ {it.act}</div>
                </div>
                <span className={`tag ${it.lvl === 2 ? 'tag-danger' : 'tag-warning'}`}>
                  {it.lvl === 2 ? 'Mendesak' : 'Perhatian'}
                </span>
              </div>
            </a>
          ))
        )}
      </Card>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="Total Klien Aktif" value={stats.klienAktif} sub="B2B Internal + Eksternal" variant="accent" />
        <StatCard label="Revenue Bulan Ini" value={formatRp(stats.revenueBulanIni)} sub="Dari Finance" variant="blue" />
        <StatCard label="Posisi Terpenuhi" value={stats.posisiTerpenuhi} sub="Dari Headhunter" variant="gold" />
        <StatCard label="Course Pipeline" value={stats.coursePipeline} sub="Dari Courses" accentColor="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        <StatCard label="🫀 Runway" value={stats.netBurn > 0 ? (0 / stats.netBurn).toFixed(1) + ' bln' : '∞'} sub="Sisa bulan operasional" accentColor="var(--danger)" />
        <StatCard label="📉 Net Burn / Bln" value={stats.netBurn > 0 ? formatRp(Math.round(stats.netBurn)) : 'Surplus'} sub="Rata-rata 3 bln" />
        <StatCard label="🔥 Hot Leads Overdue" value={stats.hotLeadsOverdue} sub="Butuh follow-up" accentColor="var(--warning)" />
      </div>

      {/* Target & Capaian */}
      <Card icon="🎯" title="Target & Capaian (berdasarkan Forecasting)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
          <StatCard label="Target Revenue" value={formatRp(stats.targetRevenue)} sub="Total forecast" />
          <StatCard label="Capaian Revenue" value={formatRp(stats.realisasiRevenue)} sub="Realisasi" />
          <StatCard
            label="% Capaian Target"
            value={stats.targetRevenue ? Math.round(stats.realisasiRevenue / stats.targetRevenue * 100) + '%' : '0%'}
            sub="Realisasi ÷ Target"
            accentColor="var(--success)"
          />
        </div>
        {targetPerDivisi.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 14, color: 'var(--muted)', fontSize: '0.82rem' }}>
            Belum ada data forecasting. Isi di tab Forecasting.
          </div>
        ) : (
          targetPerDivisi.map(d => (
            <div key={d.divisi} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                <span>{d.divisi}</span>
                <span style={{ fontWeight: 700, color: d.pct >= 100 ? 'var(--success)' : d.pct >= 60 ? 'var(--accent2)' : 'var(--accent)' }}>
                  {d.pct}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${d.pct >= 100 ? 'fill-success' : d.pct >= 60 ? 'fill-blue' : 'fill-accent'}`}
                  style={{ width: Math.min(100, d.pct) + '%' }}
                />
              </div>
            </div>
          ))
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <StatCard label="✅ Checklist Overdue" value={stats.checklistOverdue} sub="Milestone B2B lewat target" accentColor="var(--accent2)" />
        <StatCard label="📊 Total Klien" value={stats.klienAktif} sub="Aktif saat ini" />
        <StatCard label="📈 Courses" value={stats.coursePipeline} sub="Pipeline & Akan Datang" />
      </div>
    </div>
  )
}
