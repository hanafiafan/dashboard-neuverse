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
}

export default function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'NEUverse Dashboard'
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '14px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{today}</span>
        <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 600 }}>
          Tim Aktif
        </span>
      </div>
    </div>
  )
}
