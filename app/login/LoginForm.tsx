'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message.includes('Invalid login') ? 'Wrong email or password.' : authError.message)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Connection error. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleLogin} className="bg-white border border-[rgba(42,36,32,0.1)] shadow-md p-8 space-y-5">
      <h1 className="font-display text-2xl font-light text-[#2A2420] mb-2">Staff Sign In</h1>

      {urlError && !error && (
        <div className="text-[10px] text-amber-700 border border-amber-200 bg-amber-50 p-3 leading-relaxed">
          Access denied. Ensure your account has a staff role in Supabase.
        </div>
      )}
      {error && (
        <div className="text-[10px] text-red-600 border border-red-200 bg-red-50 p-3">{error}</div>
      )}

      <div>
        <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2 font-medium">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoComplete="email"
          className="w-full px-4 py-3 bg-[#FAF8F5] border border-[rgba(42,36,32,0.15)] text-[#2A2420] text-sm outline-none focus:border-[#C9A84C] focus:bg-white transition-colors"
          placeholder="admin@admin.com" />
      </div>
      <div>
        <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2 font-medium">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
          className="w-full px-4 py-3 bg-[#FAF8F5] border border-[rgba(42,36,32,0.15)] text-[#2A2420] text-sm outline-none focus:border-[#C9A84C] focus:bg-white transition-colors"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-[#2A2420] text-white text-[10px] tracking-[2px] uppercase font-semibold hover:bg-[#C9A84C] transition-colors disabled:opacity-50">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
