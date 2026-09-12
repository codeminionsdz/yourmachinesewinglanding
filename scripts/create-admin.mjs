import { createClient } from '@supabase/supabase-js'

const [email, role = 'owner'] = process.argv.slice(2)
const password = process.env.ADMIN_PASSWORD
const allowedRoles = new Set(['owner', 'admin', 'operator'])

if (!email || !password || !allowedRoles.has(role)) {
  console.error('Usage: $env:ADMIN_PASSWORD="strong-password"; npm run admin:create -- admin@example.com owner')
  console.error('Role must be one of: owner, admin, operator')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const { data: created, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
if (authError || !created.user) {
  console.error(`Could not create Auth user: ${authError?.message ?? 'unknown error'}`)
  process.exit(1)
}

const { error: adminError } = await supabase.from('admin_users').insert({ user_id: created.user.id, role })
if (adminError) {
  await supabase.auth.admin.deleteUser(created.user.id)
  console.error(`Could not assign admin role: ${adminError.message}`)
  process.exit(1)
}

console.log(`Admin account created: ${email} (${role})`)
