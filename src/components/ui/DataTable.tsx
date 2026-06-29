import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  width?: string | number
}

interface DataTableProps {
  columns: Column[]
  children: ReactNode
  emptyMessage?: string
  minWidth?: string
}

export default function DataTable({ columns, children, emptyMessage, minWidth }: DataTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  background: '#f8f9fa',
                  color: 'var(--muted)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  borderBottom: '2px solid var(--border)',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children && emptyMessage && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '0.85rem' }}>
          {emptyMessage}
        </div>
      )}
    </div>
  )
}

export function Td({ children, style }: { children?: ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  )
}

export function ActionButtons({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{ background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
          >✏️</button>
        )}
        <button
          onClick={onDelete}
          style={{ background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
        >🗑</button>
      </div>
    </td>
  )
}
