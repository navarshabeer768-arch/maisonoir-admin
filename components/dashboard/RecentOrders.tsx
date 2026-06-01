'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total: number
  status: string
  payment_status: string
  created_at: string
  profile?: { first_name: string | null; last_name: string | null; email: string | null } | null
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed',
  processing: 'status-confirmed', shipped: 'status-shipped',
  delivered: 'status-delivered', cancelled: 'status-cancelled',
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="card-admin p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[9px] tracking-[3px] uppercase text-[#5A5048]">Live Feed</p>
          <p className="font-display text-xl text-[#F0EAD6] mt-0.5">Recent Orders</p>
        </div>
        <Link href="/orders" className="text-[9px] tracking-[2px] uppercase text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(201,168,76,0.08)]">
              {['Order', 'Customer', 'Status', 'Payment', 'Total', 'Date', ''].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const name = [order.profile?.first_name, order.profile?.last_name].filter(Boolean).join(' ') || order.profile?.email || 'Guest'
              return (
                <tr key={order.id} className="border-b border-[rgba(201,168,76,0.05)] hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                  <td className="py-3 px-3 text-[11px] text-[#C9A84C] font-mono">{order.order_number}</td>
                  <td className="py-3 px-3 text-[11px] text-[#9A9080] max-w-[140px] truncate">{name}</td>
                  <td className="py-3 px-3">
                    <span className={STATUS_CLASS[order.status] ?? 'status-pending'}>{order.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={order.payment_status === 'paid' ? 'text-emerald-400 text-[9px]' : 'text-yellow-400 text-[9px]'}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-display text-base text-[#F0EAD6]">${order.total.toFixed(0)}</td>
                  <td className="py-3 px-3 text-[9px] text-[#4A4A4A]">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-3">
                    <Link href={`/orders/${order.id}`} className="text-[#4A4A4A] hover:text-[#C9A84C] transition-colors">
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center py-8 text-[11px] text-[#4A4A4A]">No orders yet</p>
        )}
      </div>
    </div>
  )
}
