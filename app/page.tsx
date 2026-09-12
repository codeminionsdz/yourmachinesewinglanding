import { ProductStory } from '@/components/product-story'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const requestedSlug = (await searchParams).product?.trim()
  const query = getSupabaseAdmin().from('products').select('id,name,slug,brand,description,price,currency,active,colors,sizes,media').eq('active', true)
  const { data: product, error } = await (requestedSlug ? query.eq('slug', requestedSlug).maybeSingle() : query.order('updated_at', { ascending: false }).limit(1).maybeSingle())
  if (error || !product) return <main className="product-unavailable" dir="rtl"><h1>المنتج غير متوفر حالياً</h1><p>يرجى العودة لاحقاً.</p></main>
  return <ProductStory product={product} />
}
