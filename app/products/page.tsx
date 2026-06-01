export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Plus, Search, Filter } from 'lucide-react'

export const metadata: Metadata = { title: 'Products' }

interface PageProps { searchParams: Promise<{ page?: string; q?: string; status?: string }> }

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const page = parseInt(params.page ?? '1')
  const limit = 20
  const from = (page - 1) * limit

  let query = supabase
    .from('products')
    .select(`
      id, slug, name, status, is_featured, is_bestseller, average_rating, review_count, total_sold, created_at,
      brand:brands(name),
      images:product_images(url, is_primary),
      variants:product_variants(price, stock_quantity, size_ml, is_active)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (params.q) query = query.ilike('name', `%${params.q}%`)
  if (params.status) query = query.eq('status', params.status)

  const { data: products, count } = await query

  return (
    <AdminLayout currentPage="products">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Products</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">{count ?? 0} total</p>
          </div>
          <div className="flex gap-3">
            <Link href="/products/import" className="btn-outline-gold text-[9px] px-4 py-2">Bulk Import</Link>
            <Link href="/products/new" className="btn-gold text-[9px] px-4 py-2 flex items-center gap-2">
              <Plus size={14} /> Add Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <form className="flex items-center gap-2 bg-[#141414] border border-[rgba(201,168,76,0.15)] px-4 py-2 focus-within:border-[#C9A84C] transition-colors flex-1 max-w-sm">
            <Search size={14} className="text-[#5A5048] shrink-0" />
            <input name="q" defaultValue={params.q} placeholder="Search products…" className="bg-transparent text-sm outline-none flex-1 placeholder:text-[#4A4A4A]" />
          </form>
          <div className="flex gap-2">
            {[undefined, 'active', 'draft', 'archived', 'out_of_stock'].map(s => (
              <Link key={s ?? 'all'} href={s ? `/products?status=${s}` : '/products'}
                className={`px-3 py-2 text-[9px] tracking-[1px] uppercase border transition-all ${params.status === s || (!params.status && !s) ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-[rgba(201,168,76,0.2)] text-[#5A5048] hover:border-[rgba(201,168,76,0.4)]'}`}>
                {s ?? 'All'}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card-admin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Product', 'Brand', 'Variants', 'Stock', 'Revenue', 'Rating', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products?.map(p => {
                const img = (p.images as any[])?.find(i => i.is_primary) ?? (p.images as any[])?.[0]
                const activeVariants = (p.variants as any[])?.filter(v => v.is_active)
                const minPrice = Math.min(...(activeVariants?.map((v: any) => v.price) ?? [0]))
                const totalStock = (p.variants as any[])?.reduce((s: number, v: any) => s + v.stock_quantity, 0) ?? 0
                return (
                  <tr key={p.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#1E1E1E] flex items-center justify-center overflow-hidden shrink-0">
                          {img ? <Image src={img.url} alt={p.name} width={40} height={48} className="object-cover" /> : <span className="text-lg">🫙</span>}
                        </div>
                        <div>
                          <p className="text-[11px] text-[#F0EAD6] max-w-[160px] truncate">{p.name}</p>
                          <p className="text-[9px] text-[#4A4A4A] font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#6B5E4A]">{(p.brand as any)?.name}</td>
                    <td className="py-3 px-4 text-[11px] text-[#6B5E4A]">{(p.variants as any[])?.length ?? 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] ${totalStock <= 5 ? 'text-red-400' : totalStock <= 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-display text-base text-[#F0EAD6]">
                      {minPrice > 0 ? `From $${minPrice}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#6B5E4A]">
                      {p.review_count > 0 ? `${Number(p.average_rating).toFixed(1)} ★` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] tracking-[1px] uppercase px-2 py-1 ${
                        p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400'
                          : p.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/products/${p.id}/edit`} className="text-[9px] tracking-[1px] uppercase text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!products?.length && (
            <div className="py-16 text-center">
              <p className="text-[#4A4A4A] font-display text-xl">No products found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(count ?? 0) > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil((count ?? 0) / limit) }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/products?page=${p}${params.q ? `&q=${params.q}` : ''}`}
                className={`w-9 h-9 flex items-center justify-center text-[10px] border transition-all ${p === page ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-[rgba(201,168,76,0.2)] text-[#5A5048] hover:border-[rgba(201,168,76,0.4)]'}`}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
