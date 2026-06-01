interface TopProduct { name: string; brand: string; revenue: number; units: number }
export function TopProducts({ products }: { products: TopProduct[] }) {
  const maxRev = Math.max(...products.map(p => p.revenue), 1)
  return (
    <div className="bg-white border border-[rgba(42,36,32,0.07)] p-5 shadow-sm">
      <p className="text-[9px] tracking-[3px] uppercase text-[#9A8A7A] font-medium mb-1">Performance</p>
      <p className="font-display text-lg text-[#2A2420] mb-5">Top Products</p>
      <div className="space-y-4">
        {products.map((p, i) => (
          <div key={i}>
            <div className="flex items-start justify-between mb-1.5">
              <div className="min-w-0 pr-3">
                <p className="text-[9px] text-[#C9A84C] font-medium truncate">{p.brand}</p>
                <p className="text-[11px] text-[#2A2420] truncate">{p.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-base text-[#2A2420]">${(p.revenue/1000).toFixed(1)}K</p>
                <p className="text-[9px] text-[#9A8A7A]">{p.units} units</p>
              </div>
            </div>
            <div className="h-1 bg-[rgba(42,36,32,0.06)] rounded-full">
              <div className="h-full bg-[#C9A84C] rounded-full" style={{ width: `${(p.revenue/maxRev)*100}%` }} />
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-[11px] text-[#9A8A7A]">No data yet</p>}
      </div>
    </div>
  )
}
