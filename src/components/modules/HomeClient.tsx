'use client'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase/client'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { formatRp, BULAN, tempLead } from '@/lib/utils'
import {
  Flame, CheckCircle2, AlertTriangle, ShieldAlert, Target, BarChart3,
  TrendingUp, TrendingDown, HeartPulse, Gem, Clock, CalendarDays, ChevronLeft, ChevronRight,
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'] as const
const CHART_COLORS = { accent: '#4f46e5', success: '#059669', danger: '#dc2626', warning: '#d97706', info: '#0284c7', muted: '#94a3b8' }
const DOUGHNUT_PALETTE = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#dc2626', '#94a3b8']

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
function parseMonthKey(mk: string) {
  const [y, m] = mk.split('-').map(Number)
  return { year: y, monthIdx: m - 1 }
}
function lastNMonths(n: number): string[] {
  const now = new Date()
  const arr: string[] = []
  for (let i = n - 1; i >= 0; i--) arr.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
  return arr
}
function monthLabel(mk: string) {
  const { year, monthIdx } = parseMonthKey(mk)
  return `${BULAN[monthIdx]} ${year}`
}

// ── Widget kecil: jam & kalender ──────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <Card>
      <div className="flex items-center gap-2 text-muted mb-2">
        <Clock size={14} />
        <span className="text-[0.7rem] uppercase tracking-wide font-semibold">Waktu Sekarang</span>
      </div>
      <div className="text-2xl font-extrabold text-primary tabular-nums">
        {now ? now.toLocaleTimeString('id-ID') : '--:--:--'}
      </div>
      <div className="text-[0.78rem] text-muted mt-1">
        {now ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
      </div>
    </Card>
  )
}

