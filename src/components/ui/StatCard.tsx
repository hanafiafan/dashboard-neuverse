interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'accent' | 'blue' | 'gold' | 'success' | 'danger' | 'warning'
  accentColor?: string
}

const VARIANT_STYLES = {
  default: { background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' },
  accent: { background: 'linear-gradient(135deg, var(--accent), #c73652)', border: 'none', color: '#fff' },
  blue: { background: 'linear-gradient(135deg, var(--accent2), #0a1f40)', border: 'none', color: '#fff' },
  gold: { background: 'linear-gradient(135deg, var(--gold), #d4890a)', border: 'none', color: '#fff' },
  success: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--success)', color: 'var(--text)' },
  danger: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--danger)', color: 'var(--text)' },
  warning: { background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--warning)', color: 'var(--text)' },
}

export default function StatCard({ label, value, sub, variant = 'default', accentColor }: StatCardProps) {
  const style = VARIANT_STYLES[variant]
  const isGradient = ['accent', 'blue', 'gold'].includes(variant)
  const labelColor = isGradient ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const subColor = isGradient ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const valueColor = accentColor ? accentColor : isGradient ? '#fff' : 'var(--primary)'
  const borderLeftStyle = accentColor ? { borderLeft: `4px solid ${accentColor}` } : {}

  return (
    <div style={{
      ...style,
      ...borderLeftStyle,
      borderRadius: 12,
      padding: 18,
    }}>
      <div style={{ fontSize: '0.72rem', color: labelColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: valueColor, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.72rem', color: subColor, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}
