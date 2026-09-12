import Link from 'next/link'
import { ProductEditor } from '@/components/product-editor'
import { requireAdmin } from '@/lib/admin-auth'

export default async function NewProductPage() {
  await requireAdmin()
  return <main className="admin-content" dir="ltr"><div className="admin-toolbar"><div><Link className="admin-back" href="/admin/products">Products</Link><h2 className="admin-page-title">New product</h2></div></div><section className="admin-panel"><ProductEditor /></section></main>
}
