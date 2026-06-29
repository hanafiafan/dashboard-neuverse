import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  icon?: string
  style?: React.CSSProperties
  actions?: ReactNode
}

export default function Card({ children, title, icon, style, actions }: CardProps) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 12,
      border: '1px solid var(--border)',
      padding: 20,
      marginBottom: 18,
      ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <span style={{ fontSize: '1rem' }}>{icon}</span>}
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{title}</div>
      {children}
    </div>
  )
}

export function InnerTabs({ tabs, active, onTab }: {
  tabs: { key: string; label: string }[]
  active: string
  onTab: (key: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#f0f2f5', padding: 4, borderRadius: 10, marginBottom: 18, width: 'fit-content' }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onTab(t.key)}
          style={{
            padding: '7px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: active === t.key ? '#fff' : 'transparent',
            color: active === t.key ? 'var(--primary)' : 'var(--muted)',
            boxShadow: active === t.key ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
