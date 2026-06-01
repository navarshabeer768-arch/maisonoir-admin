'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      router.push('/dashboard')
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display text-2xl tracking-[6px] text-[#C9A84C] uppercase mb-1">Maison Noir</div>
          <div className="text-[9px] tracking-[3px] text-[#5A5048] uppercase">Admin Portal</div>
        </div>
        <form onSubmit={handleLogin} className="bg-[#141414] border border-[rgba(201,168,76,0.15)] p-8 space-y-5">
          <h1 className="font-display text-2xl font-light mb-2">Staff Sign In</h1>
          {error && <div className="text-[10px] text-red-400 border border-red-400/20 bg-red-400/5 p-3">{error}</div>}
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(201,168,76,0.15)] text-[#F0EAD6] text-sm outline-none focus:border-[#C9A84C] transition-colors" placeholder="staff@maisonoir.com" />
          </div>
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(201,168,76,0.15)] text-[#F0EAD6] text-sm outline-none focus:border-[#C9A84C] transition-colors" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#C9A84C] text-[#0A0A0A] text-[10px] tracking-[2px] uppercase font-semibold hover:bg-[#E8D5A3] transition-colors disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-[9px] text-[#3A3530] mt-6">Authorised staff access only</p>
      </div>
    </div>
  )
}
