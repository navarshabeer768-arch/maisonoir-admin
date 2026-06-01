import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Customers' }

const TIER_COLOR: Record<string, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#C9A84C', platinum: '#E5E4E2', vip_royal: '#9B59B6',
}

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers, count } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, email, phone, created_at, is_active, last_login_at,
      loyalty:loyalty_accounts(tier, points_balance, points_lifetime)
    `, { count: 'exact' })
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <AdminLayout currentPage="customers">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Customers</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">{count ?? 0} registered</p>
          </div>
          <button className="btn-outline-gold text-[9px] px-4 py-2">Export CSV</button>
        </div>

        <div className="card-admin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Customer', 'Email', 'Tier', 'Points', 'Joined', 'Last Login', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers?.map(c => {
                const loyalty = (c.loyalty as any[])?.[0]
                return (
                  <tr key={c.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#C9A84C] font-display text-sm shrink-0">
                          {(c.first_name?.[0] ?? c.email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="text-[11px] text-[#F0EAD6]">{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#5A5048] max-w-[180px] truncate">{c.email}</td>
                    <td className="py-3 px-4">
                      <span className="text-[9px] uppercase capitalize" style={{ color: TIER_COLOR[loyalty?.tier ?? 'bronze'] }}>
                        {loyalty?.tier?.replace('_', ' ') ?? 'Bronze'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#C9A84C]">{(loyalty?.points_balance ?? 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[9px] text-[#4A4A4A]">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-[9px] text-[#4A4A4A]">
                      {c.last_login_at ? new Date(c.last_login_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] uppercase ${c.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/customers/${c.id}`} className="text-[9px] uppercase tracking-[1px] text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">
                        View
                      </Link>
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
