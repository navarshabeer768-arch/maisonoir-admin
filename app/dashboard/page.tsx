export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { KPICards } from '@/components/dashboard/KPICards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesByCategory } from '@/components/dashboard/SalesByCategory'
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { kpis: getDefaultKpis(), recentOrders: [], topProducts: [], lowStock: [], revenueByMonth: [] }
    }
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    const [
      { data: todayOrders },
      { data: monthOrders },
      { data: yearOrders },
      { data: lastMonthOrders },
      { data: recentOrders },
      { data: topProducts },
      { data: lowStock },
      { count: customerCount },
    ] = await Promise.all([
      supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', todayStart),
      supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', monthStart),
      supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', yearStart),
      supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
      supabase.from('orders').select('id, order_number, total, status, payment_status, created_at, profile:profiles(first_name, last_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('order_items').select('product_id, product_name, product_brand, quantity, total_price').order('total_price', { ascending: false }).limit(20),
      supabase.from('product_variants').select('id, sku, size_ml, stock_quantity, reserved_quantity, low_stock_threshold, product:products(name, brand:brands(name))').filter('stock_quantity', 'lte', 'low_stock_threshold').limit(10),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    ])

    const todayRevenue = todayOrders?.reduce((s, o) => s + o.total, 0) ?? 0
    const monthRevenue = monthOrders?.reduce((s, o) => s + o.total, 0) ?? 0
    const yearRevenue = yearOrders?.reduce((s, o) => s + o.total, 0) ?? 0
    const lastMonthRevenue = lastMonthOrders?.reduce((s, o) => s + o.total, 0) ?? 0
    const monthGrowth = lastMonthRevenue > 0 ? parseFloat(((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)) : 0
    const avgOrderValue = monthOrders?.length ? monthRevenue / monthOrders.length : 0

    const productMap = new Map()
    topProducts?.forEach(item => {
      const e = productMap.get(item.product_id)
      if (e) { e.revenue += item.total_price; e.units += item.quantity }
      else productMap.set(item.product_id, { name: item.product_name, brand: item.product_brand ?? '', revenue: item.total_price, units: item.quantity })
    })

    return {
      kpis: { todayRevenue, monthRevenue, yearRevenue, monthGrowth, todayOrders: todayOrders?.length ?? 0, monthOrders: monthOrders?.length ?? 0, avgOrderValue, customerCount: customerCount ?? 0 },
      recentOrders: recentOrders ?? [],
      topProducts: Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      lowStock: lowStock ?? [],
      revenueByMonth: [],
    }
  } catch (e) {
    console.error('Dashboard data error:', e)
    return { kpis: getDefaultKpis(), recentOrders: [], topProducts: [], lowStock: [], revenueByMonth: [] }
  }
}

function getDefaultKpis() {
  return { todayRevenue: 0, monthRevenue: 0, yearRevenue: 0, monthGrowth: 0, todayOrders: 0, monthOrders: 0, avgOrderValue: 0, customerCount: 0 }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return (
    <AdminLayout currentPage="dashboard">
      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl font-light">Executive Dashboard</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Live Data
            </p>
          </div>
          <a href="/products/new" className="btn-gold text-[9px] px-4 py-2">+ Add Product</a>
        </div>
        <KPICards kpis={data.kpis} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RevenueChart data={data.revenueByMonth} /></div>
          <div><SalesByCategory /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RecentOrders orders={data.recentOrders as any} /></div>
          <div className="space-y-6">
            <TopProducts products={data.topProducts} />
            <LowStockAlerts items={data.lowStock as any} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
