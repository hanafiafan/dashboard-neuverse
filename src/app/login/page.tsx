'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || 'Login gagal.')
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan, coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold tracking-wide text-white">
            NEU<span className="text-indigo-400">verse</span>
          </div>
          <div className="text-[0.7rem] text-white/40 tracking-[2px] uppercase mt-1">
            Team Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 shadow-2xl">
          <h1 className="text-base font-bold text-primary mb-1">Masuk</h1>
          <p className="text-[0.8rem] text-muted mb-5">Gunakan akun tim untuk mengakses dashboard.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-danger text-[0.8rem] rounded-lg px-3 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="mb-3.5">
            <label className="text-[0.78rem] font-semibold text-text mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@neuverse.id"
                className="w-full pl-9 pr-3 py-2.5 border-[1.5px] border-border rounded-lg text-[0.85rem] outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-[0.78rem] font-semibold text-text mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border-[1.5px] border-border rounded-lg text-[0.85rem] outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 text-[0.85rem] font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-[0.72rem] text-white/40 mt-5">
          NEUverse © 2026 · Internal use only
        </p>
      </div>
    </div>
  )
}
