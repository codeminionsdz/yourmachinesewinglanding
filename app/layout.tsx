import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Alexandria, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { MetaPixel } from '@/components/meta-pixel'
import { getIntegrationSettings } from '@/lib/integration-settings'

const bodyFont = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], variable: '--font-body', weight: ['400', '500', '600', '700'] })
const displayFont = Alexandria({ subsets: ['arabic', 'latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] })
export const metadata: Metadata = { title: 'Dani Wear | سروال Cargo قابل للتحويل', description: 'سروال واحد. حرية أكثر. اكتشف سروال Dani Wear العملي القابل للتحويل.', openGraph: { title: 'Dani Wear | سروال Cargo قابل للتحويل', description: 'سروال واحد. حرية أكثر. اكتشف سروال Dani Wear العملي القابل للتحويل.', type: 'website' }, twitter: { card: 'summary', title: 'Dani Wear | سروال Cargo قابل للتحويل', description: 'سروال واحد. حرية أكثر. اكتشف سروال Dani Wear العملي القابل للتحويل.' }, generator: 'nextjs' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f2f0e9', width: 'device-width', initialScale: 1 }
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getIntegrationSettings().catch(() => null)
  return <html lang="ar" dir="rtl" className="bg-background"><body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}>{children}<MetaPixel pixelId={settings?.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID} />{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
