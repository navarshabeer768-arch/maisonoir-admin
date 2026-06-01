export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Inventory' }

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: variants, count } = await supabase
    .from('product_variants')
    .select(`
      id, sku, size_ml, stock_quantity, reserved_quantity, low_stock_threshold, cost_price, price,
      product:products(
        id, name, status,
        brand:brands(name),
        images:product_images(url, is_primary)
      )
    `, { count: 'exact' })
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(50)

  const totalValue = variants?.reduce((s, v) => s + (v.cost_price ?? v.price ?? 0) * v.stock_quantity, 0) ?? 0

  return (
    <AdminLayout currentPage="inventory">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Inventory</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">
              {count ?? 0} SKUs · Est. value ${(totalValue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline-gold text-[9px] px-4 py-2">Import Stock CSV</button>
            <Link href="/inventory/adjustment" className="btn-gold text-[9px] px-4 py-2">+ Adjustment</Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total SKUs', value: (count ?? 0).toString() },
            { label: 'Out of Stock', value: (variants?.filter(v => v.stock_quantity === 0).length ?? 0).toString() },
            { label: 'Low Stock', value: (variants?.filter(v => v.stock_quantity > 0 && v.stock_quantity <= v.low_stock_threshold).length ?? 0).toString() },
            { label: 'Est. Value', value: `$${(totalValue / 1000).toFixed(0)}K` },
          ].map(({ label, value }) => (
            <div key={label} className="card-admin p-4">
              <p className="text-[8px] tracking-[2px] uppercase text-[#5A5048] mb-2">{label}</p>
              <p className="font-display text-2xl text-[#F0EAD6]">{value}</p>
            </div>
          ))}
        </div>

        <div className="card-admin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Product', 'SKU', 'Size', 'In Stock', 'Reserved', 'Available', 'Cost', 'Retail', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants?.map(v => {
                const product = v.product as any
                const img = product?.images?.find((i: any) => i.is_primary) ?? product?.images?.[0]
                const available = v.stock_quantity - v.reserved_quantity
                const status = v.stock_quantity === 0 ? 'out' : available <= v.low_stock_threshold ? 'low' : 'ok'
                return (
                  <tr key={v.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-[#1E1E1E] overflow-hidden shrink-0">
                          {img ? <Image src={img.url} alt="" width={32} height={40} className="object-cover" /> : <span className="text-lg flex items-center justify-center h-full">🫙</span>}
                        </div>
                        <span className="text-[11px] max-w-[140px] truncate">{product?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-[#4A4A4A] font-mono">{v.sku}</td>
                    <td className="py-3 px-4 text-[11px] text-[#6B5E4A]">{v.size_ml}ml</td>
                    <td className="py-3 px-4 text-[11px] font-medium">{v.stock_quantity}</td>
                    <td className="py-3 px-4 text-[11px] text-[#5A5048]">{v.reserved_quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`font-display text-base ${status === 'out' ? 'text-red-400' : status === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {available}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#5A5048]">{v.cost_price ? `$${v.cost_price}` : '—'}</td>
                    <td className="py-3 px-4 text-[11px] text-[#C9A84C]">${v.price}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[8px] uppercase tracking-[1px] px-2 py-1 ${
                        status === 'out' ? 'bg-red-500/10 text-red-400' : status === 'low' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
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
