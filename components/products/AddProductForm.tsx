'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const FRAGRANCE_FAMILIES = ['floral','woody','oriental','fresh','fougere','chypre','gourmand','aquatic','spicy','earthy','citrus','arabic_oriental']
const CONCENTRATIONS = ['edc','edt','edp','parfum','oil','solid','mist']
const GENDERS = ['men','women','unisex']

export function AddProductForm({ brands, categories }: { brands: any[]; categories: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', name_ar: '', slug: '', tagline: '', description: '',
    brand_id: '', category_id: '', fragrance_family: '', concentration: '',
    gender_target: '', perfumer: '', release_year: '', country_of_origin: '',
    status: 'active', is_featured: false, is_new_arrival: false,
    is_bestseller: false, is_arabic_collection: false, is_exclusive: false,
    longevity_rating: '', sillage_rating: '', projection_rating: '', versatility_rating: '',
  })
  const [variants, setVariants] = useState([{ size_ml: '', price: '', compare_at_price: '', stock_quantity: '', sku: '' }])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const addVariant = () => setVariants(v => [...v, { size_ml: '', price: '', compare_at_price: '', stock_quantity: '', sku: '' }])
  const setVariant = (i: number, k: string, v: string) => setVariants(vs => vs.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  const removeVariant = (i: number) => setVariants(vs => vs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, variants }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Product created!')
      router.push('/products')
    } catch {
      toast.error('Failed to create product')
    } finally { setLoading(false) }
  }

  const inputCls = "w-full px-3 py-2.5 bg-white border border-[rgba(42,36,32,0.12)] text-[#2A2420] text-sm outline-none focus:border-[#C9A84C] transition-colors"
  const labelCls = "text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-1.5 font-semibold"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className={labelCls}>Product Name *</label>
            <input value={form.name} onChange={e => { set('name', e.target.value); set('slug', autoSlug(e.target.value)) }}
              className={inputCls} placeholder="e.g. Oud Wood" required />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className={labelCls}>Arabic Name</label>
            <input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} className={inputCls} placeholder="الاسم بالعربية" dir="rtl" />
          </div>
          <div>
            <label className={labelCls}>URL Slug *</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} className={inputCls} placeholder="oud-wood" required />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input value={form.tagline} onChange={e => set('tagline', e.target.value)} className={inputCls} placeholder="A smoky, sensual blend..." />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className={`${inputCls} min-h-[100px] resize-y`} placeholder="Detailed product description..." />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Brand</label>
            <select value={form.brand_id} onChange={e => set('brand_id', e.target.value)} className={inputCls}>
              <option value="">Select brand</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputCls}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fragrance Family</label>
            <select value={form.fragrance_family} onChange={e => set('fragrance_family', e.target.value)} className={inputCls}>
              <option value="">Select family</option>
              {FRAGRANCE_FAMILIES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Concentration</label>
            <select value={form.concentration} onChange={e => set('concentration', e.target.value)} className={inputCls}>
              <option value="">Select</option>
              {CONCENTRATIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Gender Target</label>
            <select value={form.gender_target} onChange={e => set('gender_target', e.target.value)} className={inputCls}>
              <option value="">Select</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Perfumer</label>
            <input value={form.perfumer} onChange={e => set('perfumer', e.target.value)} className={inputCls} placeholder="e.g. Alberto Morillas" />
          </div>
          <div>
            <label className={labelCls}>Release Year</label>
            <input value={form.release_year} onChange={e => set('release_year', e.target.value)} type="number" className={inputCls} placeholder="2024" />
          </div>
          <div>
            <label className={labelCls}>Country of Origin</label>
            <input value={form.country_of_origin} onChange={e => set('country_of_origin', e.target.value)} className={inputCls} placeholder="France" />
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-5">
          {[
            { key: 'is_featured', label: 'Featured' },
            { key: 'is_new_arrival', label: 'New Arrival' },
            { key: 'is_bestseller', label: 'Bestseller' },
            { key: 'is_arabic_collection', label: 'Arabic Collection' },
            { key: 'is_exclusive', label: 'Exclusive' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={(form as any)[key]} onChange={e => set(key, e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C] cursor-pointer" />
              <span className="text-[10px] text-[#6B5E4A] group-hover:text-[#2A2420] transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Performance Ratings */}
      <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Performance Ratings (1–5)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['longevity_rating','Longevity'],['sillage_rating','Sillage'],['projection_rating','Projection'],['versatility_rating','Versatility']].map(([k,l]) => (
            <div key={k}>
              <label className={labelCls}>{l}</label>
              <input type="number" min="1" max="5" step="0.1" value={(form as any)[k]} onChange={e => set(k, e.target.value)}
                className={inputCls} placeholder="e.g. 4.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-[#2A2420]">Size Variants & Pricing</h2>
          <button type="button" onClick={addVariant} className="btn-outline-gold text-[9px] px-4 py-2">+ Add Size</button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-4 bg-[#FAF8F5] border border-[rgba(42,36,32,0.08)]">
              <div>
                <label className={labelCls}>Size (ml)</label>
                <input type="number" value={v.size_ml} onChange={e => setVariant(i, 'size_ml', e.target.value)} className={inputCls} placeholder="50" />
              </div>
              <div>
                <label className={labelCls}>Price ($)</label>
                <input type="number" value={v.price} onChange={e => setVariant(i, 'price', e.target.value)} className={inputCls} placeholder="299" />
              </div>
              <div>
                <label className={labelCls}>Compare Price</label>
                <input type="number" value={v.compare_at_price} onChange={e => setVariant(i, 'compare_at_price', e.target.value)} className={inputCls} placeholder="399" />
              </div>
              <div>
                <label className={labelCls}>Stock Qty</label>
                <input type="number" value={v.stock_quantity} onChange={e => setVariant(i, 'stock_quantity', e.target.value)} className={inputCls} placeholder="100" />
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <div className="flex gap-2">
                  <input value={v.sku} onChange={e => setVariant(i, 'sku', e.target.value)} className={inputCls} placeholder="MN-001-50" />
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 transition-colors px-2 shrink-0">✕</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={loading} className="btn-gold px-8 py-3 disabled:opacity-50">
          {loading ? 'Creating…' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/products')} className="btn-outline-gold px-8 py-3">
          Cancel
        </button>
      </div>
    </form>
  )
}
