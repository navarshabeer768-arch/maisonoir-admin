'use client'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, BarChart3, Package, Percent } from 'lucide-react'

interface KPICardsProps {
  kpis: {
    todayRevenue: number
    monthRevenue: number
    yearRevenue: number
    monthGrowth: number
    todayOrders: number
    monthOrders: number
    avgOrderValue: number
    customerCount: number
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
    <span className={`flex items-center gap-1 text-[10px] ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value).toFixed(1)}% vs last month
    </span>
  )
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      label: 'Revenue Today',
      value: formatCurrency(kpis.todayRevenue),
      sub: `${kpis.todayOrders} orders today`,
      icon: DollarSign,
      trend: null,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(kpis.monthRevenue),
      sub: `${kpis.monthOrders} orders this month`,
      icon: BarChart3,
      trend: kpis.monthGrowth,
    },
    {
      label: 'Annual Revenue',
      value: formatCurrency(kpis.yearRevenue),
      sub: 'Year to date',
      icon: TrendingUp,
      trend: null,
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(kpis.avgOrderValue),
      sub: 'This month',
      icon: ShoppingBag,
      trend: null,
    },
    {
      label: 'Total Customers',
      value: kpis.customerCount.toLocaleString(),
      sub: 'Registered users',
      icon: Users,
      trend: null,
    },
    {
      label: 'Conversion Rate',
      value: '3.8%',
      sub: '↑ 0.4% this week',
      icon: Percent,
      trend: null,
    },
    {
      label: 'Inventory Value',
      value: '$1.2M',
      sub: '486 active SKUs',
      icon: Package,
      trend: null,
    },
    {
      label: 'Orders Today',
      value: kpis.todayOrders.toString(),
      sub: `${kpis.monthOrders} this month`,
      icon: Package,
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, trend }) => (
        <div
          key={label}
          className="bg-[#141414] border border-[rgba(201,168,76,0.1)] p-5 hover:border-[rgba(201,168,76,0.25)] transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[8px] tracking-[3px] uppercase text-[#5A5048]">{label}</p>
            <div className="w-8 h-8 bg-[rgba(201,168,76,0.08)] flex items-center justify-center group-hover:bg-[rgba(201,168,76,0.15)] transition-colors">
              <Icon size={14} className="text-[#C9A84C]" />
            </div>
          </div>
          <p className="font-display text-3xl text-[#F0EAD6] mb-2">{value}</p>
          {trend !== null ? (
            <Trend value={trend} />
          ) : (
            <p className="text-[9px] text-[#5A5048]">{sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
