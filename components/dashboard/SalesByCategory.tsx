'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const DEMO = [
  { name: 'Women', value: 32 },
  { name: 'Men', value: 28 },
  { name: 'Arabic', value: 22 },
  { name: 'Niche', value: 12 },
  { name: 'Unisex', value: 6 },
]
const COLORS = ['#C9A84C', '#9A7A35', '#E8D5A3', '#7A5F28', '#5A451C']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-[#1E1E1E] border border-[rgba(201,168,76,0.3)] px-3 py-2 text-xs">
        <p className="text-[#C9A84C]">{payload[0].name}</p>
        <p className="text-[#F0EAD6]">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export function SalesByCategory() {
  return (
    <div className="card-admin p-6 h-full">
      <p className="text-[9px] tracking-[3px] uppercase text-[#5A5048] mb-1">Breakdown</p>
      <p className="font-display text-xl text-[#F0EAD6] mb-4">Sales by Category</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={DEMO} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
            {DEMO.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {DEMO.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-[10px] text-[#6B5E4A]">{item.name}</span>
            </div>
            <span className="text-[10px] text-[#C9A84C]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
