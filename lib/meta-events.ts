import 'server-only'
import { createHash } from 'crypto'
import { getIntegrationSettings } from '@/lib/integration-settings'

export type PurchaseEvent = { eventName: 'Purchase'; eventTime: number; eventId: string; actionSource: 'website'; eventSourceUrl: string; value: number; currency: string; fbclid?: string; userData?: { ph?: string[]; fn?: string[]; fbp?: string; fbc?: string; client_ip_address?: string; client_user_agent?: string } }
function normalizePurchaseValue(value: unknown) {
  const amount = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('invalid_purchase_value')
  return amount
}
export function buildPurchaseEvent(order: { order_number: string; total_amount: unknown; currency: string }, requestUrl: string, customer?: { phone?: string; fullName?: string }, attribution: Record<string, string | undefined> = {}, client?: { clientIp?: string; clientUserAgent?: string }): PurchaseEvent {
  const hash = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.startsWith('0') ? `213${digits.slice(1)}` : digits
  }
  return {
    eventName: 'Purchase', eventTime: Math.floor(Date.now() / 1000), eventId: order.order_number,
    actionSource: 'website', eventSourceUrl: requestUrl, value: normalizePurchaseValue(order.total_amount), currency: order.currency, fbclid: attribution.fbclid,
    userData: {
      ph: customer?.phone ? [hash(normalizePhone(customer.phone))] : undefined,
      fn: customer?.fullName ? [hash(customer.fullName.replace(/\s+/g, ' '))] : undefined,
      fbp: attribution.fbp, fbc: attribution.fbc,
      client_ip_address: client?.clientIp, client_user_agent: client?.clientUserAgent,
    },
  }
}

export async function sendPurchaseToConversionsApi(event: PurchaseEvent) {
  const settings = await getIntegrationSettings().catch(() => null)
  const pixelId = settings?.meta_pixel_id || process.env.META_PIXEL_ID
  const accessToken = settings?.meta_capi_access_token || process.env.META_ACCESS_TOKEN
  if (!pixelId || !accessToken) return { sent: false, configured: false }
  if (process.env.META_ATTRIBUTION_DEBUG === 'true') {
    let diagnosticUrl = 'invalid'
    try {
      const url = new URL(event.eventSourceUrl)
      diagnosticUrl = `${url.origin}${url.pathname}`
    } catch { /* keep the safe placeholder */ }
    console.info('meta attribution diagnostics', {
      fbclid: Boolean(event.fbclid),
      capi_fbp: Boolean(event.userData?.fbp),
      capi_fbc: Boolean(event.userData?.fbc),
      phone_matching: Boolean(event.userData?.ph?.length),
      event_id: event.eventId,
      event_source_url: diagnosticUrl,
    })
  }
  if (!Number.isFinite(event.value) || event.value <= 0) throw new Error('invalid_purchase_value')
  const version = process.env.META_GRAPH_API_VERSION || 'v20.0'
  const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: [{ event_name: event.eventName, event_time: event.eventTime, event_id: event.eventId, action_source: event.actionSource, event_source_url: event.eventSourceUrl, user_data: event.userData, custom_data: { value: event.value, currency: event.currency, content_name: 'ACME model 320', content_type: 'product' } }] }), cache: 'no-store' })
  if (!response.ok) {
    console.error('meta_capi_request_failed', { status: response.status, event_id: event.eventId })
    throw new Error('meta_capi_request_failed')
  }
  return { sent: true, configured: true }
}
