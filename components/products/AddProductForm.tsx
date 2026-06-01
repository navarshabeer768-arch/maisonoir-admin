'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { ImageUpload } from './ImageUpload'

const FRAGRANCE_FAMILIES = ['floral','woody','oriental','fresh','fougere','chypre','gourmand','aquatic','spicy','earthy','citrus','arabic_oriental']
const CONCENTRATIONS = ['edc','edt','edp','parfum','oil','solid','mist']
const GENDERS = ['men','women','unisex']
const inputCls = "w-full px-3 py-2.5 bg-white border border-[rgba(42,36,32,0.12)] text-[#2A2420] text-sm outline-none focus:border-[#C9A84C] transition-colors"
const labelCls = "text-[9px] tracking-[2px] uppercase text-[#6B5E4A] block mb-1.5 font-semibold"
const cardCls = "bg-white border border-[rgba(42,36,32,0.07)] p-6 shadow-sm"

interface UploadedImage { url: string; alt_text: string; is_primary: boolean; file?: File; uploading?: boolean }

export function AddProductForm({ brands, categories }: { brands: any[]; categories: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [form, setForm] = useState({
    name: '', name_ar: '', slug: '', tagline: '', description: '',
    brand_id: '', category_id: '', fragrance_family: '', concentration: '',
    gender_target: 'unisex', perfumer: '', release_year: '', country_of_origin: '',
    status: 'active',
    is_featured: false, is_new_arrival: false, is_bestseller: false,
    is_arabic_collection: false, is_exclusive: false,
    longevity_rating: '', sillage_rating: '', projection_rating: '', versatility_rating: '',
  })
  const [variants, setVariants] = useState([{ size_ml: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '' }])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const addVariant = () => setVariants(v => [...v, { size_ml: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '' }])
  const setVariant = (i: number, k: string, v: string) => setVariants(vs => vs.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  const removeVariant = (i: number) => setVariants(vs => vs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.slug.trim()) { toast.error('Slug is required'); return }
    if (images.some(img => img.uploading)) { toast.error('Please wait for images to finish uploading'); return }

    setError(''); setLoading(true)
    try {
      // Prepare images for API
      const productImages = images.map((img, i) => ({
        url: img.url, alt_text: img.alt_text || form.name,
        is_primary: img.is_primary, display_order: i,
      }))

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, variants, images: productImages }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); toast.error(data.error || 'Failed to create product'); return }
      toast.success('Product created successfully! ✦')
      router.push('/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message); toast.error('Network error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-4"><strong>Error:</strong> {error}</div>}

      {/* Images — FIRST & PROMINENT */}
      <div className={cardCls}>
        <h2 className="font-display text-xl text-[#2A2420] mb-2">Product Images</h2>
        <p className="text-[10px] text-[#9A8A7A] mb-5">Upload high-quality images. First image will be the primary display image.</p>
        <ImageUpload images={images} onChange={setImages} />
      </div>

      {/* Basic Info */}
      <div className={cardCls}>
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Product Name *</label>
            <input value={form.name} onChange={e => { set('name', e.target.value); if (!form.slug || form.slug === autoSlug(form.name)) set('slug', autoSlug(e.target.value)) }}
              className={inputCls} placeholder="e.g. Oud Wood" required />
          </div>
          <div>
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
              className={`${inputCls} min-h-[90px] resize-y`} placeholder="Full product description..." />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className={cardCls}>
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['brand_id','Brand', brands, 'Select brand'],
            ['category_id','Category', categories, 'Select category'],
          ].map(([k, l, opts, ph]: any) => (
            <div key={k}>
              <label className={labelCls}>{l}</label>
              <select value={(form as any)[k]} onChange={e => set(k, e.target.value)} className={inputCls}>
                <option value="">— {ph} —</option>
                {opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className={labelCls}>Fragrance Family</label>
            <select value={form.fragrance_family} onChange={e => set('fragrance_family', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {FRAGRANCE_FAMILIES.map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Concentration</label>
            <select value={form.concentration} onChange={e => set('concentration', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {CONCENTRATIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Gender Target</label>
            <select value={form.gender_target} onChange={e => set('gender_target', e.target.value)} className={inputCls}>
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
        <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-[rgba(42,36,32,0.06)]">
          {[['is_featured','Featured'],['is_new_arrival','New Arrival'],['is_bestseller','Bestseller'],['is_arabic_collection','Arabic Collection'],['is_exclusive','Exclusive']].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-[11px] text-[#6B5E4A]">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings */}
      <div className={cardCls}>
        <h2 className="font-display text-xl text-[#2A2420] mb-5">Performance Ratings <span className="text-sm text-[#9A8A7A] font-sans font-normal">(1–5, optional)</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['longevity_rating','Longevity'],['sillage_rating','Sillage'],['projection_rating','Strength'],['versatility_rating','Versatility']].map(([k,l]) => (
            <div key={k}>
              <label className={labelCls}>{l}</label>
              <input type="number" min="1" max="5" step="0.1" value={(form as any)[k]} onChange={e => set(k, e.target.value)} className={inputCls} placeholder="4.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-[#2A2420]">Size Variants & Pricing</h2>
          <button type="button" onClick={addVariant} className="btn-outline-gold text-[9px] px-4 py-2">+ Add Size</button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-4 bg-[#FAF8F5] border border-[rgba(42,36,32,0.07)]">
              <div><label className={labelCls}>Size (ml) *</label><input type="number" value={v.size_ml} onChange={e => setVariant(i,'size_ml',e.target.value)} className={inputCls} placeholder="50" /></div>
              <div><label className={labelCls}>Price ($) *</label><input type="number" step="0.01" value={v.price} onChange={e => setVariant(i,'price',e.target.value)} className={inputCls} placeholder="299" /></div>
              <div><label className={labelCls}>Was Price ($)</label><input type="number" step="0.01" value={v.compare_at_price} onChange={e => setVariant(i,'compare_at_price',e.target.value)} className={inputCls} placeholder="399" /></div>
              <div><label className={labelCls}>Stock Qty</label><input type="number" value={v.stock_quantity} onChange={e => setVariant(i,'stock_quantity',e.target.value)} className={inputCls} placeholder="100" /></div>
              <div><label className={labelCls}>SKU</label>
                <div className="flex gap-2">
                  <input value={v.sku} onChange={e => setVariant(i,'sku',e.target.value)} className={inputCls} placeholder="MN-001-50ml" />
                  {variants.length > 1 && <button type="button" onClick={() => removeVariant(i)} className="text-[#9A8A7A] hover:text-red-500 px-1.5 text-xl shrink-0">×</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-gold px-8 py-3 disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Creating…' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/products')} className="btn-outline-gold px-8 py-3">Cancel</button>
      </div>
    </form>
  )
}
