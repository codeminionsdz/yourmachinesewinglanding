'use client'

import territories from '@/data/algeria-wilayas-communes.json'
import { FormEvent, useEffect, useState } from 'react'
import { trackMetaPurchase } from './meta-pixel'

type Props = { productSlug: string; productName: string; price: number | null; currency: string; color?: string; size?: string }
type ConfirmedPurchase = { eventId: string; value: number; currency: string }
type OrderResponse = { order?: { order_number?: string; total_amount?: number; currency?: string }; error?: string }

export function OrderForm({ productSlug, productName, price, currency, color = 'Black', size = 'M' }: Props) {
  const [values, setValues] = useState({ fullName: '', phone: '', wilaya: '', commune: '', address: '', notes: '' })
  const [submissionId, setSubmissionId] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [confirmedPurchase, setConfirmedPurchase] = useState<ConfirmedPurchase | null>(null)
  const selectedWilaya = territories.find(item => String(item.code) === values.wilaya)
  const variantNote = `${productName} / اللون: ${color} / المقاس: ${size}${values.notes ? ` / ${values.notes}` : ''}`

  useEffect(() => {
    if (!Object.values(values).some(value => value.trim()) || !submissionId) return
    const timer = window.setTimeout(() => {
      const selectedCommune = selectedWilaya?.communes.find(item => item.ascii === values.commune)
      void fetch('/api/abandoned-orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: submissionId, fullName: values.fullName, phone: values.phone, wilaya: selectedWilaya?.ascii ?? values.wilaya, commune: selectedCommune?.ascii ?? values.commune, address: values.address, notes: variantNote }) })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [values, submissionId, selectedWilaya, variantNote])
  useEffect(() => { if (state === 'success' && confirmedPurchase) trackMetaPurchase(confirmedPurchase.value, confirmedPurchase.currency, confirmedPurchase.eventId) }, [state, confirmedPurchase])
  function update(key: keyof typeof values, value: string) { if (!submissionId) setSubmissionId(crypto.randomUUID()); setValues(current => ({ ...current, [key]: value })); if (state === 'error') { setState('idle'); setMessage('') } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (state === 'submitting') return
    const required: [keyof typeof values, string][] = [['fullName', 'الاسم الكامل'], ['phone', 'رقم الهاتف'], ['wilaya', 'الولاية'], ['commune', 'البلدية'], ['address', 'العنوان']]
    const missing = required.find(([key]) => !values[key].trim())
    if (missing) { setState('error'); setMessage(`يرجى إدخال ${missing[1]}.`); return }
    const normalizedPhone = values.phone.replace(/\s+/g, '')
    if (!/^(?:0[567]\d{8}|\+213[567]\d{8})$/.test(normalizedPhone)) { setState('error'); setMessage('يرجى إدخال رقم هاتف جزائري صحيح.'); return }
    const id = submissionId || crypto.randomUUID(); setSubmissionId(id); setState('submitting'); setMessage('')
    try {
      const params = new URLSearchParams(window.location.search)
      const attribution = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].map(key => [key, params.get(key) || undefined]))
      const selectedCommune = selectedWilaya?.communes.find(item => item.ascii === values.commune)
      if (!selectedWilaya || !selectedCommune) throw new Error('invalid_delivery_area')
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productSlug, quantity: 1, submissionId: id, fullName: values.fullName, phone: values.phone, wilaya: selectedWilaya.ascii, commune: selectedCommune.ascii, address: values.address, notes: variantNote, attribution }) })
      const result = await response.json() as OrderResponse
      if (!response.ok) throw new Error(result.error || 'order_failed')
      const eventId = result.order?.order_number
      const value = Number(result.order?.total_amount)
      const currency = result.order?.currency || 'DZD'
      if (!eventId || !Number.isFinite(value) || currency !== 'DZD') throw new Error('invalid_confirmed_order')
      setOrderNumber(eventId); setConfirmedPurchase({ eventId, value, currency }); setState('success')
    } catch { setState('error'); setMessage('تعذّر تسجيل طلبك. يرجى المحاولة مرة أخرى.') }
  }
  if (state === 'success') return <section id="order-form" className="order-section" dir="rtl"><div className="order-success" role="status"><p className="gurm-kicker">تم استلام الطلب</p><h2>تم تسجيل طلبك بنجاح.</h2><p>سنتواصل معك لتأكيد طلب Dani Wear.</p>{orderNumber && <p className="order-reference">رقم الطلب: <strong>{orderNumber}</strong></p>}<p>الدفع عند الاستلام.</p></div></section>
  return <section id="order-form" className="order-section" dir="rtl"><div className="order-intro"><p className="gurm-kicker">اطلب Dani Wear الآن</p><h2>سروالك جاهز<br />للخطوة التالية.</h2><p>اختر اللون والمقاس، ثم اترك معلوماتك. سنتواصل معك لتأكيد الطلب.</p></div><form className="order-form" onSubmit={submit} noValidate><div className="order-summary"><div><span>المنتج</span><strong>سروال Dani Wear القابل للتحويل</strong></div><div><span>الاختيار</span><strong>{color === 'Black' ? 'أسود' : color === 'Grey' ? 'رمادي' : 'زيتي'} / {size}</strong></div><div><span>طريقة الدفع</span><strong>الدفع عند الاستلام</strong></div></div><label>الاسم الكامل<input required value={values.fullName} onChange={event => update('fullName', event.target.value)} autoComplete="name" /></label><label>رقم الهاتف<input required type="tel" inputMode="tel" placeholder="05 / 06 / 07 xx xx xx xx" value={values.phone} onChange={event => update('phone', event.target.value)} autoComplete="tel" /></label><div className="order-fields"><label>الولاية<select required value={values.wilaya} onChange={event => setValues(current => ({ ...current, wilaya: event.target.value, commune: '' }))}><option value="">اختر الولاية</option>{territories.map(item => <option key={item.code} value={item.code}>{item.arabic}</option>)}</select></label><label>البلدية<select required value={values.commune} disabled={!selectedWilaya} onChange={event => update('commune', event.target.value)}><option value="">{selectedWilaya ? 'اختر البلدية' : 'اختر الولاية أولاً'}</option>{selectedWilaya?.communes.map(item => <option key={item.ascii} value={item.ascii}>{item.arabic}</option>)}</select></label></div><label>العنوان<input required value={values.address} onChange={event => update('address', event.target.value)} autoComplete="street-address" /></label><label>ملاحظة <span className="optional-label">(اختياري)</span><textarea maxLength={1000} value={values.notes} onChange={event => update('notes', event.target.value)} placeholder="أي معلومة تساعد في التوصيل" /></label>{state === 'error' && <p className="order-error" role="alert">{message}</p>}<button className="gurm-button order-submit" type="submit" disabled={state === 'submitting'}>{state === 'submitting' ? 'جارٍ تسجيل الطلب…' : 'تأكيد الطلب'}</button></form></section>
}
