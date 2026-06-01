import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c: { name: string; value: string; options: CookieOptions }[]) {
            try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    const body = await req.json()
    const { variants, images, ...productData } = body

    // Clean product data
    const product: Record<string, any> = {}
    for (const [k, v] of Object.entries(productData)) {
      if (v === '' || v === null || v === undefined) continue
      product[k] = v
    }

    if (!product.name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    if (!product.slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })

    // Convert numbers
    ;['release_year','longevity_rating','sillage_rating','projection_rating','versatility_rating'].forEach(f => {
      if (product[f]) product[f] = parseFloat(product[f])
    })
    ;['brand_id','category_id','fragrance_family','concentration','gender_target'].forEach(f => {
      if (!product[f]) delete product[f]
    })

    // Insert product
    const { data: newProduct, error: productError } = await supabase
      .from('products').insert(product).select().single()
    if (productError) return NextResponse.json({ error: productError.message }, { status: 400 })

    // Insert variants
    if (variants?.length) {
      const cleanVariants = variants.filter((v: any) => v.size_ml && v.price).map((v: any) => ({
        product_id: newProduct.id,
        size_ml: parseInt(v.size_ml),
        price: parseFloat(v.price),
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        stock_quantity: v.stock_quantity ? parseInt(v.stock_quantity) : 0,
        sku: v.sku || `MN-${Date.now()}-${v.size_ml}`,
        is_active: true,
      }))
      if (cleanVariants.length) await supabase.from('product_variants').insert(cleanVariants)
    }

    // Insert images
    if (images?.length) {
      const cleanImages = images.map((img: any, i: number) => ({
        product_id: newProduct.id,
        url: img.url,
        alt_text: img.alt_text || newProduct.name,
        is_primary: img.is_primary || i === 0,
        display_order: i,
      }))
      await supabase.from('product_images').insert(cleanImages)
    }

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
