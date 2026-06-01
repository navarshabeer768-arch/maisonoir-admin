export const dynamic = 'force-dynamic'
import { AdminLayout } from '@/components/layout/AdminLayout'
export const metadata = { title: 'Coupons' }
export default function Page() {
  return (
    <AdminLayout currentPage="marketing">
      <div className="p-8">
        <p className="text-[9px] tracking-[3px] uppercase text-[#5A5048] mb-2">marketing</p>
        <h1 className="font-display text-3xl font-light mb-8">Coupons</h1>
        <div className="card-admin p-12 text-center">
          <p className="font-display text-2xl text-[#5A5048] mb-2">Coming Soon</p>
          <p className="text-[10px] text-[#3A3530]">This section is under construction.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
