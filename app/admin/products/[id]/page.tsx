import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductEditor } from '@/components/product-editor'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { data: product, error } = await getSupabaseAdmin().from('products').select('id,name,slug,brand,description,price,active,colors,sizes,media').eq('id', id).maybeSingle()
  if (error || !product) notFound()
  return <main className="admin-content" dir="ltr"><div className="admin-toolbar"><div><Link className="admin-back" href="/admin/products">Products</Link><h2 className="admin-page-title">Edit product</h2></div><a className="admin-button secondary" href={`/?product=${encodeURIComponent(product.slug)}`} target="_blank" rel="noreferrer">Preview</a></div><section className="admin-panel"><ProductEditor product={{ ...product, description: product.description ?? '', colors: Array.isArray(product.colors) ? product.colors : [], sizes: Array.isArray(product.sizes) ? product.sizes : [], media: product.media && typeof product.media === 'object' ? product.media : {} }} /></section></main>
}
