'use client'
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'

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
        <div
          className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-[9999999] flex items-center justify-center"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl w-[90%] max-w-[400px] shadow-2xl overflow-hidden border border-border"
            style={{ animation: 'modalScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center gap-2.5">
              {variant === 'danger'
                ? <AlertTriangle size={19} className="text-danger shrink-0" />
                : <HelpCircle size={19} className="text-accent shrink-0" />}
              <h3 className="text-[1.05rem] font-semibold text-primary">{title}</h3>
            </div>
            <div className="px-6 pt-5 pb-6">
              <p className="text-[0.88rem] text-muted leading-relaxed">{message}</p>
            </div>
            <div className="px-6 pt-3 pb-5 bg-slate-50 flex justify-end gap-3 border-t border-border">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-[0.82rem] font-medium cursor-pointer border border-border bg-white text-muted hover:bg-slate-100 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-[0.82rem] font-medium cursor-pointer border-none text-white transition-colors ${
                  variant === 'danger' ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-primary-2'
                }`}
              >
                {okText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
