import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
interface StockItem { id: string; sku: string; size_ml: number; stock_quantity: number; reserved_quantity: number; low_stock_threshold: number; product?: any }
export function LowStockAlerts({ items }: { items: StockItem[] }) {
  return (
    <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <p className="font-display text-lg text-[#2A2420]">Low Stock</p>
        </div>
        <Link href="/inventory?filter=low-stock" className="text-[9px] uppercase text-[#C9A84C] hover:text-[#9A7A35] transition-colors font-medium">Manage →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-emerald-600 flex items-center gap-2 font-medium"><span>✓</span> All stock levels healthy</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0,5).map(item => {
            const available = item.stock_quantity - item.reserved_quantity
            return (
              <div key={item.id} className="flex items-center justify-between border-b border-[rgba(42,36,32,0.05)] pb-3 last:border-0 last:pb-0">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] text-[#2A2420] truncate font-medium">{item.product?.name}</p>
                  <p className="text-[9px] text-[#9A8A7A]">{item.size_ml}ml · {item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-display ${available <= 0 ? 'text-red-500' : 'text-amber-500'}`}>{available}</p>
                  <p className="text-[8px] text-[#9A8A7A]">left</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
