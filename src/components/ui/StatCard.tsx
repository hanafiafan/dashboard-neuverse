import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: ReactNode
  variant?: 'default' | 'accent' | 'blue' | 'gold' | 'success' | 'danger' | 'warning'
  accentColor?: string
  icon?: ReactNode
}

const VARIANT_STYLES: Record<NonNullable<StatCardProps['variant']>, React.CSSProperties> = {
  default: { background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' },
  accent: { background: 'linear-gradient(135deg, #4f46e5, #4338ca)', border: 'none', color: '#fff' },
  blue: { background: 'linear-gradient(135deg, #0284c7, #075985)', border: 'none', color: '#fff' },
  gold: { background: 'linear-gradient(135deg, #d97706, #92400e)', border: 'none', color: '#fff' },
  success: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--success)', color: 'var(--text)' },
  danger: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--danger)', color: 'var(--text)' },
  warning: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--warning)', color: 'var(--text)' },
}

export default function StatCard({ label, value, sub, variant = 'default', accentColor, icon }: StatCardProps) {
  const style = VARIANT_STYLES[variant]
  const isGradient = variant === 'accent' || variant === 'blue' || variant === 'gold'
  const labelColor = isGradient ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const subColor = isGradient ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const valueColor = accentColor ? accentColor : isGradient ? '#fff' : 'var(--primary)'
  const borderLeftStyle = accentColor ? { borderLeft: `4px solid ${accentColor}` } : {}

  return (
    <div className="rounded-xl p-4.5 shadow-sm" style={{ ...style, ...borderLeftStyle, padding: 18 }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[0.72rem] uppercase tracking-wide" style={{ color: labelColor }}>
          {label}
        </div>
        {icon && <span style={{ color: isGradient ? 'rgba(255,255,255,0.85)' : 'var(--muted)' }}>{icon}</span>}
      </div>
      <div className="text-[1.8rem] font-extrabold leading-tight" style={{ color: valueColor }}>
        {value}
      </div>
      {sub && (
        <div className="text-[0.72rem] mt-1" style={{ color: subColor }}>{sub}</div>
      )}
    </div>
  )
}
