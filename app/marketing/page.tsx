export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Marketing' }

export default async function MarketingPage() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const { count: subscriberCount } = await supabase
    .from('email_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('is_subscribed', true)

  return (
    <AdminLayout currentPage="marketing">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Marketing</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">Campaigns · Coupons · Email</p>
          </div>
          <Link href="/marketing/coupons/new" className="btn-gold text-[9px] px-4 py-2">+ Create Coupon</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Email Subscribers', value: (subscriberCount ?? 0).toLocaleString() },
            { label: 'Active Coupons', value: (coupons?.filter(c => c.is_active).length ?? 0).toString() },
            { label: 'Total Coupon Uses', value: (coupons?.reduce((s, c) => s + c.times_used, 0) ?? 0).toString() },
          ].map(({ label, value }) => (
            <div key={label} className="card-admin p-5">
              <p className="text-[8px] tracking-[2px] uppercase text-[#5A5048] mb-2">{label}</p>
              <p className="font-display text-3xl text-[#C9A84C]">{value}</p>
            </div>
          ))}
        </div>

        {/* Coupons */}
        <div className="card-admin p-6">
          <h2 className="font-display text-xl mb-5">Active Coupons</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expires', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons?.map(c => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date()
                return (
                  <tr key={c.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                    <td className="py-3 px-3 text-[11px] text-[#C9A84C] font-mono font-bold">{c.code}</td>
                    <td className="py-3 px-3 text-[10px] text-[#6B5E4A] capitalize">{c.type.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-[11px]">
                      {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#5A5048]">${c.min_order_amount}</td>
                    <td className="py-3 px-3 text-[11px]">
                      {c.times_used}{c.max_uses ? `/${c.max_uses}` : ''}
                    </td>
                    <td className="py-3 px-3 text-[9px] text-[#5A5048]">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[8px] uppercase px-2 py-1 ${
                        !c.is_active || expired ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {!c.is_active ? 'Disabled' : expired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/marketing/coupons/${c.id}/edit`} className="text-[9px] uppercase text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">Edit</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
