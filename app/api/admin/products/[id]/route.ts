import { NextResponse } from 'next/server'
import { verifyAdminApi } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params; const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_product' }, { status: 400 })
  const input = body as Record<string, unknown>; const price = input.price === null || input.price === '' ? null : Number(input.price)
  const colors = Array.isArray(input.colors) ? input.colors.filter(item => ['Black', 'Grey', 'Olive'].includes(String(item))) : []
  const sizes = Array.isArray(input.sizes) ? input.sizes.filter(item => ['S', 'M', 'L', 'XL', 'XXL'].includes(String(item))) : []
  const update = { name: String(input.name || '').trim(), slug: String(input.slug || '').trim().toLowerCase(), brand: String(input.brand || '').trim(), manufacturer: String(input.manufacturer || input.brand || '').trim(), model: String(input.model || input.name || '').trim(), description: String(input.description || '').trim() || null, price, active: input.active === true, colors, sizes, media: input.media && typeof input.media === 'object' && !Array.isArray(input.media) ? input.media : {} }
  if (!update.name || !update.slug || !update.brand || (price !== null && (!Number.isInteger(price) || price < 0)) || !colors.length || !sizes.length || (update.active && price === null)) return NextResponse.json({ error: 'invalid_product' }, { status: 400 })
  const { data, error } = await getSupabaseAdmin().from('products').update(update).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'slug_taken' : 'request_failed' }, { status: error.code === '23505' ? 409 : 500 })
  return NextResponse.json({ product: data })
}