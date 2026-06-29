'use client'
import { ReactNode } from 'react'

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
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, padding: 28,
        width: '90%', maxWidth, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--muted)', padding: 4, borderRadius: 6 }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', marginBottom: 5, display: 'block' }}>{label}</label>
      {children}
    </div>
  )
}

export function FormInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
        borderRadius: 8, fontSize: '0.82rem', outline: 'none',
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
    />
  )
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
        borderRadius: 8, fontSize: '0.82rem', outline: 'none', background: '#fff',
        ...props.style,
      }}
    >
      {children}
    </select>
  )
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
      {children}
    </div>
  )
}

export function BtnPrimary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}

export function BtnOutline({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent)',
        borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}
