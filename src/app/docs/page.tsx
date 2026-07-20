'use client'
import { useState } from 'react'
import {
  BookMarked, LayoutDashboard, ListChecks, Target, Building2, Globe2, BookOpen, Laptop,
  NotebookPen, BarChart3, TrendingUp, ShieldAlert, Megaphone, LayoutGrid, Star, Workflow,
  FolderTree, Lock, Link2, Calendar, Wallet, Database, Calculator, ClipboardList,
  type LucideIcon,
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

const ICON_MAP: Record<string, LucideIcon> = {
  Workflow, FolderTree, Lock, Link2, Calendar, Wallet, Building2,
}

const TIPE_COLOR: Record<string, string> = {
  teks: 'bg-slate-100 text-slate-700',
  angka: 'bg-emerald-50 text-emerald-700',
  tanggal: 'bg-sky-50 text-sky-700',
  pilihan: 'bg-indigo-50 text-indigo-700',
  link: 'bg-amber-50 text-amber-700',
}
function tipeBadgeClass(tipe: string) {
  const key = Object.keys(TIPE_COLOR).find(k => tipe.toLowerCase().startsWith(k))
  return TIPE_COLOR[key || 'teks']
}

function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${className || 'bg-indigo-50 text-accent'}`}>
      <Icon size={18} />
    </div>
  )
}

function FeatureGrid({ items }: { items: { judul: string; icon: string; isi: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {items.map(p => {
        const Icon = ICON_MAP[p.icon] || BookMarked
        return (
          <div
            key={p.judul}
            className="border border-border rounded-xl p-4 bg-white hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <IconBadge icon={Icon} />
              <div className="text-[0.85rem] font-bold text-primary">{p.judul}</div>
            </div>
            <p className="text-[0.8rem] text-muted leading-relaxed">{p.isi}</p>
          </div>
        )
      })}
    </div>
  )
}

function StatChip({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-lg px-3 py-2">
      <Icon size={14} className="text-accent" />
      <span className="text-[0.85rem] font-bold text-primary">{value}</span>
      <span className="text-[0.72rem] text-muted">{label}</span>
    </div>
  )
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
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 items-start">
      <nav className="md:sticky md:top-[76px]">
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
                    active === id ? 'bg-accent text-white font-semibold shadow-sm' : 'bg-transparent text-text hover:bg-slate-100'
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
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <IconBadge icon={LayoutDashboard} className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white w-11 h-11" />
              <div>
                <div className="text-base font-bold text-primary">Arsitektur Sistem</div>
                <div className="text-[0.72rem] text-muted">Bagaimana dashboard ini dibangun dan bekerja</div>
              </div>
            </div>
            <p className="text-[0.85rem] text-text leading-relaxed mb-5">{ARSITEKTUR.ringkasan}</p>
            <FeatureGrid items={ARSITEKTUR.poin} />
          </Card>
        )}

        {active === 'konvensi' && (
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <IconBadge icon={ListChecks} className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white w-11 h-11" />
              <div>
                <div className="text-base font-bold text-primary">Konvensi & Format Data</div>
                <div className="text-[0.72rem] text-muted">Aturan yang berlaku di semua modul</div>
              </div>
            </div>
            <FeatureGrid items={KONVENSI} />
          </Card>
        )}

        {activeModule && (() => {
          const Icon = MODULE_ICONS[activeModule.id] || BookMarked
          const fieldCount = activeModule.field?.reduce((a, g) => a + g.items.length, 0) || 0
          return (
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <IconBadge icon={Icon} className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white w-11 h-11" />
                <div>
                  <div className="text-base font-bold text-primary">{activeModule.label}</div>
                  <div className="text-[0.72rem] text-muted">Panduan pengisian data</div>
                </div>
              </div>
              <p className="text-[0.85rem] text-text leading-relaxed mb-4">{activeModule.ringkasan}</p>

              <div className="flex flex-wrap gap-2 mb-5">
                <StatChip icon={Database} value={activeModule.tabel.length} label="tabel" />
                <StatChip icon={ClipboardList} value={activeModule.langkah.length} label="langkah" />
                {fieldCount > 0 && <StatChip icon={ListChecks} value={fieldCount} label="field" />}
                {activeModule.rumus && <StatChip icon={Calculator} value={activeModule.rumus.length} label="rumus" />}
              </div>

              <div className="flex items-center gap-1.5 text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-2">
                <Database size={13} /> Tabel yang digunakan
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {activeModule.tabel.map(t => <Tag key={t} value={t} />)}
              </div>

              <div className="flex items-center gap-1.5 text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-2.5">
                <ClipboardList size={13} /> Cara Pengisian
              </div>
              <div className="flex flex-col gap-3 mb-5">
                {activeModule.langkah.map((l, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-accent text-[0.72rem] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[0.82rem] text-text leading-relaxed pt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {activeModule.field?.map(group => (
                <div key={group.untuk} className="mb-5">
                  <div className="flex items-center gap-1.5 text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-2">
                    <ListChecks size={13} /> Field: {group.untuk}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-[0.8rem] border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-3 py-2 border-b border-border font-semibold text-muted text-[0.7rem] uppercase">Nama</th>
                          <th className="text-left px-3 py-2 border-b border-border font-semibold text-muted text-[0.7rem] uppercase">Tipe</th>
                          <th className="text-left px-3 py-2 border-b border-border font-semibold text-muted text-[0.7rem] uppercase">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((f, i) => (
                          <tr key={f.nama} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
                            <td className="px-3 py-2 border-b border-border font-medium">
                              {f.nama}{f.wajib && <span className="text-danger ml-1">*</span>}
                            </td>
                            <td className="px-3 py-2 border-b border-border">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[0.7rem] font-medium ${tipeBadgeClass(f.tipe)}`}>
                                {f.tipe}
                              </span>
                            </td>
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
                  <div className="flex items-center gap-1.5 text-[0.72rem] uppercase tracking-wide text-muted font-semibold mb-2">
                    <Calculator size={13} /> Rumus & Perhitungan
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeModule.rumus.map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg px-3.5 py-2.5">
                        <Calculator size={14} className="text-accent shrink-0 mt-0.5" />
                        <p className="text-[0.8rem] text-primary leading-relaxed font-mono">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })()}
      </div>
    </div>
  )
}
