'use client'

import { motion } from 'motion/react'
import { ArrowDownLeft, Check, Menu, ShoppingBag, X } from 'lucide-react'
import { createContext, useContext, useState } from 'react'
import { OrderForm } from './order-form'

type Color = 'Black' | 'Grey' | 'Olive'
type ColorOption = { name: Color; swatch: string; label: string }
type Product = { id: string; name: string; slug: string; brand: string; description: string | null; price: number | null; currency: string; colors: (ColorOption | Color | string)[]; sizes: string[]; media: Record<string, string> }
const ProductMediaContext = createContext<Record<string, string>>({})
const colorDefaults: Record<Color, ColorOption> = { Black: { name: 'Black', swatch: '#101315', label: 'أسود' }, Grey: { name: 'Grey', swatch: '#747a78', label: 'رمادي' }, Olive: { name: 'Olive', swatch: '#68705a', label: 'زيتي' } }

function ProductVisual({ media, asset, label, priority = false }: { media?: Record<string, string>; asset: string; label?: string; priority?: boolean }) {
  const path = useContext(ProductMediaContext)[asset] || media?.[asset] || ''
  const isPriority = priority || asset === 'hero'
  return <div className="product-visual" data-asset={path}>
    {path && <img src={path} alt={label ?? 'صورة المنتج'} loading={isPriority ? 'eager' : 'lazy'} decoding="async" fetchPriority={isPriority ? 'high' : 'auto'} onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('asset-missing') }} />}
    <div className="asset-missing-copy"><span>{label ?? 'صورة المنتج'}</span><small>{path ? path.replace('/gurm/', '') : 'لم تتم إضافة صورة بعد'}</small></div>
  </div>
}

const Fade = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: .7, ease: [.22, 1, .36, 1] }}>{children}</motion.div>

