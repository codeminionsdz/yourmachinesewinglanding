import 'server-only'
import { createHash } from 'crypto'

export type PurchaseEvent = { eventName: 'Purchase'; eventTime: number; eventId: string; actionSource: 'website'; eventSourceUrl: string; value: number; currency: string; userData?: { ph?: string[]; fn?: string[] } }
export function buildPurchaseEvent(order: { order_number: string; total_amount: number; currency: string }, requestUrl: string, customer?: { phone?: string; fullName?: string }): PurchaseEvent {
  const hash = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
  return { eventName: 'Purchase', eventTime: Math.floor(Date.now() / 1000), eventId: order.order_number, actionSource: 'website', eventSourceUrl: requestUrl, value: order.total_amount, currency: order.currency, userData: customer ? { ph: customer.phone ? [hash(customer.phone)] : undefined, fn: customer.fullName ? [hash(customer.fullName)] : undefined } : undefined }
}

export async function sendPurchaseToConversionsApi(event: PurchaseEvent) {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_ACCESS_TOKEN
  if (!pixelId || !accessToken) return { sent: false, configured: false }
  const version = process.env.META_GRAPH_API_VERSION || 'v20.0'
  const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: [{ event_name: event.eventName, event_time: event.eventTime, event_id: event.eventId, action_source: event.actionSource, event_source_url: event.eventSourceUrl, user_data: event.userData, custom_data: { value: event.value, currency: event.currency, content_name: 'ACME model 320', content_type: 'product' } }] }), cache: 'no-store' })
  if (!response.ok) throw new Error('meta_capi_request_failed')
  return { sent: true, configured: true }
}
