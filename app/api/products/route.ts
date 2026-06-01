import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { variants, ...productData } = body

    // Clean up empty fields
    const cleanProduct: any = {}
    Object.entries(productData).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) cleanProduct[k] = v
    })

    // Convert numbers
    if (cleanProduct.release_year) cleanProduct.release_year = parseInt(cleanProduct.release_year)
    if (cleanProduct.longevity_rating) cleanProduct.longevity_rating = parseFloat(cleanProduct.longevity_rating)
    if (cleanProduct.sillage_rating) cleanProduct.sillage_rating = parseFloat(cleanProduct.sillage_rating)
    if (cleanProduct.projection_rating) cleanProduct.projection_rating = parseFloat(cleanProduct.projection_rating)
    if (cleanProduct.versatility_rating) cleanProduct.versatility_rating = parseFloat(cleanProduct.versatility_rating)

    const { data: product, error: productError } = await supabase
      .from('products').insert(cleanProduct).select().single()

    if (productError) return NextResponse.json({ error: productError.message }, { status: 400 })

    // Insert variants
    if (variants?.length) {
      const cleanVariants = variants
        .filter((v: any) => v.size_ml && v.price)
        .map((v: any) => ({
          product_id: product.id,
          size_ml: parseInt(v.size_ml),
          price: parseFloat(v.price),
          compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
          stock_quantity: v.stock_quantity ? parseInt(v.stock_quantity) : 0,
          sku: v.sku || `MN-${product.id.slice(0,6)}-${v.size_ml}`,
        }))

      if (cleanVariants.length) {
        await supabase.from('product_variants').insert(cleanVariants)
      }
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
