import { NextResponse } from 'next/server'
import { verifyAdminApi } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const allowedColors = new Set(['Black', 'Grey', 'Olive'])
const allowedSizes = new Set(['S', 'M', 'L', 'XL', 'XXL'])
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

function validate(body: Record<string, unknown>) {
  const name = text(body.name, 160); const slug = text(body.slug, 160).toLowerCase(); const brand = text(body.brand, 80)
  const description = text(body.description, 2000); const manufacturer = text(body.manufacturer, 80) || brand; const model = text(body.model, 120) || name
  const price = body.price === null || body.price === '' ? null : Number(body.price)
  const colors = Array.isArray(body.colors) ? body.colors.filter(item => allowedColors.has(String(item))) : []
  const sizes = Array.isArray(body.sizes) ? body.sizes.filter(item => allowedSizes.has(String(item))) : []
  const media = body.media && typeof body.media === 'object' && !Array.isArray(body.media) ? Object.fromEntries(Object.entries(body.media).filter(([, value]) => typeof value === 'string' && value.trim()).map(([key, value]) => [key, String(value).trim().slice(0, 500)])) : {}
  if (!name || !slug || !brand || (price !== null && (!Number.isInteger(price) || price < 0)) || !colors.length || !sizes.length || (body.active === true && price === null)) return null
  return { name, slug, brand, manufacturer, model, description: description || null, price, currency: 'DZD', active: body.active === true, colors, sizes, media }
}

export async function GET(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data, error } = await getSupabaseAdmin().from('products').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'request_failed' }, { status: 500 })
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null); const product = body && typeof body === 'object' ? validate(body as Record<string, unknown>) : null
  if (!product) return NextResponse.json({ error: 'invalid_product' }, { status: 400 })
  const { data, error } = await getSupabaseAdmin().from('products').insert(product).select('*').single()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'slug_taken' : 'request_failed' }, { status: error.code === '23505' ? 409 : 500 })
  return NextResponse.json({ product }, { status: 201 })
}