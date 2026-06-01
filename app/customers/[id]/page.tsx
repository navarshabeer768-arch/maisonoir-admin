export const dynamic = 'force-dynamic'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/server'
export const metadata = { title: 'Customer Details' }
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let customer: any = null, orders: any[] = [], loyalty: any = null
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient()
      const [c, o, l] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('orders').select('id,order_number,total,status,created_at').eq('profile_id', id).order('created_at', { ascending: false }).limit(10),
        supabase.from('loyalty_accounts').select('*').eq('profile_id', id).single(),
      ])
      customer = c.data; orders = o.data ?? []; loyalty = l.data
    }
  } catch {}
  if (!customer) return <AdminLayout currentPage="customers"><div className="p-8"><p>Customer not found</p></div></AdminLayout>
  return (
    <AdminLayout currentPage="customers">
      <div className="p-8 max-w-4xl">
        <div className="mb-6">
          <p className="section-eyebrow mb-1">Customers</p>
          <h1 className="font-display text-3xl font-light text-[#2A2420]">{customer.first_name} {customer.last_name}</h1>
          <p className="text-[#9A8A7A] text-sm mt-1">{customer.email}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Role', value: customer.role },
            { label: 'Loyalty Tier', value: loyalty?.tier ?? 'Bronze' },
            { label: 'Points', value: (loyalty?.points_balance ?? 0).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-[rgba(42,36,32,0.07)] p-4 shadow-sm">
              <p className="text-[9px] tracking-[2px] uppercase text-[#9A8A7A] mb-1 font-medium">{label}</p>
              <p className="font-display text-xl text-[#2A2420] capitalize">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm">
          <h3 className="font-display text-lg mb-4 text-[#2A2420]">Order History</h3>
          {orders.length === 0 ? <p className="text-sm text-[#9A8A7A]">No orders yet</p> : (
            <table className="w-full">
              <thead><tr className="border-b border-[rgba(42,36,32,0.08)]">
                {['Order','Status','Total','Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[8px] tracking-[2px] uppercase text-[#9A8A7A] font-semibold">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-[rgba(42,36,32,0.04)]">
                    <td className="py-2.5 px-3 text-[11px] text-[#C9A84C] font-mono">{o.order_number}</td>
                    <td className="py-2.5 px-3 text-[11px] capitalize text-[#6B5E4A]">{o.status}</td>
                    <td className="py-2.5 px-3 font-display text-base text-[#2A2420]">${Number(o.total).toFixed(0)}</td>
                    <td className="py-2.5 px-3 text-[10px] text-[#9A8A7A]">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
