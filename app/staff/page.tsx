export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Staff Management' }

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder', admin: 'Admin', operations_manager: 'Operations',
  marketing_manager: 'Marketing', customer_support: 'Support', warehouse_staff: 'Warehouse',
}
const ROLE_COLORS: Record<string, string> = {
  founder: 'text-[#C9A84C] bg-[rgba(201,168,76,0.1)]',
  admin: 'text-blue-400 bg-blue-500/10',
  operations_manager: 'text-purple-400 bg-purple-500/10',
  marketing_manager: 'text-pink-400 bg-pink-500/10',
  customer_support: 'text-green-400 bg-green-500/10',
  warehouse_staff: 'text-orange-400 bg-orange-500/10',
}

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: staff } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, is_active, last_login_at, created_at')
    .neq('role', 'customer')
    .order('created_at')

  return (
    <AdminLayout currentPage="staff">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light">Staff Management</h1>
            <p className="text-[10px] tracking-[2px] text-[#5A5048] uppercase mt-1">{staff?.length ?? 0} team members</p>
          </div>
          <button className="btn-gold text-[9px] px-4 py-2">+ Invite Staff</button>
        </div>

        <div className="card-admin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.08)]">
                {['Name', 'Email', 'Role', 'Last Active', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[8px] tracking-[2px] uppercase text-[#4A4A4A] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff?.map(s => (
                <tr key={s.id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[#C9A84C] font-display text-sm">
                        {(s.first_name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <span className="text-[11px]">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#5A5048]">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[8px] px-2.5 py-1 uppercase tracking-[1px] ${ROLE_COLORS[s.role] ?? 'text-[#5A5048]'}`}>
                      {ROLE_LABELS[s.role] ?? s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[9px] text-[#4A4A4A]">
                    {s.last_login_at ? new Date(s.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[9px] ${s.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-3">
                    <button className="text-[9px] uppercase text-[#C9A84C] hover:text-[#E8D5A3] transition-colors">Edit</button>
                    {s.role !== 'founder' && (
                      <button className="text-[9px] uppercase text-red-400/60 hover:text-red-400 transition-colors">
                        {s.is_active ? 'Suspend' : 'Restore'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
