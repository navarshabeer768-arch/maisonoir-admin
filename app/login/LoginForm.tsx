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

  const ERROR_MESSAGES: Record<string, string> = {
    unauthorized: 'Your account role is not set to staff. Check Supabase profiles table.',
    profile_not_found: 'Profile not found. Run the SQL seed script in Supabase.',
    inactive: 'Your account is inactive. Set is_active = true in Supabase.',
    server_error: 'Server error. Check that Supabase env vars are set in Vercel.',
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Email not confirmed. Use "Auto Confirm" when creating user in Supabase.')
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Wrong email or password.')
        } else {
          setError(authError.message)
        }
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Connection error. Check Supabase env vars in Vercel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="bg-[#141414] border border-[rgba(201,168,76,0.15)] p-8 space-y-5">
      <h1 className="font-display text-2xl font-light mb-2">Staff Sign In</h1>

      {urlError && !error && (
        <div className="text-[10px] text-amber-400 border border-amber-400/20 bg-amber-400/5 p-3 leading-relaxed">
          {ERROR_MESSAGES[urlError] ?? `Error: ${urlError}`}
        </div>
      )}
      {error && (
        <div className="text-[10px] text-red-400 border border-red-400/20 bg-red-400/5 p-3">{error}</div>
      )}

      <div>
        <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoComplete="email"
          className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(201,168,76,0.15)] text-[#F0EAD6] text-sm outline-none focus:border-[#C9A84C] transition-colors"
          placeholder="admin@admin.com" />
      </div>
      <div>
        <label className="text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-2">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required autoComplete="current-password"
          className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(201,168,76,0.15)] text-[#F0EAD6] text-sm outline-none focus:border-[#C9A84C] transition-colors"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-[#C9A84C] text-[#0A0A0A] text-[10px] tracking-[2px] uppercase font-semibold hover:bg-[#E8D5A3] transition-colors disabled:opacity-50">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
