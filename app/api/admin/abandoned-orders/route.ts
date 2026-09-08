import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminApi } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data, error } = await getSupabaseAdmin().from('abandoned_orders').select('*').eq('status', 'abandoned').order('last_seen_at', { ascending: false })
  if (error) { console.error('abandoned order list failed'); return NextResponse.json({ error: 'request_failed' }, { status: 500 }) }
  return NextResponse.json({ abandonedOrders: data ?? [] })
}
