'use client'

import Link from 'next/link'
import { useState } from 'react'

const statuses = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
type OrderRow = { id: string; order_number: string; quantity: number; total_amount: number; status: string; created_at: string; wilaya?: string; customers?: { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[] | null }

export function AdminOrdersTable({ rows, total }: { rows: OrderRow[]; total: number }) {
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const allSelected = rows.length > 0 && rows.every(order => selected.includes(order.id))

  function toggle(orderId: string) {
    setSelected(current => current.includes(orderId) ? current.filter(id => id !== orderId) : [...current, orderId])
  }

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map(order => order.id))
  }

  async function updateOrders(orderIds: string[], status: string) {
    if (!orderIds.length) return
    setBusy(true); setMessage('')
    const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderIds, status }) })
    if (!response.ok) { setMessage('Update failed'); setBusy(false); return }
    window.location.reload()
  }

  async function deleteOrders(orderIds: string[]) {
    if (!orderIds.length || !confirm(`Delete ${orderIds.length} order(s)? This cannot be undone.`)) return
    setBusy(true); setMessage('')
    const response = await fetch('/api/admin/orders', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderIds }) })
    if (!response.ok) { setMessage('Delete failed'); setBusy(false); return }
    window.location.reload()
  }

  return <>
    <div className="admin-bulk-actions">
      <span>{selected.length} selected</span>
      <button className="admin-button" disabled={busy || !selected.length} onClick={() => updateOrders(selected, 'confirmed')}>Confirm selected</button>
      <button className="admin-button danger" disabled={busy || !selected.length} onClick={() => deleteOrders(selected)}>Delete selected</button>
      {message && <small className="admin-error-text">{message}</small>}
    </div>
    <table className="admin-table"><thead><tr><th><input type="checkbox" aria-label="Select all orders" checked={allSelected} onChange={toggleAll} disabled={busy} /></th><th>Order number</th><th>Customer</th><th>Phone</th><th>Wilaya</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{rows.map(order => { const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers; return <AdminOrderRow key={order.id} order={order} customer={customer} selected={selected.includes(order.id)} busy={busy} onToggle={() => toggle(order.id)} onStatus={status => updateOrders([order.id], status)} onDelete={() => deleteOrders([order.id])} /> })}</tbody></table><p>{total} result(s)</p>
  </>
}

function AdminOrderRow({ order, customer, selected, busy, onToggle, onStatus, onDelete }: { order: OrderRow; customer?: { full_name?: string; phone?: string } | null; selected: boolean; busy: boolean; onToggle: () => void; onStatus: (status: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  return <tr><td><input type="checkbox" aria-label={`Select ${order.order_number}`} checked={selected} onChange={onToggle} disabled={busy} /></td><td><Link href={`/admin/orders/${order.id}`}>{order.order_number}</Link></td><td>{customer?.full_name}</td><td>{customer?.phone}</td><td>{order.wilaya}</td><td>{order.quantity}</td><td>{Number(order.total_amount).toLocaleString()} DZD</td><td>{editing ? <select className="admin-status-select" autoFocus defaultValue={order.status} disabled={busy} onChange={event => { setEditing(false); if (event.target.value !== order.status) onStatus(event.target.value) }} onBlur={() => setEditing(false)}>{statuses.map(status => <option key={status}>{status}</option>)}</select> : <button className="admin-status clickable" onClick={() => setEditing(true)} disabled={busy}>{order.status}</button>}</td><td>{new Date(order.created_at).toLocaleDateString()}</td><td><button className="admin-delete-button" onClick={onDelete} disabled={busy}>Delete</button></td></tr>
}
