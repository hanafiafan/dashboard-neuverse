'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { section: 'Beranda', items: [
    { href: '/', icon: '🏠', label: 'Halaman Depan' },
  ]},
  { section: 'Operasional', items: [
    { href: '/headhunter', icon: '🎯', label: 'Headhunter' },
    { href: '/b2b-internal', icon: '🏢', label: 'B2B Internal' },
    { href: '/b2b-external', icon: '🌐', label: 'B2B Eksternal' },
  ]},
  { section: 'Produk', items: [
    { href: '/courses', icon: '📚', label: 'Courses' },
    { href: '/lms', icon: '💻', label: 'LMS' },
  ]},
  { section: 'Keuangan', items: [
    { href: '/kas', icon: '📝', label: 'Buku Kas Harian' },
    { href: '/finance', icon: '📊', label: 'Finance' },
  ]},
  { section: 'Strategi', items: [
    { href: '/forecasting', icon: '📈', label: 'Forecasting' },
    { href: '/mitigasi', icon: '🛡️', label: 'Mitigasi Resiko' },
  ]},
  { section: 'Pertumbuhan', items: [
    { href: '/marketing', icon: '📣', label: 'Marketing Funnel' },
    { href: '/resource', icon: '🧩', label: 'Resource Utilization' },
    { href: '/client-success', icon: '⭐', label: 'Client Success' },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 1 }}>
          NEU<span style={{ color: 'var(--accent)' }}>verse</span>
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          Team Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.35)', padding: '8px 16px 4px' }}>
              {section}
            </div>
            {items.map(({ href, icon, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                    background: active ? 'rgba(233,69,96,0.15)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>
                    {label}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
        NEUverse © 2025 · v9
      </div>
    </div>
  )
}
