import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface StockItem {
  id: string
  sku: string
  size_ml: number
  stock_quantity: number
  reserved_quantity: number
  low_stock_threshold: number
  product?: { name: string; brand?: { name: string } | null; images?: { url: string; is_primary: boolean }[] | null } | null
}

export function LowStockAlerts({ items }: { items: StockItem[] }) {
  return (
    <div className="card-admin p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          <p className="font-display text-lg text-[#F0EAD6]">Low Stock</p>
        </div>
        <Link href="/inventory?filter=low-stock" className="text-[9px] tracking-[1px] uppercase text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">
          Manage →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-emerald-400 flex items-center gap-2">
          <span>✓</span> All stock levels healthy
        </p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map(item => {
            const available = item.stock_quantity - item.reserved_quantity
            return (
              <div key={item.id} className="flex items-center justify-between border-b border-[rgba(201,168,76,0.06)] pb-3 last:border-0 last:pb-0">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] text-[#F0EAD6] truncate">{item.product?.name}</p>
                  <p className="text-[9px] text-[#4A4A4A]">{item.size_ml}ml · {item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-display ${available <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {available}
                  </p>
                  <p className="text-[8px] text-[#4A4A4A]">left</p>
                </div>
              </div>
            )
          })}
          {items.length > 5 && (
            <p className="text-[9px] text-[#4A4A4A] text-center">+{items.length - 5} more items</p>
          )}
        </div>
      )}
    </div>
  )
}
