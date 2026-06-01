interface TopProduct { name: string; brand: string; revenue: number; units: number }

export function TopProducts({ products }: { products: TopProduct[] }) {
  const maxRev = Math.max(...products.map(p => p.revenue), 1)
  return (
    <div className="card-admin p-5">
      <p className="text-[9px] tracking-[3px] uppercase text-[#5A5048] mb-1">Performance</p>
      <p className="font-display text-lg text-[#F0EAD6] mb-5">Top Products</p>
      <div className="space-y-4">
        {products.map((p, i) => (
          <div key={i}>
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 pr-3">
                <p className="text-[10px] text-[#C9A84C] tracking-[0.5px] truncate">{p.brand}</p>
                <p className="text-[11px] text-[#F0EAD6] truncate">{p.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-base text-[#C9A84C]">${(p.revenue / 1000).toFixed(1)}K</p>
                <p className="text-[9px] text-[#4A4A4A]">{p.units} units</p>
              </div>
            </div>
            <div className="h-0.5 bg-[rgba(201,168,76,0.08)]">
              <div className="h-full bg-[#C9A84C] transition-all" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-[11px] text-[#4A4A4A]">No data yet</p>}
      </div>
    </div>
  )
}
