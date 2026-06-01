export const dynamic = 'force-dynamic'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AddProductForm } from '@/components/products/AddProductForm'
import { createClient } from '@/lib/supabase/server'
export const metadata = { title: 'Add New Product' }

export default async function AddProductPage() {
  let brands: any[] = []
  let categories: any[] = []
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient()
      const [b, c] = await Promise.all([
        supabase.from('brands').select('id, name').eq('is_active', true).order('name'),
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
      ])
      brands = b.data ?? []
      categories = c.data ?? []
    }
  } catch {}
  return (
    <AdminLayout currentPage="products">
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <p className="section-eyebrow mb-1">Products</p>
          <h1 className="font-display text-3xl font-light text-[#2A2420]">Add New Product</h1>
        </div>
        <AddProductForm brands={brands} categories={categories} />
      </div>
    </AdminLayout>
  )
}
