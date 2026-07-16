'use client'
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

interface ConfirmOptions {
  title?: string
  okText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

interface ConfirmContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx.confirm
}

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [options, setOptions] = useState<ConfirmOptions>({})
  const resolveRef = useRef<(value: boolean) => void>(null)

  const confirm = useCallback((msg: string, opts: ConfirmOptions = {}) => {
    setMessage(msg)
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      (resolveRef as any).current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) resolveRef.current(true)
    setIsOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    if (resolveRef.current) resolveRef.current(false)
    setIsOpen(false)
  }, [])

  // Handle keyboard events when confirm is open
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter') {
        handleConfirm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCancel, handleConfirm])

  const title = options.title || 'Konfirmasi Tindakan'
  const okText = options.okText || 'Hapus'
  const cancelText = options.cancelText || 'Batal'
  const variant = options.variant || 'danger'

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999999, // extremely high, above everything
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={handleCancel}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            animation: 'modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '20px 24px 12px 24px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#0f172a',
              }}>
                {title}
              </h3>
            </div>
            {/* Body */}
            <div style={{
              padding: '20px 24px 24px 24px',
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.5,
              }}>
                {message}
              </p>
            </div>
            {/* Footer */}
            <div style={{
              padding: '12px 24px 20px 24px',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #e2e8f0',
            }}>
              <button 
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                {cancelText}
              </button>
              <button 
                onClick={handleConfirm}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: variant === 'danger' ? 'var(--danger)' : 'var(--primary)',
                  color: '#ffffff',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                {okText}
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes modalScaleIn {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
