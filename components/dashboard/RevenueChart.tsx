'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DEMO = [
  { month: 'Jan', revenue: 42000, orders: 158 }, { month: 'Feb', revenue: 38000, orders: 142 },
  { month: 'Mar', revenue: 51000, orders: 189 }, { month: 'Apr', revenue: 47000, orders: 176 },
  { month: 'May', revenue: 63000, orders: 234 }, { month: 'Jun', revenue: 58000, orders: 218 },
  { month: 'Jul', revenue: 71000, orders: 267 }, { month: 'Aug', revenue: 69000, orders: 258 },
  { month: 'Sep', revenue: 82000, orders: 308 }, { month: 'Oct', revenue: 78000, orders: 291 },
  { month: 'Nov', revenue: 94000, orders: 352 }, { month: 'Dec', revenue: 112000, orders: 420 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-[rgba(42,36,32,0.1)] shadow-lg px-4 py-3 text-xs">
        <p className="text-[#C9A84C] text-[9px] tracking-[2px] uppercase font-semibold mb-1">{label}</p>
        <p className="text-[#2A2420]">Revenue: <span className="text-[#C9A84C] font-semibold">${payload[0]?.value?.toLocaleString()}</span></p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data }: { data?: any[] }) {
  const chartData = data?.length ? data : DEMO
  return (
    <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[9px] tracking-[3px] uppercase text-[#9A8A7A] font-medium">Revenue</p>
          <p className="font-display text-xl text-[#2A2420] mt-0.5">Last 12 Months</p>
        </div>
        <div className="flex gap-2">
          {['3M','6M','1Y'].map(p => (
            <button key={p} className={`text-[9px] px-3 py-1.5 border rounded transition-colors ${p === '1Y' ? 'border-[#C9A84C] text-[#C9A84C] bg-[rgba(201,168,76,0.06)]' : 'border-[rgba(42,36,32,0.12)] text-[#9A8A7A] hover:border-[rgba(201,168,76,0.4)]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,36,32,0.06)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#9A8A7A', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9A8A7A', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revenueGrad)"
            dot={false} activeDot={{ r: 4, fill: '#C9A84C', stroke: 'white', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
