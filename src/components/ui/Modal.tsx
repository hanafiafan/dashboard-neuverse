'use client'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: number
}

export default function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[1000] flex justify-center items-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl p-7 w-full overflow-y-auto shadow-2xl"
        style={{ maxWidth, maxHeight: '85vh' }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="text-base font-bold text-primary">{title}</div>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-muted hover:text-primary p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="text-[0.78rem] font-semibold text-text mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

export function FormInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[0.82rem] outline-none focus:border-accent transition-colors ${className || ''}`}
    />
  )
}

export function FormSelect({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-[0.82rem] outline-none bg-white focus:border-accent transition-colors ${className || ''}`}
    >
      {children}
    </select>
  )
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 justify-end mt-5">
      {children}
    </div>
  )
}

export function BtnPrimary({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`bg-accent hover:bg-accent-hover text-white border-none rounded-lg px-4 py-2 text-[0.82rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    >
      {children}
    </button>
  )
}

export function BtnOutline({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`bg-transparent text-text border-[1.5px] border-border hover:bg-slate-50 rounded-lg px-4 py-2 text-[0.82rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    >
      {children}
    </button>
  )
}
