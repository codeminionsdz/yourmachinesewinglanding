'use client'

import { motion } from 'motion/react'
import { ArrowUpLeft, ChevronDown, Menu, MessageCircle, ShoppingBag, Wrench, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { OrderForm } from './order-form'

const p = {
  hero:'/newest-machine-front.png',
  open:'/open-machine-detail.png',
  needle:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_16-38-03-iOge1zpOPPL6e7FeUxTu5HNeunTh8c.jpg',
  controls:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_16-51-07-Qf8gw1Hpx8GvI0xldenPCHivLgkHXE.jpg',
  fabric:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_16-43-40-cywp45PZJLklxYqtNOt6ZTqUHRhD9F.jpg',
  result:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_16-46-45-2iDZkFnhMYRR6ee0mY1pMmP2Cii7x5.jpg',
  hand:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_16-38-04-jfWWE5dvVm7Vpp2aaL7NCPJP5WAWzB.jpg',
  guide:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_15-30-05-XaxxoLGgGMNpgYT8EjAXTB6jq1kELL.jpg',
  final:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_14-48-24-hReMKRyfjBBIzEbX0BtJQvggyabR7n.jpg',
  detail:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_15-17-23-uY0ND6HZRVjsVQjCCO9Hc55Lwn9rI9.jpg',
  denim:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-30_17-16-10-ZHvXoLSqfKrTHvGecDovLe6ZqAnBkN.jpg',
  logo:'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Bu8EhALneZV7WDQLpUP10gVnJ1txq.png'
}

const Fade=({children,className=''}:{children:React.ReactNode,className?:string})=><motion.div className={className} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-8%'}} transition={{duration:.6,ease:[.22,1,.36,1]}}>{children}</motion.div>
const Button=({className=''}:{className?:string})=><a href="#order-form" className={`cta ${className}`}>اطلب الآن</a>
const ScrollCue=({className=''}:{className?:string})=><a className={`scroll-cue ${className}`} href="#features" aria-label="اكتشف المزيد"><ChevronDown/></a>
const FloatingActions=({compact}:{compact:boolean})=><div className={`floating-actions ${compact?'is-compact':''}`}><a className="whatsapp" href="https://wa.me/213555693725" target="_blank" rel="noreferrer" aria-label="الدعم الفني"><Wrench/><span>الدعم الفني</span></a><a className="cta order-action" href="#order-form" aria-label="اطلب الآن"><ShoppingBag/><span>اطلب الآن</span></a></div>
const SectionTitle=({kicker,title,children}:{kicker:string,title:string,children?:React.ReactNode})=><div className="max-w-2xl"><p className="eyebrow">{kicker}</p><h2 className="headline">{title}</h2>{children ? <p className="section-copy">{children}</p> : null}</div>

 export function ProductStory(){
 const [open,setOpen]=useState(false)
 const [compact,setCompact]=useState(false)
 useEffect(()=>{const onScroll=()=>setCompact(window.scrollY>72); onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); return()=>window.removeEventListener('scroll',onScroll)},[])
 return <main>
  <div className="trust-bar"><img src="/your-machine-logo.png" alt="Your Machine Sewing"/><span>الاستبدال أو الاسترجاع مضمون في حال خلل في المنتج</span></div>
  <header className="site-header"><a href="#top" className="brand" aria-label="YOUR MACHINE SEWING"><img src={p.logo} alt="شعار YOUR MACHINE SEWING"/><span>YOUR MACHINE<br/>SEWING</span></a><nav aria-label="التنقل الرئيسي"><a href="#features">المزايا</a><a href="#support">ما بعد الشراء</a><a href="#support">الدعم</a><Button/></nav><button className="menu-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={open?'إغلاق القائمة':'فتح القائمة'}>{open?<X/>:<Menu/>}</button>{open&&<nav className="mobile-nav"><a href="#features" onClick={()=>setOpen(false)}>المزايا</a><a href="#support" onClick={()=>setOpen(false)}>ما بعد الشراء</a><a href="#support" onClick={()=>setOpen(false)}>الدعم</a><Button/></nav>}</header>

  <section id="top" className="hero-commerce border-b border-[var(--border)]"><motion.img initial={{scale:1.03}} animate={{scale:1}} transition={{duration:1.2}} src={p.hero} alt="ماكينة أوفرلوك ACME Model 320 كاملة"/><div className="hero-panel"><p className="eyebrow hero-model">ACME model 320</p><h1>سورجي 4 خيوط منزلية بجودة صناعية</h1><p className="hero-description">ماكنة سرفلة منزلية تسورجي و تخيط و تقص القماش الزايد بإحترافية.</p><Button/></div><ScrollCue className="hero-cue"/></section>


  <section className="video-section section"><Fade><div className="video-intro"><h2>خلي الفينيسيون تهدر على خدمتك.</h2></div></Fade><video src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2534-2aoorMjkGPgaGLKB72BSFIdUP6x3n6.MOV" autoPlay muted loop playsInline controls aria-label="فيديو توضيحي للماكينة"/><p className="price video-price text-center text-primary">44,000 دج</p></section>

  <section className="section access section-with-cue"><ScrollCue className="section-cue"/><Fade><SectionTitle kicker="مسارات الخيط" title="واجهة الماكينة تفتح بالكامل.">واجهة الماكنة تفتح بالكامل و مسارات الخيط امامك بوضوح .</SectionTitle></Fade><Fade className="open-photo"><img src={p.open} alt="الماكينة مفتوحة بالكامل ومسارات الخيط واضحة"/><span>مسارات الخيط امامك بوضوح</span></Fade></section>

  <section id="features" className="section section-with-cue features-section"><Fade><SectionTitle kicker="ACME MODEL 320" title="تخدم بالطريقة اللي تحتاجها.">تخدم بـ 2، 3 أو 4 خيوط، مع 8 أنواع مختلفة من السرفلة، كيما تحبها: سورجي رقيقة ولا عريضة.</SectionTitle></Fade><div className="thread-gallery"><Fade><img src="/thread-machine.webp" alt="ثمانية أنواع مختلفة من السرفلة"/></Fade><Fade><img src="/thread-detail.webp" alt="خياطة رقيقة وعريضة بـ 2 و3 و4 خيوط"/></Fade></div></section>

  <section className="section fabric-section"><Fade><SectionTitle kicker="أنواع الأقمشة" title="كل قماش له طريقته.">تخدم جميع انواع الأقمشة، رقيق و خشين و حتى الأقمشة المطاطية.</SectionTitle></Fade><div className="fabric-journey"><img src="/fabric-machine.webp" alt="ماكينة السرفلة تخيط أقمشة مختلفة"/><div><span>قماش خفيف</span><span>قماش مطاطي</span><span>قماش سميك</span></div></div></section>

  <section className="proof-section"><img src="/denim-machine.webp" alt="ماكينة السرفلة أثناء خياطة وتجميع القماش"/><Fade className="proof-copy"><p className="eyebrow">سرفلة و تجميع</p><h2>دير السورجي و تخيط في نفس الوقت.</h2><p>دير السورجي و تخيط في نفس الوقت ( سرفلة و تجميع )</p></Fade></section>

  <section className="section reasons"><div className="reasons-layout"><div><Fade><SectionTitle kicker="علاش ACME MODEL 320؟" title="علاش ACME320 تقدر تكون شريكك المثالي فالورشة تاعك ؟"></SectionTitle></Fade><div className="reason-list">{['سرفلة نظيفة كيما تاع المصانع تخليك واثق من خدمتك قدام الزبون','ما تحصركش في نوع واحد من السرفلة أو نوع واحد من القماش؛ عندك خيارات أكثر حسب الخدمة اللي تخدمها.','بساطة في الاستعمال وسهولة في تركيب الخيط تخليك تركز على خدمتك فقط','متانة و جودة الماشينة تخليها دوم معاك حتى بعد ما يكبر مشروعك'].map((x,i)=><Fade className="reason" key={x}><strong>0{i+1}</strong><p>{x}</p></Fade>)}</div></div><Fade className="reasons-image"><img src={p.final} alt="ماكينة ACME Model 320 جاهزة للعمل"/><span>اختيار يخدم معاك</span></Fade></div></section>

  <section id="support" className="support"><div><Fade><p className="eyebrow">خبرة Your Machine Sewing</p><h2>علاش تشريها من Your Machine Sewing ؟</h2><p>لأنك ما تشريش ماكينة وتبقى وحدك بعدها.</p></Fade><div className="support-list">{[['ضمان مكتوب ومختوم لمدة عامين','باش تكون شاري وأنت مرتاح.'],['قطع الغيار متوفرة','وما تبقاش وحدك إذا احتجت قطعة في المستقبل.'],['دعم فني وخدمة ما بعد البيع','نرافقوك حتى بعد الشراء، ماشي غير حتى تخرج الماكينة من المحل.'],['محتوى تعليمي ودعم مستمر','فيديوهات تعليمية وقناة Telegram تساعدك في الاستعمال والخدمة.'],['Your Machine Sewing — خبرة حقيقية في المجال','متجر متخصص وعنده تجربة فعلية مع الماكينات والخياطين، وليس مجرد بائع على الإنترنت.'],['التوصيل للمنزل في 69 ولاية مع الدفع بعد الاستلام.','']].map(([title,copy],i)=><div key={title}><strong>{String(i+1).padStart(2,'0')}</strong><span><b>{title}</b><small>{copy}</small></span></div>)}</div><div className="support-actions"><a href="https://t.me/yourmachinesav" target="_blank" rel="noreferrer"><span>محتوى تعليمي ودعم مستمر</span><ArrowUpLeft/></a><a href="https://wa.me/213555693725" target="_blank" rel="noreferrer"><MessageCircle/><span>واتساب الدعم الفني: 0555693725</span><ArrowUpLeft/></a></div></div><img src={p.final} alt="ماكينة ACME Model 320 مع أبواب الوصول مفتوحة"/></section>

  <div className="trust-icons section"><span className="trust-gold"><img src="/gold-warranty-cropped.webp" alt="ضمان سنتين"/>ضمان 24 شهر</span><span className="trust-delivery"><img src="/fast-delivery-source.png" alt="التوصيل السريع"/>التوصيل السريع</span><span className="trust-store"><img src="/trusted-store.webp" alt="متجر موثوق"/>متجر موثوق</span></div>
  <OrderForm/>
  <FloatingActions compact={compact}/>
  <footer><img src={p.logo} alt="YOUR MACHINE SEWING"/><p>ماكينة حقيقية. خدمة واضحة. وراحة بعد الشراء.</p></footer>
 </main>
}