export function ProductStory({ product }: { product: Product }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colors = product.colors.map(item => typeof item === 'string' ? colorDefaults[item as Color] : { ...colorDefaults[item.name], ...item }).filter((item): item is ColorOption => Boolean(item && colorDefaults[item.name]))
  const sizes = product.sizes
  const [color, setColor] = useState<Color>(colors[0]?.name ?? 'Black')
  const [size, setSize] = useState(sizes[0] ?? 'M')
  const scrollToOrder = () => { document.querySelector('#order-form')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  return <ProductMediaContext.Provider value={product.media}><main>
    <div className="gurm-notice"><span>{product.brand} / ملابس عملية للحركة اليومية</span><span>التوصيل إلى جميع الولايات</span></div>
    <header className="gurm-header">
      <a className="gurm-logo" href="#top" aria-label={`الصفحة الرئيسية لـ ${product.name}`}><img src="/dani-wear-logo.png" alt={`شعار ${product.brand}`} onError={event => { event.currentTarget.style.display = 'none' }} /><span>{product.brand}</span><small>علامة عملية للحركة اليومية</small></a>
      <nav className="gurm-nav" aria-label="التنقل الرئيسي"><a href="#story">الفكرة</a><a href="#details">التفاصيل</a><a href="#selector">الألوان والمقاسات</a><button onClick={scrollToOrder}>اطلب الآن <ArrowDownLeft size={16} /></button></nav>
      <button className="gurm-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>{menuOpen ? <X /> : <Menu />}</button>
      {menuOpen && <nav className="gurm-mobile-nav"><a href="#story" onClick={() => setMenuOpen(false)}>الفكرة</a><a href="#details" onClick={() => setMenuOpen(false)}>التفاصيل</a><a href="#selector" onClick={() => setMenuOpen(false)}>الألوان والمقاسات</a><a href="#order-form" onClick={scrollToOrder}>اطلب الآن</a></nav>}
    </header>

    <section id="top" className="gurm-hero"><div className="hero-copy"><p className="gurm-kicker">Dani Wear / سروال Cargo قابل للتحويل</p><h1>سروال واحد.<br /><em>حرية أكثر.</em></h1><p className="hero-lede">سروال عملي مصمم للحركة. للطريق، للأيام خارج المنزل، ولكل ما يأتي بعدها.</p><p className="hero-price">{product.price === null ? 'السعر سيُعلن لاحقاً' : `${product.price.toLocaleString()} ${product.currency}`}</p><button className="gurm-button" onClick={scrollToOrder}>اطلب الآن <ArrowDownLeft size={18} /></button><div className="hero-trust"><span><Check size={16} /> الدفع عند الاستلام</span><span><Check size={16} /> التوصيل إلى جميع الولايات</span></div></div><div className="hero-art"><ProductVisual asset="hero" priority label="سروال Dani Wear بجانب دراجة نارية" /><span className="hero-index">01 / 04</span></div></section>

    <section id="story" className="gurm-story"><Fade><div><p className="gurm-kicker">الفكرة</p><h2>سروال واحد.<br /><span>طريقتان للّبس.</span></h2></div></Fade><Fade className="story-copy"><p>سروال عملي يواكب إيقاعك. ارتده بطوله الكامل عندما تحتاجه، وحوّله إلى شورت عندما تحتاج إلى حرية أكبر.</p><div className="story-line"><span>01</span><span>من المدينة إلى الطريق، دون تغيير ملابسك.</span></div></Fade></section>

    <section className="conversion"><div className="conversion-head"><p className="gurm-kicker">التحويل</p><h2>من سروال<br /><em>إلى شورت.</em></h2><p>حرية أكبر عندما تحتاج إليها.</p></div><div className="conversion-visuals"><ProductVisual asset="fullBody" label="سروال GURM بطوله الكامل" /><div className="conversion-arrow">←</div><ProductVisual asset="shorts" label="سروال GURM بعد تحويله إلى شورت" /></div><div className="conversion-steps"><span><b>01</b> سروال</span><span><b>02</b> تحويل</span><span><b>03</b> شورت</span></div></section>

    <section id="details" className="details-editorial"><Fade><div className="detail-visual"><ProductVisual asset="detail" label="تفصيل الجيب العملي في سروال GURM" /></div></Fade><Fade className="detail-copy"><p className="gurm-kicker">مصمم للحركة</p><h2>كل ما تحتاجه.<br /><em>ولا شيء زائد.</em></h2><p>تصميم Cargo عملي، جيوب متعددة للاستخدام اليومي، وقصة تمنحك حرية الحركة في الطريق وخارجه.</p><div className="feature-list"><span><b>01</b> تصميم قابل للتحويل</span><span><b>02</b> جيوب عملية متعددة</span><span><b>03</b> مصمم للحركة</span></div></Fade></section>

    <section className="waterproof-section"><div className="waterproof-copy"><p className="gurm-kicker">جاهز للطقس</p><h2>مقاوم للماء.<br /><em>مصمم للخارج.</em></h2><p>خامة عملية تساعدك على مواصلة يومك بثقة، حتى عندما يتغير الطقس.</p></div><div className="waterproof-images"><ProductVisual asset="fullBody" label="سروال GURM المقاوم للماء" /><ProductVisual asset="detail" label="تفصيل خامة سروال GURM" /></div></section>

    <section className="gurm-gallery"><div className="gallery-heading"><p className="gurm-kicker">GURM</p><h2>للطريق.<br /><em>وللحياة اليومية.</em></h2></div><div className="gallery-grid"><ProductVisual asset="motorcycle" label="سروال GURM في أجواء ركوب الدراجة" /><ProductVisual asset="colors" label="ألوان سروال GURM" /><ProductVisual asset="grey" label="سروال GURM باللون الرمادي" /><ProductVisual asset="olive" label="سروال GURM باللون الزيتي" /></div></section>

    <section className="use-cases"><div className="use-heading"><p className="gurm-kicker">سروال واحد / أيام متعددة</p><h2>للطريق.<br />وللحياة.</h2></div><div className="use-list"><div><span>01</span><h3>للطريق</h3><p>حرية حركة أثناء القيادة.</p></div><div><span>02</span><h3>لليوميات</h3><p>عملي وسهل التنسيق.</p></div><div><span>03</span><h3>للخارج</h3><p>خيار عملي للحركة والأنشطة الخارجية.</p></div><div><span>04</span><h3>للسفر</h3><p>قطعة واحدة، استخدامات متعددة.</p></div></div></section>

    <section id="selector" className="selector-section"><div><p className="gurm-kicker">اختر Dani Wear</p><h2>لونك.<br /><em>مقاسك.</em></h2><p className="selector-note">متوفر بالأسود والرمادي والزيتي. المقاسات من S إلى XXL.</p></div><div className="selector-panel"><div className="selected-product"><ProductVisual asset="black" label="صورة المنتج الأساسية لسروال Dani Wear" /></div><div className="variant-group"><label>اختر اللون <strong>{colors.find(item => item.name === color)?.label}</strong></label><div className="color-options">{colors.map(item => <button key={item.name} className={color === item.name ? 'selected' : ''} onClick={() => setColor(item.name)} aria-label={`اختيار اللون ${item.label}`}><i style={{ background: item.swatch }} /><span>{item.label}</span></button>)}</div></div><div className="variant-group"><label>اختر المقاس <strong>{size}</strong></label><div className="size-options">{sizes.map(item => <button key={item} className={size === item ? 'selected' : ''} onClick={() => setSize(item)}>{item}</button>)}</div></div><button className="gurm-button full" onClick={scrollToOrder}><ShoppingBag size={18} /> اطلب {color === 'Black' ? 'بالأسود' : color === 'Grey' ? 'بالرمادي' : 'بالزيتي'} / {size}</button></div></section>

    <section className="faq-section"><div><p className="gurm-kicker">أسئلة شائعة</p><h2>كل ما تحتاج<br />إلى معرفته.</h2></div><div className="faq-list"><details><summary>هل يمكن تحويل السروال إلى شورت؟</summary><p>نعم، صُمم GURM ليُرتدى كسروال أو كشورت عند الحاجة.</p></details><details><summary>ما هي المقاسات المتوفرة؟</summary><p>المقاسات المتوفرة هي S و M و L و XL و XXL.</p></details><details><summary>ما هي الألوان المتوفرة؟</summary><p>الأسود والرمادي والزيتي.</p></details><details><summary>هل التوصيل متوفر إلى جميع الولايات؟</summary><p>نعم، التوصيل متوفر إلى جميع الولايات في الجزائر.</p></details><details><summary>هل الدفع عند الاستلام متوفر؟</summary><p>نعم، الدفع عند الاستلام متوفر.</p></details><details><summary>كيف أختار المقاس المناسب؟</summary><p>اختر المقاس المعتاد لديك. ستتم إضافة دليل المقاسات عند توفر القياسات الدقيقة.</p></details></div></section>
    <section className="trust-section"><p>✓ التوصيل إلى جميع الولايات</p><p>✓ الدفع عند الاستلام</p></section>
    <p className="public-price" dir="rtl">{product.price === null ? 'السعر عند التأكيد' : `${product.price.toLocaleString()} ${product.currency}`}</p>
    <OrderForm productSlug={product.slug} productName={product.name} price={product.price} currency={product.currency} color={color} size={size} />
    <button className="mobile-buy" onClick={scrollToOrder}>اطلب الآن <ArrowDownLeft size={16} /></button>
    <footer className="gurm-footer"><span>Dani Wear</span><p>سروال واحد. حرية أكثر.</p><small>© 2026 Dani Wear — الجزائر</small></footer>
  </main></ProductMediaContext.Provider>
}
