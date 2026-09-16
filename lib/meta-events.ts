import 'server-only'
import { createHash, randomUUID } from 'crypto'
import { getIntegrationSettings } from '@/lib/integration-settings'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export type PurchaseEvent = { eventName: 'Purchase'; eventTime: number; eventId: string; actionSource: 'website'; eventSourceUrl: string; value: number; currency: string; userData?: { ph?: string[]; fn?: string[] } }
export function buildPurchaseEvent(order: { order_number: string; total_amount: number; currency: string }, requestUrl: string, customer?: { phone?: string; fullName?: string }): PurchaseEvent {
  if (typeof order.total_amount !== 'number' || !Number.isFinite(order.total_amount) || order.total_amount <= 0 || order.currency !== 'DZD') throw new Error('invalid_purchase_value')
  const hash = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
  return { eventName: 'Purchase', eventTime: Math.floor(Date.now() / 1000), eventId: order.order_number, actionSource: 'website', eventSourceUrl: requestUrl, value: order.total_amount, currency: order.currency, userData: customer ? { ph: customer.phone ? [hash(customer.phone)] : undefined, fn: customer.fullName ? [hash(customer.fullName)] : undefined } : undefined }
}

export async function claimPurchaseSend(orderId: string) {
  const leaseId = randomUUID()
  const { data, error } = await getSupabaseAdmin().rpc('claim_meta_purchase', { p_order_id: orderId, p_lease_id: leaseId, p_lease_seconds: 300 })
  if (error) throw error
  return { claimed: Boolean(data), leaseId }
}

export async function completePurchaseSend(orderId: string, leaseId: string) {
  const { error } = await getSupabaseAdmin().rpc('complete_meta_purchase', { p_order_id: orderId, p_lease_id: leaseId })
  if (error) throw error
}

export async function failPurchaseSend(orderId: string, leaseId: string) {
  const { error } = await getSupabaseAdmin().rpc('fail_meta_purchase', { p_order_id: orderId, p_lease_id: leaseId })
  if (error) throw error
}

export async function sendPurchaseToConversionsApi(event: PurchaseEvent) {
  const settings = await getIntegrationSettings().catch(() => null)
  const pixelId = settings?.meta_pixel_id || process.env.META_PIXEL_ID
  const accessToken = settings?.meta_capi_access_token || process.env.META_ACCESS_TOKEN
  if (!pixelId || !accessToken) return { sent: false, configured: false }
  const version = process.env.META_GRAPH_API_VERSION || 'v20.0'
  const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: [{ event_name: event.eventName, event_time: event.eventTime, event_id: event.eventId, action_source: event.actionSource, event_source_url: event.eventSourceUrl, user_data: event.userData, custom_data: { value: event.value, currency: event.currency, content_type: 'product' } }] }), cache: 'no-store' })
  if (!response.ok) throw new Error('meta_capi_request_failed')
  return { sent: true, configured: true }
}
