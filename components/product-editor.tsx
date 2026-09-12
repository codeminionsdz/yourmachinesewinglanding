'use client'

import { useState } from 'react'

const colorOptions = ['Black', 'Grey', 'Olive']
const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL']
type Product = { id?: string; name: string; slug: string; brand: string; description: string; price: number | null; active: boolean; colors: { name: string; label: string; swatch: string }[]; sizes: string[]; media: Record<string, string> }
type Props = { product?: Product }

export function ProductEditor({ product }: Props) {
  const initialProduct = product ? { ...product, colors: product.colors.map(color => typeof color === 'string' ? { name: color, label: color, swatch: '#777777' } : color) } : { name: '', slug: '', brand: '', description: '', price: null, active: false, colors: [], sizes: [], media: {} }
  const [form, setForm] = useState<Product>(initialProduct)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const update = (key: keyof Product, value: unknown) => { setState('idle'); setForm(current => ({ ...current, [key]: value })) }
  const toggle = (key: 'colors' | 'sizes', value: string) => { if (key === 'sizes') update(key, form.sizes.includes(value) ? form.sizes.filter(item => item !== value) : [...form.sizes, value]); else update(key, form.colors.some(item => item.name === value) ? form.colors.filter(item => item.name !== value) : [...form.colors, { name: value, label: value, swatch: '#777777' }]) }
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setState('saving')
    const response = await fetch(product?.id ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product?.id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, colors: form.colors.map(color => color.name), price: form.price === null ? null : Number(form.price) }) })
    setState(response.ok ? 'saved' : 'error')
  }
  return <form className="product-editor" onSubmit={save} dir="ltr"><div className="admin-form-grid"><label>Product name<input required value={form.name} onChange={event => update('name', event.target.value)} /></label><label>Slug<input required value={form.slug} onChange={event => update('slug', event.target.value)} /></label><label>Brand<input required value={form.brand} onChange={event => update('brand', event.target.value)} /></label><label>Price (DZD)<input type="number" min="0" step="1" value={form.price ?? ''} onChange={event => update('price', event.target.value === '' ? null : Number(event.target.value))} placeholder="Enter price when ready" /></label><label className="admin-form-wide">Description<textarea rows={5} value={form.description} onChange={event => update('description', event.target.value)} /></label></div><section className="editor-section"><h3>Variants</h3><fieldset><legend>Colors</legend><div className="editor-options">{colorOptions.map(value => <label key={value}><input type="checkbox" checked={form.colors.some(color => color.name === value)} onChange={() => toggle('colors', value)} />{value}</label>)}</div></fieldset><fieldset><legend>Sizes</legend><div className="editor-options">{sizeOptions.map(value => <label key={value}><input type="checkbox" checked={form.sizes.includes(value)} onChange={() => toggle('sizes', value)} />{value}</label>)}</div></fieldset></section><section className="editor-section"><h3>Media</h3><div className="admin-form-grid">{['hero', 'black', 'grey', 'olive', 'detail', 'shorts', 'fullBody', 'motorcycle', 'colors'].map(key => <label key={key}>{key}<input value={form.media[key] ?? ''} onChange={event => update('media', { ...form.media, [key]: event.target.value })} placeholder="/gurm/..." /></label>)}</div></section><label className="editor-active"><input type="checkbox" checked={form.active} onChange={event => update('active', event.target.checked)} /> Active and published</label><div className="admin-actions"><button className="admin-button" disabled={state === 'saving'}>{state === 'saving' ? 'Saving...' : 'Save changes'}</button>{state === 'saved' && <span className="admin-notice">Product updated successfully.</span>}{state === 'error' && <span className="admin-error-text">Unable to save product. Check the fields.</span>}</div></form>
}
