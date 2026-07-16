'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
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

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-enter" style={{
            background: t.type === 'error' ? 'var(--danger)' : t.type === 'info' ? 'var(--accent)' : 'var(--primary)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 10,
            fontSize: '0.82rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            maxWidth: 320,
            transition: 'all 0.2s ease',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


