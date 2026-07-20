'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Halaman Depan',
  '/headhunter': 'Headhunter',
  '/b2b-internal': 'B2B Internal',
  '/b2b-external': 'B2B Eksternal',
  '/courses': 'Courses',
  '/lms': 'LMS',
  '/kas': 'Buku Kas Harian',
  '/finance': 'Finance',
  '/forecasting': 'Forecasting',
  '/mitigasi': 'Mitigasi Resiko',
  '/marketing': 'Marketing Funnel',
  '/resource': 'Resource Utilization',
  '/client-success': 'Client Success',
  '/docs': 'Dokumentasi',
}

export default function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'NEUverse Dashboard'
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-border pl-16 pr-4 md:px-7 py-3.5 gap-2">
      <div className="text-[0.95rem] md:text-[1.05rem] font-bold text-primary truncate">{title}</div>
      <div className="flex items-center gap-3.5 shrink-0">
        <span className="hidden sm:inline text-xs text-muted">{today}</span>
        <span className="bg-accent text-white rounded-full px-3 py-1 text-[0.7rem] font-semibold whitespace-nowrap">
          Tim Aktif
        </span>
      </div>
    </div>
  )
}
