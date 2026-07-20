'use client'
import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { formatRp, scoreLead, tempLead, daysSince, BULAN } from '@/lib/utils'
import {
  Flame, CheckCircle2, AlertTriangle, ShieldAlert, Target, BarChart3,
  TrendingUp, TrendingDown, HeartPulse, Gem,
} from 'lucide-react'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'] as const

export default function HomeClient() {
  const [stats, setStats] = useState({
    klienAktif: 0, revenueBulanIni: 0, posisiTerpenuhi: '0%',
    coursePipeline: 0, hotLeadsOverdue: 0, runway: '∞', netBurn: 0,
    targetRevenue: 0, realisasiRevenue: 0, checklistOverdue: 0,
  })
  const [actionItems, setActionItems] = useState<{ lvl: number; icon: ReactNode; txt: string; act: string; href: string }[]>([])
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
      { data: settings },
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
      (supabase.from('settings') as any).select('*').eq('key', 'saldo_awal').single(),
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

    // Per divisi target/real (bug fix: Forecast rows have no target/real fields —
    // target = sum of this year's 12 month columns; real = this year's cashflow Revenue by divisi)
    const thisYear = new Date().getFullYear()
    const map: Record<string, { target: number; real: number }> = {}
    ;(forecast || []).filter((r: any) => r.tahun === thisYear).forEach((r: any) => {
      if (!map[r.divisi]) map[r.divisi] = { target: 0, real: 0 }
      map[r.divisi].target += MONTH_KEYS.reduce((s, mk) => s + Number(r[mk] || 0), 0)
    })
    ;(cashflow || [])
      .filter((c: any) => c.tipe === 'Revenue' && c.tanggal.slice(0, 4) === String(thisYear))
      .forEach((c: any) => {
        const d = c.divisi || ''
        if (!map[d]) map[d] = { target: 0, real: 0 }
        map[d].real += Number(c.nominal)
      })
    const perDivisi = Object.entries(map).map(([divisi, v]: any) => ({
      divisi, pct: v.target ? Math.round(v.real / v.target * 100) : 0,
      target: v.target, real: v.real,
    }))
    const totalTarget = perDivisi.reduce((s, v) => s + v.target, 0)
    const totalReal = perDivisi.reduce((s, v) => s + v.real, 0)

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

    // Kas saat ini (bug fix: was using 0 instead of actual cash-on-hand; same formula as Finance page)
    const saldoAwal = settings ? Number(settings.value) || 0 : 0
    const totalRev = (cashflow || []).filter((c: any) => c.tipe === 'Revenue').reduce((s: number, c: any) => s + Number(c.nominal), 0)
    const totalExp = (cashflow || []).filter((c: any) => c.tipe !== 'Revenue').reduce((s: number, c: any) => s + Number(c.nominal), 0)
    const kasSaatIni = saldoAwal + totalRev - totalExp

    // Action center
    const items: typeof actionItems = []
    if (hotOver > 0) items.push({ lvl: 2, icon: <Flame size={16} />, txt: `${hotOver} Hot lead diam > 7 hari`, act: 'Follow-up hari ini', href: '/marketing' })
    if (chkOverdue > 0) items.push({ lvl: 2, icon: <CheckCircle2 size={16} />, txt: `${chkOverdue} milestone B2B overdue`, act: 'Tinjau checklist B2B', href: '/b2b-internal' })
    ;(kritis || []).forEach((r: any) => {
      if (r.deadline && new Date(r.deadline) < today)
        items.push({ lvl: 2, icon: <AlertTriangle size={16} />, txt: `Posisi kritis "${r.posisi}" melewati deadline`, act: 'Headhunter → Posisi Kritis', href: '/headhunter' })
    })
    ;(mitigasi || []).filter((r: any) => r.status === 'Terbuka').slice(0, 3).forEach((r: any) => {
      items.push({ lvl: 1, icon: <ShieldAlert size={16} />, txt: `Resiko "${r.risiko}" belum ditangani`, act: 'Mitigasi Resiko', href: '/mitigasi' })
    })

    setStats({
      klienAktif, revenueBulanIni: revBulanIni, posisiTerpenuhi,
      coursePipeline, hotLeadsOverdue: hotOver,
      runway: avgNet > 0 ? (kasSaatIni / avgNet).toFixed(1) + ' bln' : '∞',
      netBurn: avgNet, targetRevenue: totalTarget, realisasiRevenue: totalReal,
      checklistOverdue: chkOverdue,
    })
    setActionItems(items.sort((a, b) => b.lvl - a.lvl))
    setTargetPerDivisi(perDivisi)
    setLoading(false)
  }

  if (loading) return <div className="p-10 text-center text-muted">Memuat data...</div>

  return (
    <div>
      {/* Promise Banner */}
      <div className="bg-gradient-to-br from-primary to-accent-hover rounded-2xl px-8 py-7 text-white mb-[22px] relative overflow-hidden">
        <div className="flex items-center gap-1.5 text-[0.65rem] tracking-[3px] uppercase text-warning mb-2 font-bold">
          <Gem size={12} /> Janji Neuverse
        </div>
        <div className="text-[1.3rem] font-extrabold mb-3">Komitmen Tim Kami</div>
        <div className="text-[0.88rem] leading-[1.7] text-white/85 max-w-[680px] italic">
          "Kami tim Neuverse berkomitmen untuk selalu mendengarkan kebutuhan klien, memberikan solusi pelatihan yang berdampak, dan bekerja sama sebagai satu kesatuan tim yang tangguh demi mencapai keunggulan layanan."
        </div>
      </div>

      {/* Action Center */}
      <Card
        icon={<AlertTriangle size={16} />}
        title={`Pusat Tindakan — Management by Exception (${actionItems.length})`}
        style={{ borderLeft: actionItems.some(i => i.lvl === 2) ? '4px solid var(--danger)' : actionItems.length ? '4px solid var(--warning)' : '4px solid var(--success)' }}
      >
        {actionItems.length === 0 ? (
          <div className="flex items-center gap-2 p-3.5 text-success font-semibold">
            <CheckCircle2 size={16} /> Tidak ada yang membutuhkan tindakan segera. Semua sehat.
          </div>
        ) : (
          actionItems.map((it, i) => (
            <a key={i} href={it.href} className="no-underline">
              <div
                className={`flex items-start gap-3 px-3 py-2.5 rounded-[10px] mb-2 cursor-pointer border-l-[3px] ${
                  it.lvl === 2 ? 'bg-[#fff1f0] border-l-danger' : 'bg-[#fffbe6] border-l-warning'
                }`}
              >
                <span className="mt-0.5 text-muted">{it.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-[0.85rem] text-primary">{it.txt}</div>
                  <div className="text-[0.72rem] text-muted">→ {it.act}</div>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-[18px]">
        <StatCard label="Total Klien Aktif" value={stats.klienAktif} sub="B2B Internal + Eksternal" variant="accent" />
        <StatCard label="Revenue Bulan Ini" value={formatRp(stats.revenueBulanIni)} sub="Dari Finance" variant="blue" />
        <StatCard label="Posisi Terpenuhi" value={stats.posisiTerpenuhi} sub="Dari Headhunter" variant="gold" />
        <StatCard label="Course Pipeline" value={stats.coursePipeline} sub="Dari Courses" accentColor="var(--success)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-[18px]">
        <StatCard label="Runway" value={stats.runway} sub="Sisa bulan operasional" accentColor="var(--danger)" icon={<HeartPulse size={18} />} />
        <StatCard label="Net Burn / Bln" value={stats.netBurn > 0 ? formatRp(Math.round(stats.netBurn)) : 'Surplus'} sub="Rata-rata 3 bln" icon={<TrendingDown size={18} />} />
        <StatCard label="Hot Leads Overdue" value={stats.hotLeadsOverdue} sub="Butuh follow-up" accentColor="var(--warning)" icon={<Flame size={18} />} />
      </div>

      {/* Target & Capaian */}
      <Card icon={<Target size={16} />} title="Target & Capaian (berdasarkan Forecasting)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
          <div className="text-center py-3.5 text-muted text-[0.82rem]">
            Belum ada data forecasting. Isi di tab Forecasting.
          </div>
        ) : (
          targetPerDivisi.map(d => (
            <div key={d.divisi} className="mb-3">
              <div className="flex justify-between text-[0.78rem] mb-1">
                <span>{d.divisi}</span>
                <span className={`font-bold ${d.pct >= 100 ? 'text-success' : d.pct >= 60 ? 'text-info' : 'text-accent'}`}>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Checklist Overdue" value={stats.checklistOverdue} sub="Milestone B2B lewat target" accentColor="var(--accent-hover)" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Total Klien" value={stats.klienAktif} sub="Aktif saat ini" icon={<BarChart3 size={18} />} />
        <StatCard label="Courses" value={stats.coursePipeline} sub="Pipeline & Akan Datang" icon={<TrendingUp size={18} />} />
      </div>
    </div>
  )
}
