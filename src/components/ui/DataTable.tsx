import { ReactNode, Children } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

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
  const hasRows = Children.toArray(children).filter(Boolean).length > 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[0.8rem]" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="bg-slate-50 text-muted text-[0.7rem] uppercase tracking-wide px-3 py-2.5 text-left border-b-2 border-border whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:hover>td]:bg-slate-50">{children}</tbody>
      </table>
      {!hasRows && emptyMessage && (
        <div className="text-center py-6 text-muted text-[0.85rem]">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}

export function Td({ children, style }: { children?: ReactNode; style?: React.CSSProperties }) {
  return (
    <td className="px-3 py-2.5 border-b border-border align-middle" style={style}>
      {children}
    </td>
  )
}

export function ActionButtons({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <td className="px-3 py-2.5 border-b border-border">
      <div className="flex gap-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none rounded-md p-1.5 cursor-pointer inline-flex"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-md p-1.5 cursor-pointer inline-flex"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  )
}
