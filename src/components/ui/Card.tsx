import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  icon?: ReactNode
  style?: React.CSSProperties
  actions?: ReactNode
}

export default function Card({ children, title, icon, style, actions }: CardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-border p-5 mb-4 shadow-sm"
      style={style}
    >
      {title && (
        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[0.85rem] font-bold text-primary flex items-center gap-2">
            {icon && <span className="text-accent inline-flex">{icon}</span>}
            {title}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}

export function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-[0.95rem] font-bold text-primary">{title}</div>
      {children}
    </div>
  )
}

export function InnerTabs({ tabs, active, onTab }: {
  tabs: { key: string; label: ReactNode }[]
  active: string
  onTab: (key: string) => void
}) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-[10px] mb-4 w-fit flex-wrap">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onTab(t.key)}
          className={`px-4 py-1.5 rounded-lg text-[0.78rem] font-semibold border-none cursor-pointer transition-all ${
            active === t.key ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-muted hover:text-primary'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