function MiniCalendar() {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const isCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth()

  return (
    <Card>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-muted">
          <CalendarDays size={14} />
          <span className="text-[0.7rem] uppercase tracking-wide font-semibold">{BULAN[view.month]} {view.year}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-muted">
            <ChevronLeft size={13} />
          </button>
          <button onClick={() => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-muted">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
          <div key={i} className="text-[0.62rem] text-muted font-semibold py-1">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`text-[0.72rem] py-1 rounded-md ${
              day && isCurrentMonth && day === today.getDate()
                ? 'bg-accent text-white font-bold'
                : day ? 'text-text' : ''
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function HomeClient() {
  const monthOptions = useMemo(() => lastNMonths(12), [])
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[monthOptions.length - 1])

  const [stats, setStats] = useState({
    klienAktif: 0, revenueBulanIni: 0, posisiTerpenuhi: '0%',
    coursePipeline: 0, hotLeadsOverdue: 0, runway: '∞', netBurn: 0,
    targetRevenue: 0, realisasiRevenue: 0, checklistOverdue: 0,
  })
  const [actionItems, setActionItems] = useState<{ lvl: number; icon: ReactNode; txt: string; act: string; href: string }[]>([])
  const [targetPerDivisi, setTargetPerDivisi] = useState<{ divisi: string; pct: number; target: number; real: number }[]>([])
  const [trendData, setTrendData] = useState<{ labels: string[]; revenue: number[]; expense: number[] }>({ labels: [], revenue: [], expense: [] })
  const [leadChannelData, setLeadChannelData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll(selectedMonth) }, [selectedMonth])

  async function loadAll(mk: string) {
    setLoading(true)
    const { year, monthIdx } = parseMonthKey(mk)
    const monthStart = new Date(year, monthIdx, 1)
    const monthEndRaw = new Date(year, monthIdx + 1, 0)
    const today = new Date()
    const reference = monthEndRaw > today ? today : monthEndRaw

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
      (supabase.from('batch_offline') as any).select('*'),
      (supabase.from('batch_online') as any).select('*'),
      (supabase.from('leads') as any).select('*'),
      (supabase.from('forecast') as any).select('*'),
      (supabase.from('cashflow') as any).select('*'),
      (supabase.from('b2b_checklist') as any).select('*'),
      (supabase.from('kritis') as any).select('*'),
      (supabase.from('mitigasi') as any).select('*'),
      (supabase.from('settings') as any).select('*').eq('key', 'saldo_awal').single(),
    ])

    // Klien Aktif — tidak ada field tanggal di b2b_clients, jadi selalu status "saat ini" (tidak bisa difilter per bulan)
    const klienAktif = (clients || []).filter((c: any) => c.status === 'Aktif').length

    // Posisi Terpenuhi — posisi yang sudah mulai per akhir bulan terpilih; terpenuhi = selesai pada/sebelum bulan itu
    const rekAktif = (rekrutmen || []).filter((r: any) => r.mulai && new Date(r.mulai) <= reference)
    const rekSelesai = rekAktif.filter((r: any) => r.tahap === 'Selesai' && r.selesai && new Date(r.selesai) <= reference)
    const posisiTerpenuhi = rekAktif.length ? Math.round(rekSelesai.length / rekAktif.length * 100) + '%' : '0%'

    // Course Pipeline — batch berstatus Pipeline/Akan Datang yang dijadwalkan pada bulan terpilih
    const allBatches = [...(batches_off || []), ...(batches_on || [])]
    const coursePipeline = allBatches.filter((b: any) =>
      ['Pipeline', 'Akan Datang'].includes(b.status) && b.tanggal && new Date(b.tanggal) >= monthStart && new Date(b.tanggal) <= monthEndRaw
    ).length

    // Revenue bulan terpilih
    const revBulanIni = (cashflow || [])
      .filter((c: any) => c.tanggal >= monthKeyDate(monthStart) && c.tanggal <= monthKeyDate(monthEndRaw) && c.tipe === 'Revenue')
      .reduce((s: number, c: any) => s + Number(c.nominal), 0)

    // Hot leads overdue — dievaluasi relatif ke akhir bulan terpilih (atau hari ini kalau bulan berjalan)
    let hotOver = 0
    ;(leads || []).forEach((l: any) => {
      if (!l.last_interaction || new Date(l.last_interaction) > reference) return
      const days = Math.floor((reference.getTime() - new Date(l.last_interaction).getTime()) / 86400000)
      const score = leadScoreAt(l, days)
      if (tempLead(score) === 'Hot' && days > 7 && l.stage !== 'Deal' && l.stage !== 'Lost') hotOver++
    })

    // Target/Realisasi per divisi — untuk bulan terpilih spesifik
    const map: Record<string, { target: number; real: number }> = {}
    ;(forecast || []).filter((r: any) => r.tahun === year).forEach((r: any) => {
      if (!map[r.divisi]) map[r.divisi] = { target: 0, real: 0 }
      map[r.divisi].target += Number(r[MONTH_KEYS[monthIdx]] || 0)
    })
    ;(cashflow || [])
      .filter((c: any) => c.tipe === 'Revenue' && c.tanggal >= monthKeyDate(monthStart) && c.tanggal <= monthKeyDate(monthEndRaw))
      .forEach((c: any) => {
        const d = c.divisi || ''
        if (!map[d]) map[d] = { target: 0, real: 0 }
        map[d].real += Number(c.nominal)
      })
    const perDivisi = Object.entries(map).map(([divisi, v]: any) => ({
      divisi, pct: v.target ? Math.round(v.real / v.target * 100) : 0, target: v.target, real: v.real,
    }))
    const totalTarget = perDivisi.reduce((s, v) => s + v.target, 0)
    const totalReal = perDivisi.reduce((s, v) => s + v.real, 0)

    // Checklist overdue — relatif ke akhir bulan terpilih
    const chkOverdue = (checklist || []).filter((c: any) => {
      if (c.status === 'Selesai Acc' || !c.target_date) return false
      return new Date(c.target_date) <= reference && new Date(c.target_date) < today
    }).length

    // Burn / Runway — rata-rata 3 bulan kalender berakhir di bulan terpilih
    const byMonth: Record<string, { rev: number; exp: number }> = {}
    ;(cashflow || []).forEach((c: any) => {
      const k = c.tanggal.slice(0, 7)
      if (!byMonth[k]) byMonth[k] = { rev: 0, exp: 0 }
      if (c.tipe === 'Revenue') byMonth[k].rev += Number(c.nominal)
      else byMonth[k].exp += Number(c.nominal)
    })
    const trailing3 = [0, 1, 2].map(i => monthKey(new Date(year, monthIdx - i, 1)))
    const avgNet = trailing3.reduce((s, k) => s + ((byMonth[k]?.exp || 0) - (byMonth[k]?.rev || 0)), 0) / 3

    // Kas per akhir bulan terpilih (kumulatif s.d. bulan itu)
    const saldoAwal = settings ? Number(settings.value) || 0 : 0
    const cashflowUpToMonth = (cashflow || []).filter((c: any) => c.tanggal <= monthKeyDate(monthEndRaw))
    const totalRev = cashflowUpToMonth.filter((c: any) => c.tipe === 'Revenue').reduce((s: number, c: any) => s + Number(c.nominal), 0)
    const totalExp = cashflowUpToMonth.filter((c: any) => c.tipe !== 'Revenue').reduce((s: number, c: any) => s + Number(c.nominal), 0)
    const kasSaatIni = saldoAwal + totalRev - totalExp

    // Action Center
    const items: typeof actionItems = []
    if (hotOver > 0) items.push({ lvl: 2, icon: <Flame size={16} />, txt: `${hotOver} Hot lead diam > 7 hari`, act: 'Follow-up hari ini', href: '/marketing' })
    if (chkOverdue > 0) items.push({ lvl: 2, icon: <CheckCircle2 size={16} />, txt: `${chkOverdue} milestone B2B overdue`, act: 'Tinjau checklist B2B', href: '/b2b-internal' })
    ;(kritis || []).forEach((r: any) => {
      if (r.deadline && new Date(r.deadline) <= reference && new Date(r.deadline) < today)
        items.push({ lvl: 2, icon: <AlertTriangle size={16} />, txt: `Posisi kritis "${r.posisi}" melewati deadline`, act: 'Headhunter → Posisi Kritis', href: '/headhunter' })
    })
    ;(mitigasi || []).filter((r: any) => r.status === 'Terbuka').slice(0, 3).forEach((r: any) => {
      items.push({ lvl: 1, icon: <ShieldAlert size={16} />, txt: `Resiko "${r.risiko}" belum ditangani`, act: 'Mitigasi Resiko', href: '/mitigasi' })
    })

    // Tren Revenue vs Pengeluaran — 6 bulan kalender berakhir di bulan terpilih
    const trendMonths = lastNMonthsEndingAt(mk, 6)
    setTrendData({
      labels: trendMonths.map(m => monthLabel(m).split(' ')[0].slice(0, 3)),
      revenue: trendMonths.map(m => byMonth[m]?.rev || 0),
      expense: trendMonths.map(m => byMonth[m]?.exp || 0),
    })

    // Distribusi Leads per Channel — leads yang sudah ada s.d. bulan terpilih
    const leadsUpToMonth = (leads || []).filter((l: any) => !l.last_interaction || new Date(l.last_interaction) <= reference)
    const channelMap: Record<string, number> = {}
    leadsUpToMonth.forEach((l: any) => { channelMap[l.channel] = (channelMap[l.channel] || 0) + 1 })
    setLeadChannelData({ labels: Object.keys(channelMap), values: Object.values(channelMap) })

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

  const barData = {
    labels: targetPerDivisi.map(d => d.divisi),
    datasets: [
      { label: 'Target', data: targetPerDivisi.map(d => d.target), backgroundColor: CHART_COLORS.muted, borderRadius: 4 },
      { label: 'Realisasi', data: targetPerDivisi.map(d => d.real), backgroundColor: CHART_COLORS.accent, borderRadius: 4 },
    ],
  }

  return (
    <div>
      {/* Filter bulan */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-base font-bold text-primary">Ringkasan {monthLabel(selectedMonth)}</div>
          <div className="text-[0.78rem] text-muted">Semua nilai di halaman ini mengikuti bulan yang dipilih</div>
        </div>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-3.5 py-2 border-[1.5px] border-border rounded-lg text-[0.85rem] font-semibold text-primary outline-none focus:border-accent bg-white"
        >
          {monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      {/* Widget: jam & kalender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-[18px]">
        <LiveClock />
        <MiniCalendar />
      </div>

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-[18px]">
        <Card icon={<TrendingUp size={16} />} title="Tren Revenue vs Pengeluaran (6 Bulan)">
          <Line
            data={{
              labels: trendData.labels,
              datasets: [
                { label: 'Revenue', data: trendData.revenue, borderColor: CHART_COLORS.success, backgroundColor: CHART_COLORS.success + '22', fill: true, tension: 0.35 },
                { label: 'Pengeluaran', data: trendData.expense, borderColor: CHART_COLORS.danger, backgroundColor: CHART_COLORS.danger + '22', fill: true, tension: 0.35 },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, scales: { y: { ticks: { callback: v => formatRp(Number(v)).replace('Rp ', '') } } } }}
            height={220}
          />
        </Card>
        <Card icon={<Target size={16} />} title="Distribusi Leads per Channel">
          {leadChannelData.labels.length === 0 ? (
            <div className="text-center py-10 text-muted text-[0.82rem]">Belum ada data leads.</div>
          ) : (
            <Doughnut
              data={{
                labels: leadChannelData.labels,
                datasets: [{ data: leadChannelData.values, backgroundColor: DOUGHNUT_PALETTE, borderWidth: 0 }],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }}
              height={220}
            />
          )}
        </Card>
      </div>

      {/* Target & Capaian */}
      <Card icon={<Target size={16} />} title={`Target & Capaian — ${monthLabel(selectedMonth)}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Target Revenue" value={formatRp(stats.targetRevenue)} sub="Forecast bulan ini" />
          <StatCard label="Capaian Revenue" value={formatRp(stats.realisasiRevenue)} sub="Realisasi bulan ini" />
          <StatCard
            label="% Capaian Target"
            value={stats.targetRevenue ? Math.round(stats.realisasiRevenue / stats.targetRevenue * 100) + '%' : '0%'}
            sub="Realisasi ÷ Target"
            accentColor="var(--success)"
          />
        </div>

        {targetPerDivisi.length === 0 ? (
          <div className="text-center py-3.5 text-muted text-[0.82rem]">
            Belum ada data forecasting untuk bulan ini. Isi di tab Forecasting.
          </div>
        ) : (
          <>
            <div className="mb-5" style={{ maxWidth: '100%' }}>
              <Bar
                data={barData}
                options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, scales: { y: { ticks: { callback: v => formatRp(Number(v)).replace('Rp ', '') } } } }}
                height={200}
              />
            </div>
            {targetPerDivisi.map(d => (
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
            ))}
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Checklist Overdue" value={stats.checklistOverdue} sub="Milestone B2B lewat target" accentColor="var(--accent-hover)" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Total Klien" value={stats.klienAktif} sub="Aktif saat ini" icon={<BarChart3 size={18} />} />
        <StatCard label="Courses" value={stats.coursePipeline} sub="Pipeline & Akan Datang bulan ini" icon={<TrendingUp size={18} />} />
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function monthKeyDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function lastNMonthsEndingAt(mk: string, n: number): string[] {
  const { year, monthIdx } = parseMonthKey(mk)
  const arr: string[] = []
  for (let i = n - 1; i >= 0; i--) arr.push(monthKey(new Date(year, monthIdx - i, 1)))
  return arr
}
function leadScoreAt(l: { channel: string; stage: string }, daysSinceInteraction: number | null): number {
  let s = 0
  if (l.channel === 'Referral' || l.channel === 'Komunitas') s += 30
  else if (l.channel === 'LinkedIn') s += 20
  else if (l.channel === 'Instagram') s += 10
  if (daysSinceInteraction != null) {
    if (daysSinceInteraction < 3) s += 25
    else if (daysSinceInteraction < 7) s += 15
    else if (daysSinceInteraction > 14) s -= 10
  }
  if (l.stage === 'MQL') s += 10
  else if (l.stage === 'SQL') s += 20
  else if (l.stage === 'Deal') s += 30
  return Math.max(0, Math.min(100, s))
}
