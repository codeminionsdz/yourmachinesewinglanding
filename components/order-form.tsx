'use client'

import { FormEvent, useState } from 'react'
import { trackMetaEvent } from './meta-pixel'

type OrderResponse = { order?: { order_number?: string; total_amount?: number; currency?: string }; error?: string }

export function OrderForm() {
  const [values, setValues] = useState({ fullName: '', phone: '', wilaya: '', commune: '', address: '' })
  const [submissionId, setSubmissionId] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  function update(key: keyof typeof values, value: string) { setValues(current => ({ ...current, [key]: value })); if (state === 'error') { setState('idle'); setMessage('') } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (state === 'submitting') return
    const requiredFields: [keyof typeof values, string][] = [['fullName', 'الاسم الكامل'], ['phone', 'رقم الهاتف'], ['wilaya', 'الولاية'], ['commune', 'البلدية'], ['address', 'العنوان']]
    const missing = requiredFields.find(([key]) => !values[key].trim())
    if (missing) { setState('error'); setMessage(`الرجاء إدخال ${missing[1]}.`); return }
    const normalizedPhone = values.phone.replace(/\s+/g, '')
    if (!/^(?:0[567]\d{8}|\+213[567]\d{8})$/.test(normalizedPhone)) { setState('error'); setMessage('رقم الهاتف غير صحيح. أدخل رقمًا جزائريًا صالحًا.'); return }
    const id = submissionId || crypto.randomUUID(); setSubmissionId(id); setState('submitting'); setMessage('')
    try {
      const params = new URLSearchParams(window.location.search)
      const attribution = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].map(key => [key, params.get(key) || undefined]))
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productSlug: 'acme-model-320', quantity: 1, submissionId: id, ...values, attribution }) })
      const result = await response.json() as OrderResponse
      if (!response.ok) throw new Error(result.error || 'order_failed')
      setOrderNumber(result.order?.order_number || ''); setState('success')
      if (result.order?.order_number) trackMetaEvent('Purchase', { value: result.order.total_amount, currency: result.order.currency || 'DZD', content_name: 'ACME model 320', content_type: 'product' }, result.order.order_number)
    } catch { setState('error'); setMessage('تعذّر تسجيل طلبك. حاول مرة أخرى.') }
  }
  if (state === 'success') return <section id="order-form" className="order-section"><div className="order-success" role="status"><p className="eyebrow">تم استلام طلبك</p><h2>تم تسجيل طلبك بنجاح</h2><p>سنتواصل معك لتأكيد الطلب.</p>{orderNumber && <p className="order-reference">رقم الطلب: <strong>{orderNumber}</strong></p>}<p>الدفع عند الاستلام</p></div></section>
  return <section id="order-form" className="order-section" dir="rtl"><div className="order-intro"><p className="eyebrow">اطلب الآن</p><h2>خلي طلبك يوصل لباب دارك.</h2><p>عمر المعلومات التالية، ونتواصلو معاك باش نأكدو الطلب.</p></div><form className="order-form" onSubmit={submit} noValidate><div className="order-summary"><div><span>المنتج</span><strong>ACME Model 320</strong></div><div><span>السعر</span><strong>44,000 دج</strong></div><div><span>طريقة الدفع</span><strong>الدفع عند الاستلام</strong></div></div><label>الاسم الكامل<input required value={values.fullName} onChange={event => update('fullName', event.target.value)} autoComplete="name" /></label><label>رقم الهاتف<input required type="tel" inputMode="tel" placeholder="05 / 06 / 07 xx xx xx xx" value={values.phone} onChange={event => update('phone', event.target.value)} autoComplete="tel" /></label><div className="order-fields"><label>الولاية<input required value={values.wilaya} onChange={event => update('wilaya', event.target.value)} placeholder="مثال: الجزائر" /></label><label>البلدية<input required value={values.commune} onChange={event => update('commune', event.target.value)} /></label></div><label>العنوان<input required value={values.address} onChange={event => update('address', event.target.value)} autoComplete="street-address" /></label>{state === 'error' && <p className="order-error" role="alert">{message}</p>}<button className="cta order-submit" type="submit" disabled={state === 'submitting'}>{state === 'submitting' ? 'جار تسجيل الطلب…' : 'تأكيد الطلب'}</button></form></section>
}
