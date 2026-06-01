import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-8xl text-[#C9A84C] mb-4">404</p>
        <p className="text-[#5A5048] text-sm mb-8">Page not found</p>
        <Link href="/dashboard" className="text-[9px] tracking-[3px] uppercase text-[#C9A84C] border border-[rgba(201,168,76,0.3)] px-6 py-3 hover:bg-[rgba(201,168,76,0.1)] transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
