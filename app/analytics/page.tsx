import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { RevenueChart } from '@/components/dashboard/RevenueChart'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const now = new Date()
  const ranges = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      start: d.toISOString(),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString(),
    }
  })

  const revenueData = await Promise.all(
    ranges.map(async ({ month, start, end }) => {
      const { data } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid')
        .gte('created_at', start)
        .lte('created_at', end)
      const revenue = data?.reduce((s, o) => s + o.total, 0) ?? 0
      return { month, revenue, orders: data?.length ?? 0 }
    })
  )

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0)

  return (
    <AdminLayout currentPage="analytics">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-light">Analytics</h1>
          <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">Business Intelligence · 12 Month View</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '12M Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K` },
            { label: '12M Orders', value: totalOrders.toLocaleString() },
            { label: 'Avg Order', value: totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(0)}` : '$0' },
            { label: 'Best Month', value: revenueData.sort((a, b) => b.revenue - a.revenue)[0]?.month ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="card-admin p-5">
              <p className="text-[8px] tracking-[3px] uppercase text-[#5A5048] mb-2">{label}</p>
              <p className="font-display text-3xl text-[#C9A84C]">{value}</p>
            </div>
          ))}
        </div>

        <RevenueChart data={revenueData} />

        {/* Monthly breakdown table */}
        <div className="card-admin p-6">
          <h2 className="font-display text-xl mb-5">Monthly Breakdown</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Month', 'Revenue', 'Orders', 'Avg Order Value', 'vs Previous'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...revenueData].reverse().map((row, i) => {
                const prev = revenueData[revenueData.length - 2 - i]
                const change = prev?.revenue > 0 ? ((row.revenue - prev.revenue) / prev.revenue * 100) : 0
                return (
                  <tr key={row.month} className="border-b border-[rgba(201,168,76,0.04)]">
                    <td className="py-3 px-3 text-[11px]">{row.month}</td>
                    <td className="py-3 px-3 font-display text-base text-[#C9A84C]">${(row.revenue / 1000).toFixed(1)}K</td>
                    <td className="py-3 px-3 text-[11px] text-[#6B5E4A]">{row.orders}</td>
                    <td className="py-3 px-3 text-[11px] text-[#6B5E4A]">
                      {row.orders > 0 ? `$${(row.revenue / row.orders).toFixed(0)}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      {prev && (
                        <span className={`text-[10px] ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
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
