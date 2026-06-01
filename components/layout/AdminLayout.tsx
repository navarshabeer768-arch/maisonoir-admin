'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart3,
  Megaphone, MessageSquare, Settings, ChevronDown, ChevronRight,
  ExternalLink, LogOut, Bell, Warehouse, UserCog, Menu, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, children: [
    { label: 'Revenue', href: '/analytics/revenue' },
    { label: 'Products', href: '/analytics/products' },
    { label: 'Customers', href: '/analytics/customers' },
  ]},
  { label: 'Products', href: '/products', icon: ShoppingBag, children: [
    { label: 'All Products', href: '/products' },
    { label: 'Add Product', href: '/products/new' },
    { label: 'Categories', href: '/products/categories' },
    { label: 'Brands', href: '/products/brands' },
    { label: 'Bulk Import', href: '/products/import' },
  ]},
  { label: 'Orders', href: '/orders', icon: Package, children: [
    { label: 'All Orders', href: '/orders' },
    { label: 'Returns', href: '/orders/returns' },
    { label: 'Refunds', href: '/orders/refunds' },
  ]},
  { label: 'Inventory', href: '/inventory', icon: Warehouse },
  { label: 'Customers', href: '/customers', icon: Users, children: [
    { label: 'All Customers', href: '/customers' },
    { label: 'Loyalty', href: '/customers/loyalty' },
    { label: 'Reviews', href: '/customers/reviews' },
  ]},
  { label: 'Marketing', href: '/marketing', icon: Megaphone, children: [
    { label: 'Campaigns', href: '/marketing/campaigns' },
    { label: 'Coupons', href: '/marketing/coupons' },
    { label: 'Email', href: '/marketing/email' },
  ]},
  { label: 'Support', href: '/support', icon: MessageSquare },
  { label: 'Staff', href: '/staff', icon: UserCog },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [expanded, setExpanded] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const toggle = (href: string) => {
    setExpanded(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#F5F2EE] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-white border-r border-[rgba(42,36,32,0.08)] flex flex-col transition-all duration-300 shadow-sm`}>
        {/* Logo */}
        <div className={`px-5 py-5 border-b border-[rgba(42,36,32,0.06)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div>
              <div className="font-display text-lg tracking-[4px] text-[#C9A84C] uppercase leading-none">Maison Noir</div>
              <div className="text-[8px] tracking-[2px] text-[#9A8A7A] uppercase mt-0.5">Admin Panel</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-[#9A8A7A] hover:text-[#2A2420] transition-colors p-1">
            {collapsed ? <Menu size={16} /> : <X size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            const isExpanded = expanded.includes(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.href} className="mb-0.5">
                <button
                  onClick={() => { hasChildren ? toggle(item.href) : router.push(item.href) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[rgba(201,168,76,0.1)] text-[#9A7A35] font-medium'
                      : 'text-[#6B5E4A] hover:bg-[rgba(42,36,32,0.04)] hover:text-[#2A2420]'
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-[11px] tracking-[0.3px] flex-1">{item.label}</span>
                      {hasChildren && (
                        isExpanded
                          ? <ChevronDown size={11} className="opacity-60" />
                          : <ChevronRight size={11} className="opacity-60" />
                      )}
                    </>
                  )}
                </button>

                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-[rgba(201,168,76,0.2)] pl-3">
                    {item.children!.map(child => (
                      <Link key={child.href} href={child.href}
                        className={`block py-1.5 px-2 text-[10px] tracking-[0.3px] rounded transition-colors ${
                          pathname === child.href
                            ? 'text-[#C9A84C] font-medium bg-[rgba(201,168,76,0.06)]'
                            : 'text-[#9A8A7A] hover:text-[#2A2420]'
                        }`}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom */}
        {!collapsed && (
          <div className="p-3 border-t border-[rgba(42,36,32,0.06)] space-y-0.5">
            <a href={process.env.NEXT_PUBLIC_STORE_URL ?? 'https://maisonoir.com'} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-[10px] text-[#9A8A7A] hover:text-[#2A2420] hover:bg-[rgba(42,36,32,0.04)] rounded transition-colors">
              <ExternalLink size={13} /> View Storefront
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-[10px] text-[#9A8A7A] hover:text-red-500 hover:bg-red-50 rounded transition-colors w-full">
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-13 bg-white border-b border-[rgba(42,36,32,0.08)] flex items-center justify-between px-6 py-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span className="text-[9px] tracking-[1px] text-[#9A8A7A] uppercase">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-[#9A8A7A] hover:text-[#2A2420] transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C9A84C] text-white text-[7px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="w-8 h-8 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center font-display text-sm text-[#C9A84C] rounded-full">
              F
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F5F2EE]">
          {children}
        </main>
      </div>
    </div>
  )
}
