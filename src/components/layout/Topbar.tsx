'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getScriptUrl, setScriptUrl, getDbState } from '@/lib/supabase/client'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Halaman Depan',
  '/headhunter': 'Headhunter',
  '/b2b-internal': 'B2B Internal',
  '/b2b-external': 'B2B Eksternal',
  '/courses': 'Courses',
  '/lms': 'LMS',
  '/kas': 'Buku Kas Harian',
  '/finance': 'Finance',
  '/forecasting': 'Forecasting',
  '/mitigasi': 'Mitigasi Resiko',
  '/marketing': 'Marketing Funnel',
  '/resource': 'Resource Utilization',
  '/client-success': 'Client Success',
}

export default function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'NEUverse Dashboard'
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const [scriptUrl, _setScriptUrl] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  useEffect(() => {
    const url = getScriptUrl()
    _setScriptUrl(url)
    setIsConnected(!!url)
  }, [])

  const handleSave = () => {
    setScriptUrl(scriptUrl)
    setIsConnected(!!scriptUrl)
    setShowModal(false)
    window.location.reload()
  }

  const handleTest = async () => {
    if (!scriptUrl) {
      setTestResult({ success: false, msg: 'Masukkan URL terlebih dahulu.' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(scriptUrl, { method: 'GET', mode: 'cors' })
      const json = await res.json()
      if (json.ok) {
        setTestResult({ success: true, msg: 'Koneksi Sukses! Data spreadsheet berhasil terhubung.' })
      } else {
        setTestResult({ success: false, msg: `Gagal: ${json.error || 'Respon tidak valid.'}` })
      }
    } catch (e) {
      setTestResult({ success: false, msg: 'Koneksi Gagal. Pastikan URL Web App benar dan CORS aktif.' })
    } finally {
      setIsTesting(false)
    }
  }

  const forceSync = async () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neuverse-toast', {
        detail: { message: 'Menyinkronkan data dari Google Sheets...', type: 'info' }
      }))
    }
    try {
      await getDbState(true)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neuverse-toast', {
          detail: { message: 'Data berhasil disinkronisasi ulang dari Google Sheets!', type: 'success' }
        }))
      }
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neuverse-toast', {
          detail: { message: 'Gagal menyinkronkan data: ' + (err.message || err), type: 'error' }
        }))
      }
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '14px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{today}</span>
        
        {/* Connection status badge */}
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span 
              onClick={forceSync}
              title="Klik untuk Sinkronisasi Ulang"
              style={{
                background: '#e6f7ed',
                color: '#10b981',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                border: '1px solid #10b981'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Google Sheets Terhubung
            </span>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                color: 'var(--muted)'
              }}
              title="Pengaturan Integrasi"
            >
              ⚙️
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: '#fef3c7',
              color: '#d97706',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #d97706',
              cursor: 'pointer'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
            Mode Lokal Offline (Hubungkan)
          </button>
        )}

        <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600 }}>
          Tim Aktif
        </span>
      </div>

      {/* Modal dialog setup */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
              Integrasi Google Sheets
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 20 }}>
              Masukkan tautan Google Apps Script Web App yang telah dideploy untuk menyinkronkan seluruh database dashboard Anda secara realtime.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>
                Apps Script Web App URL
              </label>
              <input 
                type="text" 
                value={scriptUrl} 
                onChange={(e) => _setScriptUrl(e.target.value)} 
                placeholder="https://script.google.com/macros/s/.../exec"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  outline: 'none',
                }}
              />
            </div>

            {testResult && (
              <div style={{
                background: testResult.success ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${testResult.success ? '#10b981' : '#f87171'}`,
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.75rem',
                color: testResult.success ? '#047857' : '#b91c1c',
                marginBottom: 16,
              }}>
                {testResult.msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button 
                onClick={handleTest}
                disabled={isTesting}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isTesting ? 'Mencoba...' : 'Tes Koneksi'}
              </button>
              
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  color: '#64748b',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>

              <button 
                onClick={handleSave}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Simpan & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
