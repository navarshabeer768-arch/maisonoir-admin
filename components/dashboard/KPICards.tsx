'use client'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, BarChart3, Package, Percent } from 'lucide-react'

interface KPICardsProps {
  kpis: {
    todayRevenue: number; monthRevenue: number; yearRevenue: number; monthGrowth: number
    todayOrders: number; monthOrders: number; avgOrderValue: number; customerCount: number
  }
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function Trend({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value).toFixed(1)}% vs last month
    </span>
  )
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    { label: 'Revenue Today', value: formatCurrency(kpis.todayRevenue), sub: `${kpis.todayOrders} orders`, icon: DollarSign, color: 'bg-amber-50 text-amber-600', trend: null },
    { label: 'Monthly Revenue', value: formatCurrency(kpis.monthRevenue), sub: `${kpis.monthOrders} orders`, icon: BarChart3, color: 'bg-blue-50 text-blue-600', trend: kpis.monthGrowth },
    { label: 'Annual Revenue', value: formatCurrency(kpis.yearRevenue), sub: 'Year to date', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', trend: null },
    { label: 'Avg Order Value', value: formatCurrency(kpis.avgOrderValue), sub: 'This month', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', trend: null },
    { label: 'Total Customers', value: kpis.customerCount.toLocaleString(), sub: 'Registered', icon: Users, color: 'bg-pink-50 text-pink-600', trend: null },
    { label: 'Conversion Rate', value: '3.8%', sub: '↑ 0.4% this week', icon: Percent, color: 'bg-[rgba(201,168,76,0.1)] text-[#9A7A35]', trend: null },
    { label: 'Orders Today', value: kpis.todayOrders.toString(), sub: `${kpis.monthOrders} this month`, icon: Package, color: 'bg-orange-50 text-orange-600', trend: null },
    { label: 'Inventory Value', value: '$1.2M', sub: '486 active SKUs', icon: Package, color: 'bg-teal-50 text-teal-600', trend: null },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, trend }) => (
        <div key={label} className="bg-white border border-[rgba(42,36,32,0.07)] p-5 hover:shadow-md hover:border-[rgba(201,168,76,0.2)] transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] tracking-[2px] uppercase text-[#9A8A7A] font-medium">{label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={14} />
            </div>
          </div>
          <p className="font-display text-3xl text-[#2A2420] mb-1">{value}</p>
          {trend !== null ? <Trend value={trend} /> : <p className="text-[10px] text-[#9A8A7A]">{sub}</p>}
        </div>
      ))}
    </div>
  )
}
