'use client'
import { ReactNode, Children, useState, useEffect } from 'react'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

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

const PAGE_SIZE = 15

export default function DataTable({ columns, children, emptyMessage, minWidth }: DataTableProps) {
  const rows = Children.toArray(children).filter(Boolean)
  const hasRows = rows.length > 0

  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [rows.length])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
        <tbody className="[&>tr:hover>td]:bg-slate-50">{visible}</tbody>
      </table>

      {!hasRows && emptyMessage && (
        <div className="text-center py-6 text-muted text-[0.85rem]">
          {emptyMessage}
        </div>
      )}

      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1 pt-3 text-[0.78rem] text-muted">
          <span>
            Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} dari {rows.length} baris
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center justify-center w-7 h-7 rounded-md border border-border bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-semibold text-primary">{currentPage}/{totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center justify-center w-7 h-7 rounded-md border border-border bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
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
