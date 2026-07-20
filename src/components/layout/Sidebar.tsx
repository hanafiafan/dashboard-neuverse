'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Target, Building2, Globe2, BookOpen, Laptop, NotebookPen, BarChart3,
  TrendingUp, ShieldAlert, Megaphone, LayoutGrid, Star, BookMarked, Menu, X, type LucideIcon,
} from 'lucide-react'

const NAV: { section: string; items: { href: string; Icon: LucideIcon; label: string }[] }[] = [
  { section: 'Beranda', items: [
    { href: '/', Icon: Home, label: 'Halaman Depan' },
  ]},
  { section: 'Operasional', items: [
    { href: '/headhunter', Icon: Target, label: 'Headhunter' },
    { href: '/b2b-internal', Icon: Building2, label: 'B2B Internal' },
    { href: '/b2b-external', Icon: Globe2, label: 'B2B Eksternal' },
  ]},
  { section: 'Produk', items: [
    { href: '/courses', Icon: BookOpen, label: 'Courses' },
    { href: '/lms', Icon: Laptop, label: 'LMS' },
  ]},
  { section: 'Keuangan', items: [
    { href: '/kas', Icon: NotebookPen, label: 'Buku Kas Harian' },
    { href: '/finance', Icon: BarChart3, label: 'Finance' },
  ]},
  { section: 'Strategi', items: [
    { href: '/forecasting', Icon: TrendingUp, label: 'Forecasting' },
    { href: '/mitigasi', Icon: ShieldAlert, label: 'Mitigasi Resiko' },
  ]},
  { section: 'Pertumbuhan', items: [
    { href: '/marketing', Icon: Megaphone, label: 'Marketing Funnel' },
    { href: '/resource', Icon: LayoutGrid, label: 'Resource Utilization' },
    { href: '/client-success', Icon: Star, label: 'Client Success' },
  ]},
  { section: 'Bantuan', items: [
    { href: '/docs', Icon: BookMarked, label: 'Dokumentasi' },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Tutup drawer otomatis setiap ganti halaman (khusus mobile)
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Buka menu"
        className="md:hidden fixed top-3 left-3 z-[110] flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white shadow-md"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-[99]"
        />
      )}

      <div
        className={`flex flex-col fixed left-0 top-0 z-[100] min-h-screen bg-primary text-white transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 'var(--sidebar-w)' }}
      >
        <div className="px-4 pt-5 pb-3 border-b border-white/10">
          <div className="text-xl font-extrabold tracking-wide">
            NEU<span className="text-indigo-400">verse</span>
          </div>
          <div className="text-[0.65rem] text-white/40 tracking-[2px] uppercase mt-0.5">
            Team Dashboard
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2.5">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="text-[0.6rem] uppercase tracking-[2px] text-white/35 px-4 pt-2 pb-1">
                {section}
              </div>
              {items.map(({ href, Icon, label }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link key={href} href={href} className="no-underline">
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-[0.82rem] border-l-[3px] transition-colors ${
                        active
                          ? 'border-indigo-400 bg-indigo-400/15 text-white font-semibold'
                          : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={17} strokeWidth={2} className="shrink-0" />
                      {label}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-white/10 text-[0.7rem] text-white/35">
          NEUverse © 2026 · v10
        </div>
      </div>
    </>
  )
}
