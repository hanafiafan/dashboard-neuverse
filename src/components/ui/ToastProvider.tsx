'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
interface ToastCtx { show: (msg: string, type?: Toast['type']) => void }

export const ToastContext = createContext<ToastCtx>({ show: () => {} })
export const useToast = () => useContext(ToastContext)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => {
      // Clear info/loading toasts if we got a success/error status update
      const filtered = (type === 'success' || type === 'error')
        ? prev.filter(t => t.type !== 'info')
        : prev;
      return [...filtered, { id, message, type }]
    })

    // Safety timeout for info toasts (60s) to ensure they are not prematurely removed
    // while success/error toasts are removed after 3.5s.
    const duration = type === 'info' ? 60000 : 3500;
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: Toast['type'] }>;
      if (customEvent.detail) {
        show(customEvent.detail.message, customEvent.detail.type);
      }
    };
    window.addEventListener('neuverse-toast', handleToastEvent);
    return () => window.removeEventListener('neuverse-toast', handleToastEvent);
  }, [show]);

  const hasInfo = toasts.some(t => t.type === 'info')

  // Block all keyboard interactions when a CRUD/sync operation is active
  useEffect(() => {
    if (!hasInfo) return
    const blockKeyboard = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', blockKeyboard, true)
    window.addEventListener('keypress', blockKeyboard, true)
    window.addEventListener('keyup', blockKeyboard, true)
    return () => {
      window.removeEventListener('keydown', blockKeyboard, true)
      window.removeEventListener('keypress', blockKeyboard, true)
      window.removeEventListener('keyup', blockKeyboard, true)
    }
  }, [hasInfo])

  const activeLoadingToast = toasts.find(t => t.type === 'info')

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Full screen interaction-blocking overlay during CRUD/saving state */}
      {activeLoadingToast && (
        <div className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-[999999] flex flex-col items-center justify-center cursor-not-allowed text-white">
          <div
            className="bg-primary-2 px-9 py-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center gap-4"
            style={{ animation: 'modalScaleIn 0.2s ease-out' }}
          >
            <Loader2 size={36} className="animate-spin text-indigo-400" />
            <span className="text-[0.9rem] font-medium tracking-wide">
              {activeLoadingToast.message}
            </span>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2">
        {toasts.filter(t => t.type !== 'info').map(t => (
          <div
            key={t.id}
            className="toast-enter flex items-center gap-2.5 text-white px-4.5 py-3 rounded-[10px] text-[0.82rem] shadow-lg max-w-[320px]"
            style={{ background: t.type === 'error' ? 'var(--danger)' : 'var(--primary)' }}
          >
            {t.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
