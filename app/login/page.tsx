import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display text-2xl tracking-[6px] text-[#C9A84C] uppercase mb-1">Maison Noir</div>
          <div className="text-[9px] tracking-[3px] text-[#5A5048] uppercase">Admin Portal</div>
        </div>
        <Suspense fallback={<div className="bg-[#141414] border border-[rgba(201,168,76,0.15)] p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-[9px] text-[#3A3530] mt-6">Authorised staff access only</p>
      </div>
    </div>
  )
}
