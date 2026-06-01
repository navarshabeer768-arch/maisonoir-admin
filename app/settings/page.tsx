export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*')
  const map = Object.fromEntries(settings?.map(s => [s.key, s.value]) ?? [])

  return (
    <AdminLayout currentPage="settings">
      <div className="p-8 max-w-3xl">
        <h1 className="font-display text-3xl font-light mb-8">Site Settings</h1>

        <div className="space-y-8">
          {/* Store */}
          <section className="card-admin p-6">
            <h2 className="font-display text-xl mb-5">Store Configuration</h2>
            <div className="space-y-4">
              {[
                { key: 'store_name', label: 'Store Name', type: 'text' },
                { key: 'store_currency', label: 'Default Currency', type: 'text' },
                { key: 'free_shipping_threshold', label: 'Free Shipping Threshold ($)', type: 'number' },
                { key: 'tax_rate', label: 'Tax Rate (0.05 = 5%)', type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-[9px] tracking-[2px] uppercase text-[#5A5048] block mb-2">{label}</label>
                  <input
                    type={type}
                    defaultValue={typeof map[key] === 'string' ? map[key].replace(/"/g, '') : map[key] ?? ''}
                    className="input-admin"
                    name={key}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Loyalty */}
          <section className="card-admin p-6">
            <h2 className="font-display text-xl mb-5">Loyalty Program</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'loyalty_points_per_dollar', label: 'Points per $1 Spent' },
                { key: 'loyalty_points_value', label: 'Point Value ($0.01 = 100pts = $1)' },
                { key: 'referral_reward', label: 'Referral Reward ($)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[9px] tracking-[2px] uppercase text-[#5A5048] block mb-2">{label}</label>
                  <input type="number" defaultValue={map[key] ?? ''} className="input-admin" />
                </div>
              ))}
            </div>
          </section>

          {/* Tier thresholds */}
          <section className="card-admin p-6">
            <h2 className="font-display text-xl mb-5">Loyalty Tier Thresholds (Points)</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { tier: 'silver', label: 'Silver Tier' },
                { tier: 'gold', label: 'Gold Tier' },
                { tier: 'platinum', label: 'Platinum Tier' },
                { tier: 'vip_royal', label: 'VIP Royal Tier' },
              ].map(({ tier, label }) => {
                const thresholds = map['loyalty_tier_thresholds'] as Record<string, number> | undefined
                return (
                  <div key={tier}>
                    <label className="text-[9px] tracking-[2px] uppercase text-[#5A5048] block mb-2">{label}</label>
                    <input type="number" defaultValue={thresholds?.[tier] ?? ''} className="input-admin" placeholder="e.g. 1000" />
                  </div>
                )
              })}
            </div>
          </section>

          <button className="btn-gold px-8 py-3">Save All Settings</button>
        </div>
      </div>
    </AdminLayout>
  )
}
