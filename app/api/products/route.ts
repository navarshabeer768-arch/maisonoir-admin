import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Use service role to bypass RLS
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

    // Verify user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized - not logged in' }, { status: 401 })

    const body = await req.json()
    const { variants, ...productData } = body

    // Build clean product object - remove empty strings
    const product: Record<string, any> = {}
    for (const [k, v] of Object.entries(productData)) {
      if (v !== '' && v !== null && v !== undefined && v !== false || typeof v === 'boolean') {
        product[k] = v
      }
    }

    // Ensure required fields
    if (!product.name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    if (!product.slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })

    // Convert numeric strings
    const numericFields = ['release_year', 'longevity_rating', 'sillage_rating', 'projection_rating', 'versatility_rating']
    numericFields.forEach(f => { if (product[f]) product[f] = parseFloat(product[f]) })

    // Remove empty string IDs
    if (!product.brand_id) delete product.brand_id
    if (!product.category_id) delete product.category_id
    if (!product.fragrance_family) delete product.fragrance_family
    if (!product.concentration) delete product.concentration
    if (!product.gender_target) delete product.gender_target

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (productError) {
      console.error('Product insert error:', productError)
      return NextResponse.json({ error: productError.message, details: productError }, { status: 400 })
    }

    // Insert variants
    if (variants?.length) {
      const cleanVariants = variants
        .filter((v: any) => v.size_ml && v.price)
        .map((v: any) => ({
          product_id: newProduct.id,
          size_ml: parseInt(v.size_ml),
          price: parseFloat(v.price),
          compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
          stock_quantity: v.stock_quantity ? parseInt(v.stock_quantity) : 0,
          sku: v.sku || `MN-${Date.now()}-${v.size_ml}`,
          is_active: true,
        }))

      if (cleanVariants.length) {
        const { error: variantError } = await supabase.from('product_variants').insert(cleanVariants)
        if (variantError) console.error('Variant insert error:', variantError)
      }
    }

    return NextResponse.json({ product: newProduct, message: 'Product created successfully' }, { status: 201 })
  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
