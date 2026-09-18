import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { validateOrderInput } from '@/lib/order-validation'
import { buildPurchaseEvent, claimPurchaseSend, completePurchaseSend, failPurchaseSend, sendPurchaseToConversionsApi } from '@/lib/meta-events'

export async function POST(request: Request) {
  try {
    const input = validateOrderInput(await request.json())
    const a = input.attribution ?? {}
    const { data, error } = await getSupabaseAdmin().rpc('create_order', {
      p_submission_id: input.submissionId, p_product_slug: input.productSlug, p_full_name: input.fullName, p_phone: input.phone,
      p_wilaya: input.wilaya, p_commune: input.commune, p_address: input.address, p_quantity: input.quantity, p_notes: input.notes ?? null,
      p_color: input.color ?? null, p_size: input.size ?? null,
      p_utm_source: a.utm_source ?? null, p_utm_medium: a.utm_medium ?? null, p_utm_campaign: a.utm_campaign ?? null,
      p_utm_content: a.utm_content ?? null, p_utm_term: a.utm_term ?? null, p_fbclid: a.fbclid ?? null,
      p_fbp: a.fbp ?? null, p_fbc: a.fbc ?? null,
    })
    if (error) {
      if (error.message.includes('product_unavailable')) return NextResponse.json({ error: 'product_unavailable' }, { status: 400 })
      console.error('order creation failed', { operation: 'create_order', code: error.code, message: error.message, details: error.details, hint: error.hint, product_slug: input.productSlug, quantity: input.quantity, has_color: Boolean(input.color), has_size: Boolean(input.size) }); return NextResponse.json({ error: 'order_creation_failed' }, { status: 500 })
    }
    const order = Array.isArray(data) ? data[0] : data
    if (order?.id) await getSupabaseAdmin().from('abandoned_orders').update({ status: 'converted', converted_order_id: order.id, last_seen_at: new Date().toISOString() }).eq('session_id', input.submissionId)
    let eventSourceUrl = request.url
    try {
      const candidate = new URL(a.event_source_url || request.headers.get('referer') || request.url)
      if (candidate.origin === new URL(request.url).origin) eventSourceUrl = candidate.href
    } catch { /* fall back to the request URL */ }
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined
    const clientUserAgent = request.headers.get('user-agent') || undefined
    try {
      const event = buildPurchaseEvent(order, eventSourceUrl, { phone: input.phone, fullName: input.fullName }, a, { clientIp, clientUserAgent })
      const claim = await claimPurchaseSend(order.id)
      if (claim.claimed) {
        try {
          const result = await sendPurchaseToConversionsApi(event)
          if (!result.sent) throw new Error('meta_capi_not_configured')
          await completePurchaseSend(order.id, claim.leaseId)
        } catch (error) {
          await failPurchaseSend(order.id, claim.leaseId).catch(failure => console.error('meta conversion claim release failed', failure))
          throw error
        }
      }
    } catch { console.error('meta conversion event failed') }
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'unexpected_error'
    if (code === 'invalid_form_data' || code === 'invalid_order_details') return NextResponse.json({ error: code }, { status: 400 })
    console.error('order request failed', { operation: 'order_request', code }); return NextResponse.json({ error: 'unexpected_error' }, { status: 500 })
  }
}
