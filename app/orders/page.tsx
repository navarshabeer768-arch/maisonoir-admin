import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Orders' }

interface PageProps { searchParams: Promise<{ page?: string; status?: string; q?: string }> }

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-confirmed',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
  refunded: 'bg-purple-500/10 text-purple-400 px-2.5 py-1 text-[8px] tracking-[1.5px] uppercase',
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1')
  const limit = 25
  const from = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, total, status, payment_status, payment_method, currency,
      shipping_address, created_at, updated_at,
      profile:profiles(first_name, last_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (params.status) query = query.eq('status', params.status)
  if (params.q) query = query.or(`order_number.ilike.%${params.q}%`)

  const { data: orders, count } = await query

  const STATUSES = [undefined, 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  return (
    <AdminLayout currentPage="orders">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Orders</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">{count ?? 0} total orders</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline-gold text-[9px] px-4 py-2">Export CSV</button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUSES.map(s => (
            <Link key={s ?? 'all'} href={s ? `/orders?status=${s}` : '/orders'}
              className={`px-4 py-2 text-[9px] tracking-[1px] uppercase border transition-all ${params.status === s || (!params.status && !s) ? 'border-[#C9A84C] text-[#C9A84C] bg-[rgba(201,168,76,0.06)]' : 'border-[rgba(201,168,76,0.15)] text-[#5A5048] hover:border-[rgba(201,168,76,0.4)]'}`}>
              {s ?? 'All'}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="card-admin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Order #', 'Customer', 'Ship To', 'Status', 'Payment', 'Total', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders?.map(order => {
                const profile = order.profile as any
                const name = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email : 'Guest'
                const addr = order.shipping_address as any
                return (
                  <tr key={order.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                    <td className="py-3 px-4 text-[11px] text-[#C9A84C] font-mono">{order.order_number}</td>
                    <td className="py-3 px-4 text-[11px] text-[#9A9080] max-w-[140px] truncate">{name}</td>
                    <td className="py-3 px-4 text-[11px] text-[#5A5048]">{addr?.city}, {addr?.country}</td>
                    <td className="py-3 px-4"><span className={STATUS_CLASS[order.status] ?? 'status-pending'}>{order.status}</span></td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] ${order.payment_status === 'paid' ? 'text-emerald-400' : order.payment_status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-display text-base">${Number(order.total).toFixed(0)}</td>
                    <td className="py-3 px-4 text-[9px] text-[#4A4A4A]">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/orders/${order.id}`} className="text-[9px] uppercase tracking-[1px] text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!orders?.length && (
            <div className="py-16 text-center"><p className="text-[#4A4A4A] font-display text-xl">No orders found</p></div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
