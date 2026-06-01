'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart3,
  Tag, MessageSquare, Settings, ChevronDown, ChevronRight,
  ExternalLink, LogOut, Bell, Sun, Moon, Warehouse, Megaphone, UserCog
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  roles?: string[]
  badge?: string
  children?: { label: string; href: string }[]
}

const NAV: NavItem[] = [
  {
    label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard,
  },
  {
    label: 'Analytics', href: '/analytics', icon: BarChart3,
    children: [
      { label: 'Revenue', href: '/analytics/revenue' },
      { label: 'Products', href: '/analytics/products' },
      { label: 'Customers', href: '/analytics/customers' },
      { label: 'Inventory', href: '/analytics/inventory' },
    ],
  },
  {
    label: 'Products', href: '/products', icon: ShoppingBag,
    children: [
      { label: 'All Products', href: '/products' },
      { label: 'Add Product', href: '/products/new' },
      { label: 'Categories', href: '/products/categories' },
      { label: 'Brands', href: '/products/brands' },
      { label: 'Bulk Import', href: '/products/import' },
    ],
  },
  {
    label: 'Orders', href: '/orders', icon: Package,
    children: [
      { label: 'All Orders', href: '/orders' },
      { label: 'Pending', href: '/orders?status=pending' },
      { label: 'Returns', href: '/orders/returns' },
      { label: 'Refunds', href: '/orders/refunds' },
    ],
  },
  {
    label: 'Inventory', href: '/inventory', icon: Warehouse,
    roles: ['founder', 'admin', 'operations_manager', 'warehouse_staff'],
  },
  {
    label: 'Customers', href: '/customers', icon: Users,
    children: [
      { label: 'All Customers', href: '/customers' },
      { label: 'Loyalty Program', href: '/customers/loyalty' },
      { label: 'Reviews', href: '/customers/reviews' },
    ],
  },
  {
    label: 'Marketing', href: '/marketing', icon: Megaphone,
    roles: ['founder', 'admin', 'marketing_manager'],
    children: [
      { label: 'Campaigns', href: '/marketing/campaigns' },
      { label: 'Coupons', href: '/marketing/coupons' },
      { label: 'Email', href: '/marketing/email' },
    ],
  },
  {
    label: 'Support', href: '/support', icon: MessageSquare,
    badge: '3',
    roles: ['founder', 'admin', 'customer_support'],
  },
  {
    label: 'Staff', href: '/staff', icon: UserCog,
    roles: ['founder', 'admin'],
  },
  {
    label: 'Settings', href: '/settings', icon: Settings,
    roles: ['founder', 'admin'],
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
  userRole?: string
}

export function AdminLayout({ children, userRole = 'admin' }: AdminLayoutProps) {
  const [expanded, setExpanded] = useState<string[]>(['dashboard'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  const toggleExpand = (href: string) => {
    setExpanded(prev =>
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNav = NAV.filter(item =>
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-[#111111] border-r border-[rgba(201,168,76,0.1)] flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="px-6 py-7 border-b border-[rgba(201,168,76,0.1)]">
          {sidebarOpen ? (
            <div>
              <div className="font-display text-lg tracking-[4px] text-[#C9A84C] uppercase">Maison Noir</div>
              <div className="text-[8px] tracking-[3px] text-[#5A5048] uppercase mt-1">Founder Control Panel</div>
            </div>
          ) : (
            <div className="font-display text-lg text-[#C9A84C]">M</div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            const isExpanded = expanded.includes(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.href} className="mb-0.5">
                <button
                  onClick={() => {
                    if (hasChildren) { toggleExpand(item.href) } else { router.push(item.href) }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-left border-l-2 ${
                    isActive
                      ? 'text-[#C9A84C] border-[#C9A84C] bg-[rgba(201,168,76,0.06)]'
                      : 'text-[#6B5E4A] border-transparent hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.04)]'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="text-[11px] tracking-[0.5px] flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="w-5 h-5 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                    </>
                  )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && sidebarOpen && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-[rgba(201,168,76,0.1)] pl-3">
                    {item.children!.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block py-2 px-2 text-[10px] tracking-[0.5px] transition-colors ${
                          pathname === child.href
                            ? 'text-[#C9A84C]'
                            : 'text-[#5A5048] hover:text-[#C9A84C]'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom actions */}
        {sidebarOpen && (
          <div className="p-4 border-t border-[rgba(201,168,76,0.1)] space-y-1">
            <a
              href={process.env.NEXT_PUBLIC_STORE_URL ?? 'https://maisonoir.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-[10px] text-[#5A5048] hover:text-[#C9A84C] transition-colors"
            >
              <ExternalLink size={14} />
              View Storefront
            </a>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-[10px] text-[#5A5048] hover:text-[#C9A84C] transition-colors w-full"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-[10px] text-[#5A5048] hover:text-red-400 transition-colors w-full"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-[rgba(201,168,76,0.1)] bg-[#111111] flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#5A5048] hover:text-[#C9A84C] transition-colors"
          >
            <LayoutDashboard size={16} />
          </button>
          <div className="flex items-center gap-4">
            <button className="relative text-[#5A5048] hover:text-[#C9A84C] transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C9A84C] text-[#0A0A0A] text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="w-8 h-8 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center font-display text-sm text-[#C9A84C]">
              F
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
