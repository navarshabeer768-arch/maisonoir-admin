export const dynamic = 'force-dynamic'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
export const metadata = { title: 'Order Details' }
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let order: any = null
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient()
      const { data } = await supabase.from('orders').select('*, items:order_items(*), profile:profiles(first_name,last_name,email,phone)').eq('id', id).single()
      order = data
    }
  } catch {}
  if (!order) notFound()
  const addr = order.shipping_address as any
  return (
    <AdminLayout currentPage="orders">
      <div className="p-8 max-w-4xl">
        <div className="mb-6">
          <p className="section-eyebrow mb-1">Orders</p>
          <h1 className="font-display text-3xl font-light text-[#2A2420]">{order.order_number}</h1>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Status', value: order.status },
            { label: 'Payment', value: order.payment_status },
            { label: 'Total', value: `$${Number(order.total).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-[rgba(42,36,32,0.07)] p-4 shadow-sm">
              <p className="text-[9px] tracking-[2px] uppercase text-[#9A8A7A] mb-1 font-medium">{label}</p>
              <p className="font-display text-xl text-[#2A2420] capitalize">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm">
            <h3 className="font-display text-lg mb-3 text-[#2A2420]">Customer</h3>
            <p className="text-sm text-[#2A2420] font-medium">{order.profile?.first_name} {order.profile?.last_name}</p>
            <p className="text-sm text-[#6B5E4A]">{order.profile?.email}</p>
          </div>
          <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm">
            <h3 className="font-display text-lg mb-3 text-[#2A2420]">Shipping Address</h3>
            <p className="text-sm text-[#6B5E4A]">{addr?.street_line1}, {addr?.city}, {addr?.country}</p>
          </div>
        </div>
        <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm mt-4">
          <h3 className="font-display text-lg mb-4 text-[#2A2420]">Order Items</h3>
          <table className="w-full">
            <thead><tr className="border-b border-[rgba(42,36,32,0.08)]">
              {['Product','Size','Qty','Unit Price','Total'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-[8px] tracking-[2px] uppercase text-[#9A8A7A] font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {order.items?.map((item: any) => (
                <tr key={item.id} className="border-b border-[rgba(42,36,32,0.04)]">
                  <td className="py-3 px-3 text-sm text-[#2A2420]">{item.product_name}</td>
                  <td className="py-3 px-3 text-sm text-[#6B5E4A]">{item.variant_size_ml}ml</td>
                  <td className="py-3 px-3 text-sm">{item.quantity}</td>
                  <td className="py-3 px-3 text-sm">${item.unit_price}</td>
                  <td className="py-3 px-3 font-display text-base text-[#C9A84C]">${item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
