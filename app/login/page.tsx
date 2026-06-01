import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.08)_0%,transparent_60%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display text-2xl tracking-[6px] text-[#C9A84C] uppercase mb-1">Maison Noir</div>
          <div className="text-[9px] tracking-[3px] text-[#9A8A7A] uppercase">Admin Portal</div>
        </div>
        <Suspense fallback={<div className="bg-white border border-[rgba(42,36,32,0.1)] p-8 h-64 animate-pulse rounded-sm" />}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-[9px] text-[#9A8A7A] mt-6">Authorised staff access only</p>
      </div>
    </div>
  )
}
