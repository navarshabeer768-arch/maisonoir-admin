export const dynamic = 'force-dynamic'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createClient } from '@/lib/supabase/server'
export const metadata = { title: 'Categories' }
export default async function CategoriesPage() {
  let categories: any[] = []
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient()
      const { data } = await supabase.from('categories').select('*').order('display_order')
      categories = data ?? []
    }
  } catch {}
  return (
    <AdminLayout currentPage="products">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div><p className="section-eyebrow mb-1">Products</p><h1 className="font-display text-3xl font-light text-[#2A2420]">Categories</h1></div>
        </div>
        <div className="bg-white border border-[rgba(42,36,32,0.07)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[rgba(42,36,32,0.08)] bg-[#FAF8F5]">
              {['Name','Arabic Name','Slug','Order','Active'].map(h => (
                <th key={h} className="text-left py-3 px-5 text-[8px] tracking-[2px] uppercase text-[#9A8A7A] font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-[rgba(42,36,32,0.04)] hover:bg-[rgba(201,168,76,0.03)]">
                  <td className="py-3 px-5 text-[12px] font-medium text-[#2A2420]">{c.name}</td>
                  <td className="py-3 px-5 text-[12px] text-[#6B5E4A]" dir="rtl">{c.name_ar ?? '—'}</td>
                  <td className="py-3 px-5 text-[10px] text-[#9A8A7A] font-mono">{c.slug}</td>
                  <td className="py-3 px-5 text-[12px] text-[#6B5E4A]">{c.display_order}</td>
                  <td className="py-3 px-5"><span className={`text-[9px] px-2 py-1 uppercase ${c.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-[#9A8A7A] text-sm">No categories yet. Run the SQL schema first.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
