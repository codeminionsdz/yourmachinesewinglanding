import { NextResponse } from 'next/server'
import { verifyAdminApi } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getIntegrationSettings } from '@/lib/integration-settings'

type ZrTerritory = { id?: string; name?: string | null; level?: string | null; parentId?: string | null }

function zrApiUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/$/, '')
  const versionedBase = /\/api\/v[^/]+$/i.test(base) ? base : `${base}/api/v1.0`
  return `${versionedBase}${path}`
}

function normalizeTerritoryName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase()
}

async function resolveTerritories(baseUrl: string, tenantId: string, apiKey: string, wilaya: string, commune: string) {
  const response = await fetch(zrApiUrl(baseUrl, '/territories/search'), {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'X-Tenant': tenantId, 'X-Api-Key': apiKey },
    body: JSON.stringify({ pageNumber: 1, pageSize: 5000, orderBy: ['code asc'] }),
    cache: 'no-store',
  })
  const result = await response.json().catch(() => null) as { items?: ZrTerritory[] } | null
  if (!response.ok || !Array.isArray(result?.items)) throw new Error('zr_territories_unavailable')
  const city = result.items.find(item => item.level?.toLocaleLowerCase() === 'wilaya' && normalizeTerritoryName(item.name ?? '') === normalizeTerritoryName(wilaya))
  if (!city?.id) throw new Error('zr_wilaya_not_found')
  const district = result.items.find(item => item.level?.toLocaleLowerCase() === 'district' && item.parentId === city.id && normalizeTerritoryName(item.name ?? '') === normalizeTerritoryName(commune))
  if (!district?.id) throw new Error('zr_commune_not_found')
  return { cityTerritoryId: city.id, districtTerritoryId: district.id }
}

export async function POST(request: Request) {
  if (!await verifyAdminApi(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.orderId !== 'string') return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  const db = getSupabaseAdmin(); const { data: order, error } = await db.from('orders').select('*, customers(full_name,phone), products(name)').eq('id', body.orderId).maybeSingle()
  if (error || !order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 })
  if (order.tracking_reference) return NextResponse.json({ error: 'already_sent' }, { status: 409 })
  const settings = await getIntegrationSettings()
  if (!settings?.zr_base_url || !settings.zr_tenant_id || !settings.zr_api_key) return NextResponse.json({ error: 'zr_not_configured' }, { status: 400 })
  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers
  if (!customer?.full_name || !customer?.phone || !order.wilaya || !order.commune || !order.address) return NextResponse.json({ error: 'order_missing_delivery_data' }, { status: 400 })
  try {
    const product = Array.isArray(order.products) ? order.products[0] : order.products
    const territories = await resolveTerritories(settings.zr_base_url, settings.zr_tenant_id, settings.zr_api_key, order.wilaya, order.commune)
    const response = await fetch(zrApiUrl(settings.zr_base_url, '/parcels'), {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'X-Tenant': settings.zr_tenant_id, 'X-Api-Key': settings.zr_api_key },
      body: JSON.stringify({
        customer: { customerId: crypto.randomUUID(), name: customer.full_name, phone: { number1: customer.phone } },
        deliveryAddress: { ...territories, street: order.address },
        orderedProducts: [{ productName: product?.name, unitPrice: Number(order.unit_price), quantity: order.quantity, stockType: 'none' }],
        amount: Number(order.total_amount), description: product?.name, deliveryType: 'home', externalId: order.order_number,
      }),
      cache: 'no-store'
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) return NextResponse.json({ error: 'zr_request_failed', message: typeof result?.detail === 'string' ? result.detail : 'ZR Express rejected the parcel.' }, { status: 502 })
    const tracking = result?.id
    if (typeof tracking !== 'string' || !tracking) return NextResponse.json({ error: 'zr_missing_tracking_reference', message: 'ZR Express did not return a parcel id.' }, { status: 502 })
    const { data: saved, error: saveError } = await db.from('orders').update({ shipping_provider: 'ZR Express', tracking_reference: tracking, shipping_status: 'sent', shipped_at: new Date().toISOString(), status: order.status === 'new' ? 'processing' : order.status }).eq('id', order.id).is('tracking_reference', null).select('tracking_reference').single()
    if (saveError || !saved) return NextResponse.json({ error: 'shipment_save_failed' }, { status: 500 })
    return NextResponse.json({ trackingReference: tracking })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'zr_request_failed'
    const messages: Record<string, string> = { zr_territories_unavailable: 'ZR Express territory data is unavailable. Please retry.', zr_wilaya_not_found: 'The order wilaya was not found in ZR Express territories.', zr_commune_not_found: 'The order commune was not found for that wilaya in ZR Express territories.' }
    return NextResponse.json({ error: code, message: messages[code] ?? 'Unable to create the ZR Express parcel. Please retry.' }, { status: 502 })
  }
}
