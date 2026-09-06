import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminApi } from '@/lib/admin-auth'
export async function GET(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim()
  const status = (url.searchParams.get('status') || '').trim()
  const sort = url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc'
  const page = Number(url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || '20')
  const allowed = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100 || (status && !allowed.includes(status)) || q.length > 120) return NextResponse.json({ error: 'invalid_query' }, { status: 400 })
  const { data, error } = await getSupabaseAdmin().from('orders').select('*, customers(full_name, phone), products(name)').order('created_at', { ascending: sort === 'asc' })
  if (error) { console.error('admin order list failed', error); return NextResponse.json({ error: 'request_failed' }, { status: 500 }) }
  const filtered = (data ?? []).filter(order => { const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers; return (!status || order.status === status) && (!q || order.order_number.toLowerCase().includes(q.toLowerCase()) || String(customer?.full_name || '').toLowerCase().includes(q.toLowerCase()) || String(customer?.phone || '').includes(q)) })
  const from = (page - 1) * pageSize
  return NextResponse.json({ orders: filtered.slice(from, from + pageSize), pagination: { page, pageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) } })
}
export async function PATCH(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const allowed = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
  if (!body || typeof body.orderId !== 'string' || typeof body.status !== 'string') return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  if (!allowed.includes(body.status)) return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  const { data, error } = await getSupabaseAdmin().from('orders').update({ status: body.status }).eq('id', body.orderId).select('id, order_number, status').single()
  if (error) { console.error('admin order update failed', error); return NextResponse.json({ error: 'request_failed' }, { status: 500 }) }
  return NextResponse.json({ order: data })
}
