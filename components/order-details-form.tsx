'use client'

import { FormEvent, useState } from 'react'
import territories from '@/data/algeria-wilayas-communes.json'

type Props = { orderId: string; fullName: string; phone: string; wilaya: string; commune: string; address: string; customerNotes: string; sellerNotes: string }

export function OrderDetailsForm({ orderId, fullName: initialName, phone: initialPhone, wilaya: initialWilaya, commune: initialCommune, address: initialAddress, customerNotes, sellerNotes: initialSellerNotes }: Props) {
  const initialWilayaRecord = territories.find(item => item.ascii === initialWilaya)
  const [values, setValues] = useState({ fullName: initialName, phone: initialPhone, wilaya: initialWilayaRecord ? String(initialWilayaRecord.code) : '', commune: initialCommune, address: initialAddress, sellerNotes: initialSellerNotes })
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const selectedWilaya = territories.find(item => String(item.code) === values.wilaya)
  function update(key: keyof typeof values, value: string) { setValues(current => ({ ...current, [key]: value })); setState('idle'); setMessage('') }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('saving'); setMessage('')
    const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderId, fullName: values.fullName, phone: values.phone, wilayaCode: values.wilaya, commune: values.commune, address: values.address, sellerNotes: values.sellerNotes }) })
    const result = await response.json().catch(() => null)
    if (!response.ok) { setState('error'); setMessage(result?.error === 'customer_update_failed' ? 'Phone may already belong to another customer.' : 'Please check the order details.'); return }
    setState('saved'); setMessage('Saved')
  }
  return <form className="order-details-form admin-panel" onSubmit={save}><h2>Edit order details</h2><div className="admin-form-grid"><label>Full name<input required value={values.fullName} onChange={event => update('fullName', event.target.value)} /></label><label>Phone<input required value={values.phone} onChange={event => update('phone', event.target.value)} /></label><label>Wilaya<select required value={values.wilaya} onChange={event => setValues(current => ({ ...current, wilaya: event.target.value, commune: '' }))}><option value="">Select wilaya</option>{territories.map(item => <option key={item.code} value={item.code}>{item.ascii} - {item.arabic}</option>)}</select></label><label>Commune<select required disabled={!selectedWilaya} value={values.commune} onChange={event => update('commune', event.target.value)}><option value="">Select commune</option>{selectedWilaya?.communes.map(item => <option key={item.ascii} value={item.ascii}>{item.ascii} - {item.arabic}</option>)}</select></label><label className="admin-form-wide">Address<input required value={values.address} onChange={event => update('address', event.target.value)} /></label><label className="admin-form-wide">Seller note<textarea maxLength={1000} value={values.sellerNotes} onChange={event => update('sellerNotes', event.target.value)} placeholder="Internal note for the seller or team" /></label><div className="admin-form-wide admin-note-readonly"><strong>Customer note</strong><p>{customerNotes || 'No customer note.'}</p></div></div><div className="admin-actions"><button className="admin-button" disabled={state === 'saving'}>{state === 'saving' ? 'Saving...' : 'Save details'}</button>{message && <small className={state === 'error' ? 'admin-error-text' : 'admin-notice'}>{message}</small>}</div></form>
}
