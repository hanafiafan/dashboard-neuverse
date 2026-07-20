'use client'
import { useState } from 'react'
import {
  BookMarked, LayoutDashboard, ListChecks, Target, Building2, Globe2, BookOpen, Laptop,
  NotebookPen, BarChart3, TrendingUp, ShieldAlert, Megaphone, LayoutGrid, Star, type LucideIcon,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { ARSITEKTUR, KONVENSI, MODULES } from './content'

const MODULE_ICONS: Record<string, LucideIcon> = {
  headhunter: Target,
  'b2b-internal': Building2,
  'b2b-external': Globe2,
  courses: BookOpen,
  lms: Laptop,
  kas: NotebookPen,
  finance: BarChart3,
  forecasting: TrendingUp,
  mitigasi: ShieldAlert,
  marketing: Megaphone,
  resource: LayoutGrid,
  'client-success': Star,
}

type SectionId = 'arsitektur' | 'konvensi' | (typeof MODULES)[number]['id']

export default function DocsPage() {
  const [active, setActive] = useState<SectionId>('arsitektur')

  const navGroups: { label: string; items: { id: SectionId; label: string; Icon: LucideIcon }[] }[] = [
    { label: 'Mulai Cepat', items: [
      { id: 'arsitektur', label: 'Arsitektur Sistem', Icon: LayoutDashboard },
      { id: 'konvensi', label: 'Konvensi & Format', Icon: ListChecks },
    ]},
    { label: 'Panduan per Modul', items: MODULES.map(m => ({ id: m.id as SectionId, label: m.label, Icon: MODULE_ICONS[m.id] || BookMarked })) },
  ]

  const activeModule = MODULES.find(m => m.id === active)

  return (
    <div className="grid grid-cols-[220px_1fr] gap-5 items-start">
      <nav className="sticky top-[76px]">
        {navGroups.map(group => (
          <div key={group.label} className="mb-4">
            <div className="text-[0.65rem] uppercase tracking-wide text-muted font-semibold px-2 mb-1.5">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.8rem] text-left border-none cursor-pointer transition-colors ${
                    active === id ? 'bg-accent text-white font-semibold' : 'bg-transparent text-text hover:bg-slate-100'
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div>
        {active === 'arsitektur' && (
          <Card icon={<LayoutDashboard size={16} />} title="Arsitektur Sistem">
            <p className="text-[0.85rem] text-text leading-relaxed mb-4">{ARSITEKTUR.ringkasan}</p>
            <div className="flex flex-col gap-4">
              {ARSITEKTUR.poin.map(p => (
                <div key={p.judul}>
                  <div className="text-[0.82rem] font-bold text-primary mb-1">{p.judul}</div>
                  <p className="text-[0.82rem] text-muted leading-relaxed">{p.isi}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {active === 'konvensi' && (
          <Card icon={<ListChecks size={16} />} title="Konvensi & Format Data">
            <div className="flex flex-col gap-4">
              {KONVENSI.map(k => (
                <div key={k.judul}>
                  <div className="text-[0.82rem] font-bold text-primary mb-1">{k.judul}</div>
                  <p className="text-[0.82rem] text-muted leading-relaxed">{k.isi}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeModule && (() => {
          const Icon = MODULE_ICONS[activeModule.id] || BookMarked
          return (
            <Card icon={<Icon size={16} />} title={activeModule.label}>
              <p className="text-[0.85rem] text-text leading-relaxed mb-4">{activeModule.ringkasan}</p>

              <div className="text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-1.5">Tabel yang digunakan</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {activeModule.tabel.map(t => <Tag key={t} value={t} />)}
              </div>

              <div className="text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-1.5">Cara Pengisian</div>
              <ol className="list-decimal ml-4 mb-4 flex flex-col gap-1.5">
                {activeModule.langkah.map((l, i) => (
                  <li key={i} className="text-[0.82rem] text-text leading-relaxed">{l}</li>
                ))}
              </ol>

              {activeModule.field?.map(group => (
                <div key={group.untuk} className="mb-4">
                  <div className="text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-1.5">
                    Field: {group.untuk}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[0.8rem] border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-3 py-2 border-b-2 border-border font-semibold text-muted text-[0.7rem] uppercase">Nama</th>
                          <th className="text-left px-3 py-2 border-b-2 border-border font-semibold text-muted text-[0.7rem] uppercase">Tipe</th>
                          <th className="text-left px-3 py-2 border-b-2 border-border font-semibold text-muted text-[0.7rem] uppercase">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(f => (
                          <tr key={f.nama}>
                            <td className="px-3 py-2 border-b border-border font-medium">
                              {f.nama}{f.wajib && <span className="text-danger ml-1">*</span>}
                            </td>
                            <td className="px-3 py-2 border-b border-border text-muted">{f.tipe}</td>
                            <td className="px-3 py-2 border-b border-border text-muted">{f.keterangan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {activeModule.rumus && (
                <div>
                  <div className="text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-1.5">Rumus & Perhitungan</div>
                  <ul className="list-disc ml-4 flex flex-col gap-1.5">
                    {activeModule.rumus.map((r, i) => (
                      <li key={i} className="text-[0.82rem] text-text leading-relaxed">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )
        })()}
      </div>
    </div>
  )
}
