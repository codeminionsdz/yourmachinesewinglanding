import Link from 'next/link'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { AdminLogout } from '@/components/admin-logout'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getSupabaseServer(); const { data: { user } } = await auth.auth.getUser()
  if (!user) return <>{children}</>
  const { data: admin } = await getSupabaseAdmin().from('admin_users').select('role').eq('user_id', user.id).maybeSingle()
  if (!admin) return <>{children}</>
  const role = admin.role
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand">Dani Wear<span>Commerce</span></div><nav className="admin-nav"><Link href="/admin">Overview</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/abandoned-orders">Abandoned orders</Link><Link href="/admin/customers">Customers</Link><Link href="/admin/products">Products</Link><Link href="/admin/settings">Settings</Link></nav></aside><div className="admin-main"><header className="admin-topbar"><h1>Commerce overview</h1><div className="admin-user"><span>{user.email} · {role}</span><AdminLogout /></div></header>{children}</div></div>
}
