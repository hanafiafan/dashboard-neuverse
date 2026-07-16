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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'not-allowed',
          color: '#fff',
        }}>
          <div style={{
            background: '#1e293b',
            padding: '24px 36px',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'scaleIn 0.2s ease-out',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.5px' }}>
              {activeLoadingToast.message}
            </span>
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes scaleIn {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.filter(t => t.type !== 'info').map(t => (
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


