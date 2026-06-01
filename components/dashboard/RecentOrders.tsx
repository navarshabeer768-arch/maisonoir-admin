'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface Order { id: string; order_number: string; total: number; status: string; payment_status: string; created_at: string; profile?: any }

const STATUS: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-confirmed',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[9px] tracking-[3px] uppercase text-[#9A8A7A] font-medium">Live Feed</p>
          <p className="font-display text-xl text-[#2A2420] mt-0.5">Recent Orders</p>
        </div>
        <Link href="/orders" className="text-[9px] tracking-[1px] uppercase text-[#C9A84C] hover:text-[#9A7A35] transition-colors font-medium">View All →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(42,36,32,0.06)]">
              {['Order', 'Customer', 'Status', 'Payment', 'Total', 'Date', ''].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-[8px] tracking-[2px] uppercase text-[#9A8A7A] font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const name = [order.profile?.first_name, order.profile?.last_name].filter(Boolean).join(' ') || order.profile?.email || 'Guest'
              return (
                <tr key={order.id} className="border-b border-[rgba(42,36,32,0.04)] hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                  <td className="py-3 px-3 text-[11px] text-[#C9A84C] font-mono font-medium">{order.order_number}</td>
                  <td className="py-3 px-3 text-[11px] text-[#6B5E4A] max-w-[140px] truncate">{name}</td>
                  <td className="py-3 px-3"><span className={STATUS[order.status] ?? 'status-pending'}>{order.status}</span></td>
                  <td className="py-3 px-3 text-[9px]">
                    <span className={order.payment_status === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600'}>{order.payment_status}</span>
                  </td>
                  <td className="py-3 px-3 font-display text-base text-[#2A2420]">${Number(order.total).toFixed(0)}</td>
                  <td className="py-3 px-3 text-[9px] text-[#9A8A7A]">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="py-3 px-3">
                    <Link href={`/orders/${order.id}`} className="text-[#9A8A7A] hover:text-[#C9A84C] transition-colors"><ExternalLink size={13} /></Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-[11px] text-[#9A8A7A]">No orders yet</p>}
      </div>
    </div>
  )
}
