import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  Clock3, Globe2, Menu, Play, ShieldCheck, Sparkles, X, Zap,
} from 'lucide-react';

const queryClient = new QueryClient();

type Lang = 'en' | 'fr' | 'ar';
type Copy = typeof copy.en;

const copy = {
  en: {
    nav: ['Capabilities', 'Method', 'Selected work', 'FAQ'],
    badge: 'Independent digital product studio',
    heroTitle: 'Build the digital business your ambition deserves.',
    heroBody: 'Spectra designs and builds high-performing websites, applications and intelligent systems for companies ready to move with precision.',
    watch: 'Watch the free lesson',
    book: 'Book a strategy call',
    scroll: 'Scroll to explore',
    status: 'Now accepting 3 strategic partnerships for Q2',
    lessonKicker: 'The free strategic lesson',
    lessonTitle: 'Why most businesses invest in the wrong digital product.',
    lessonBody: 'A 14-minute field guide to the quiet decisions that separate a digital presence from a digital growth engine.',
    lessonPoints: ['The conversion leaks hiding in your current experience', 'The operating system behind effortless scale', 'How to turn attention into qualified conversations', 'A practical scorecard for your next investment'],
    lessonCta: 'Continue to the consultation',
    capabilitiesKicker: 'Capabilities, without the theatre',
    capabilitiesTitle: 'Complex problems. Clear interfaces.',
    capabilitiesBody: 'One senior team from strategy to shipped product. No hand-offs into a black box.',
    capabilities: [['01', 'Digital products', 'Websites, portals and applications that make the hard parts feel obvious.'], ['02', 'Intelligent systems', 'CRM, ERP and AI automation that give your team back its time.'], ['03', 'Growth systems', 'Brand, UX and demand strategy built around measurable movement.'], ['04', 'Technical direction', 'The architecture, security and product thinking to scale with confidence.']],
    resultsKicker: 'A measurable difference',
    resultsTitle: 'Good taste is only useful when it performs.',
    results: [['150+', 'products shipped'], ['98%', 'client satisfaction'], ['3.1×', 'average lead growth'], ['24/7', 'care when it matters']],
    methodKicker: 'The Spectra method',
    methodTitle: 'Fewer meetings. Better decisions.',
    methodBody: 'A deliberately small, senior process that keeps momentum visible at every stage.',
    steps: [['01', 'Discover', 'Get to the commercial truth before we touch a pixel.'], ['02', 'Shape', 'Turn the truth into a focused product and growth thesis.'], ['03', 'Design', 'Make every interaction earn its place.'], ['04', 'Build', 'Engineer a fast, resilient system that is ready for real users.'], ['05', 'Grow', 'Measure what moved and make the next move sharper.']],
    workKicker: 'Selected work',
    workTitle: 'Built for the moment after launch.',
    workBody: 'A glimpse into the kinds of digital leverage we create with ambitious teams.',
    work: [['Astra Health', 'Patient access, redesigned', 'Healthcare / Web platform', '47%', 'more completed bookings'], ['Nadir Finance', 'Clarity for complex capital', 'Fintech / Product system', '2.8×', 'qualified lead velocity'], ['Northline', 'A new operating rhythm', 'Logistics / Automation', '31h', 'returned each week']],
    proofKicker: 'What it feels like to work with us',
    proofTitle: 'Calm, clear, commercially useful.',
    quote: 'Spectra did not just give us a beautiful product. They gave our team a new level of confidence in how we show up to the market.',
    quoteBy: 'Maya Laurent — Founder, Nadir Finance',
    formKicker: 'Make the next move',
    formTitle: 'Let’s discuss what you’re building.',
    formBody: 'Tell us enough to start a useful conversation. We reply within one business day.',
    formFields: ['Your name', 'Company', 'Work email', 'Phone (optional)', 'What are you looking to build?'],
    formButton: 'Request my consultation',
    formSuccess: 'Your note is with the team. We’ll be in touch within one business day.',
    services: ['Website', 'Mobile app', 'CRM / ERP', 'Automation', 'AI system', 'Brand / growth'],
    scheduleKicker: 'Choose your next step',
    scheduleTitle: 'Find a time that works.',
    scheduleBody: 'A focused 30-minute conversation. No pitch deck, no pressure.',
    scheduleConfirm: 'Confirm this time',
    confirmed: 'You’re on the calendar.',
    faqKicker: 'Clear answers',
    faqTitle: 'Before we meet',
    faqs: [['What does a first engagement look like?', 'We start with a focused discovery conversation and a short, paid strategy sprint when the problem needs more definition. You receive a clear opportunity map and a practical next step.'], ['What is the investment range?', 'Most product engagements begin between €18k and €65k, depending on scope and the depth of the system. We will always name the shape of the work before asking you to commit.'], ['How long does a project take?', 'A focused launch can take 6–10 weeks. Larger systems are staged into visible releases so your team sees progress early and often.'], ['Do you support what you build?', 'Yes. Every handover includes documentation and a clean path to ongoing care, optimisation and growth support.'], ['Who owns the final product?', 'You do. Your code, design files, content and accounts stay yours from day one.']],
    finalTitle: 'Your next chapter needs a better system.',
    finalCta: 'Book the free strategy session',
  },
  fr: {
    nav: ['Expertise', 'Méthode', 'Projets', 'FAQ'],
    badge: 'Studio indépendant de produits digitaux',
    heroTitle: 'Construisez l’entreprise digitale à la hauteur de votre ambition.',
    heroBody: 'Spectra imagine et développe des sites, applications et systèmes intelligents pour les entreprises qui veulent avancer avec précision.',
    watch: 'Voir la leçon gratuite', book: 'Réserver un appel stratégique', scroll: 'Explorer',
    status: 'Nous ouvrons 3 partenariats stratégiques pour le T2',
    lessonKicker: 'La leçon stratégique gratuite', lessonTitle: 'Pourquoi la plupart des entreprises investissent dans le mauvais produit digital.',
    lessonBody: 'Un guide de 14 minutes sur les décisions discrètes qui transforment une présence digitale en moteur de croissance.',
    lessonPoints: ['Les fuites de conversion de votre expérience actuelle', 'Le système opérationnel derrière une croissance simple', 'Transformer l’attention en conversations qualifiées', 'Une grille pour votre prochain investissement'],
    lessonCta: 'Passer à la consultation',
    capabilitiesKicker: 'Expertise, sans le théâtre', capabilitiesTitle: 'Les problèmes complexes. Des interfaces claires.', capabilitiesBody: 'Une équipe senior, de la stratégie au produit livré. Aucun relais dans une boîte noire.',
    capabilities: [['01', 'Produits digitaux', 'Sites, portails et applications qui rendent les sujets difficiles évidents.'], ['02', 'Systèmes intelligents', 'CRM, ERP et automatisation IA pour rendre du temps à vos équipes.'], ['03', 'Systèmes de croissance', 'Marque, UX et acquisition pensés autour de résultats mesurables.'], ['04', 'Direction technique', 'Architecture, sécurité et vision produit pour évoluer sereinement.']],
    resultsKicker: 'Une différence mesurable', resultsTitle: 'Le bon goût compte lorsqu’il performe.', results: [['150+', 'produits livrés'], ['98%', 'satisfaction client'], ['3,1×', 'croissance moyenne des leads'], ['24/7', 'présents quand cela compte']],
    methodKicker: 'La méthode Spectra', methodTitle: 'Moins de réunions. De meilleures décisions.', methodBody: 'Un processus volontairement senior qui garde l’élan visible à chaque étape.', steps: [['01', 'Découvrir', 'Comprendre la vérité commerciale avant de toucher à un pixel.'], ['02', 'Structurer', 'Transformer cette vérité en thèse produit et croissance.'], ['03', 'Designer', 'Faire mériter sa place à chaque interaction.'], ['04', 'Construire', 'Développer un système rapide, robuste, prêt pour le réel.'], ['05', 'Accélérer', 'Mesurer le mouvement et rendre le suivant plus précis.']],
    workKicker: 'Projets choisis', workTitle: 'Pensés pour le moment après le lancement.', workBody: 'Un aperçu du levier digital que nous créons avec des équipes ambitieuses.', work: [['Astra Health', 'Réinventer l’accès patient', 'Santé / Plateforme web', '47%', 'de réservations finalisées en plus'], ['Nadir Finance', 'La clarté pour un capital complexe', 'Fintech / Système produit', '2,8×', 'de vélocité de leads qualifiés'], ['Northline', 'Un nouveau rythme opérationnel', 'Logistique / Automatisation', '31h', 'récupérées chaque semaine']],
    proofKicker: 'Travailler avec nous', proofTitle: 'Calme, clair, utile au business.', quote: 'Spectra ne nous a pas seulement livré un produit magnifique. Ils ont donné à notre équipe une nouvelle confiance pour entrer sur le marché.', quoteBy: 'Maya Laurent — Fondatrice, Nadir Finance',
    formKicker: 'Faire le prochain pas', formTitle: 'Parlons de ce que vous construisez.', formBody: 'Dites-nous assez pour commencer une conversation utile. Réponse sous un jour ouvré.', formFields: ['Votre nom', 'Entreprise', 'Email professionnel', 'Téléphone (optionnel)', 'Que souhaitez-vous construire ?'], formButton: 'Demander ma consultation', formSuccess: 'Votre message est bien arrivé. Nous revenons vers vous sous un jour ouvré.', services: ['Site web', 'Application mobile', 'CRM / ERP', 'Automatisation', 'Système IA', 'Marque / croissance'],
    scheduleKicker: 'Choisir la suite', scheduleTitle: 'Trouvez un créneau.', scheduleBody: 'Une conversation ciblée de 30 minutes. Sans pression.', scheduleConfirm: 'Confirmer ce créneau', confirmed: 'Vous êtes dans le calendrier.',
    faqKicker: 'Réponses claires', faqTitle: 'Avant notre échange', faqs: [['À quoi ressemble une première mission ?', 'Nous commençons par un échange de découverte ciblé, puis un sprint stratégique rémunéré lorsque le problème mérite plus de définition.'], ['Quel est le budget ?', 'La plupart des missions commencent entre 18k et 65k €, selon le périmètre et la profondeur du système.'], ['Combien de temps faut-il ?', 'Un lancement ciblé prend 6 à 10 semaines. Les systèmes plus larges sont livrés par étapes visibles.'], ['Accompagnez-vous les produits ?', 'Oui. Chaque transfert inclut la documentation et un chemin clair pour le suivi et l’optimisation.'], ['À qui appartient le produit ?', 'À vous. Le code, les fichiers et les comptes restent les vôtres dès le premier jour.']], finalTitle: 'Votre prochain chapitre mérite un meilleur système.', finalCta: 'Réserver la session stratégique gratuite',
  },
  ar: {
    nav: ['الخدمات', 'المنهجية', 'أعمالنا', 'الأسئلة'],
    badge: 'استوديو مستقل للمنتجات الرقمية',
    heroTitle: 'ابنِ العمل الرقمي الذي يليق بطموحك.',
    heroBody: 'تصمم Spectra مواقع وتطبيقات وأنظمة ذكية عالية الأداء للشركات المستعدة للتحرك بدقة.',
    watch: 'شاهد الدرس المجاني', book: 'احجز مكالمة استراتيجية', scroll: 'استكشف',
    status: 'نستقبل الآن 3 شراكات استراتيجية للربع القادم',
    lessonKicker: 'الدرس الاستراتيجي المجاني', lessonTitle: 'لماذا تستثمر معظم الشركات في المنتج الرقمي الخطأ؟',
    lessonBody: 'دليل عملي مدته 14 دقيقة للقرارات الهادئة التي تحول حضورك الرقمي إلى محرك نمو.',
    lessonPoints: ['تسريبات التحويل المخفية في تجربتك الحالية', 'النظام التشغيلي وراء التوسع السلس', 'كيف تحول الانتباه إلى محادثات مؤهلة', 'بطاقة عملية لاستثمارك القادم'],
    lessonCta: 'تابع إلى الاستشارة',
    capabilitiesKicker: 'خبرة بلا مبالغة', capabilitiesTitle: 'مشكلات معقدة. واجهات واضحة.', capabilitiesBody: 'فريق واحد من الاستراتيجية إلى المنتج المنشور. بلا تسليم إلى صندوق أسود.',
    capabilities: [['01', 'منتجات رقمية', 'مواقع وتطبيقات تجعل أصعب الأجزاء واضحة.'], ['02', 'أنظمة ذكية', 'CRM وERP وأتمتة ذكاء اصطناعي تعيد الوقت لفريقك.'], ['03', 'أنظمة النمو', 'علامة وتجربة مستخدم واستراتيجية طلب مبنية على حركة قابلة للقياس.'], ['04', 'توجيه تقني', 'هندسة وأمان وتفكير منتج للتوسع بثقة.']],
    resultsKicker: 'فرق يمكن قياسه', resultsTitle: 'الذوق الرفيع مفيد عندما يحقق نتائج.', results: [['150+', 'منتجاً أطلقناه'], ['98%', 'رضا العملاء'], ['3.1×', 'متوسط نمو العملاء المحتملين'], ['24/7', 'دعم عندما يهم الأمر']],
    methodKicker: 'منهجية Spectra', methodTitle: 'اجتماعات أقل. قرارات أفضل.', methodBody: 'عملية صغيرة وذات خبرة تحافظ على وضوح التقدم في كل مرحلة.', steps: [['01', 'اكتشاف', 'نصل إلى الحقيقة التجارية قبل لمس أي بكسل.'], ['02', 'تشكيل', 'نحول الحقيقة إلى رؤية واضحة للمنتج والنمو.'], ['03', 'تصميم', 'نجعل كل تفاعل يستحق مكانه.'], ['04', 'بناء', 'نهندس نظاماً سريعاً ومرناً للمستخدمين الحقيقيين.'], ['05', 'نمو', 'نقيس ما تحرك ونجعل الخطوة التالية أدق.']],
    workKicker: 'أعمال مختارة', workTitle: 'مصممة للحظة ما بعد الإطلاق.', workBody: 'لمحة عن النفوذ الرقمي الذي نصنعه مع الفرق الطموحة.', work: [['Astra Health', 'إعادة تصميم وصول المرضى', 'الصحة / منصة ويب', '47%', 'زيادة في الحجوزات المكتملة'], ['Nadir Finance', 'وضوح لرأس مال معقد', 'تقنية مالية / نظام منتج', '2.8×', 'سرعة العملاء المحتملين'], ['Northline', 'إيقاع تشغيلي جديد', 'لوجستيات / أتمتة', '31h', 'موفرة كل أسبوع']],
    proofKicker: 'كيف يبدو العمل معنا', proofTitle: 'هادئ، واضح، مفيد تجارياً.', quote: 'لم تمنحنا Spectra منتجاً جميلاً فحسب، بل منحت فريقنا ثقة جديدة في طريقة ظهورنا أمام السوق.', quoteBy: 'مايا لوران — مؤسسة Nadir Finance',
    formKicker: 'اتخذ الخطوة التالية', formTitle: 'لنتحدث عن الشيء الذي تبنيه.', formBody: 'أخبرنا بما يكفي لبدء محادثة مفيدة. نرد خلال يوم عمل واحد.', formFields: ['اسمك', 'الشركة', 'البريد الإلكتروني للعمل', 'الهاتف (اختياري)', 'ماذا تريد أن تبني؟'], formButton: 'اطلب استشارتي', formSuccess: 'وصلت رسالتك إلى الفريق. سنتواصل معك خلال يوم عمل.', services: ['موقع إلكتروني', 'تطبيق جوال', 'CRM / ERP', 'أتمتة', 'نظام ذكاء اصطناعي', 'علامة / نمو'],
    scheduleKicker: 'اختر خطوتك التالية', scheduleTitle: 'اعثر على الوقت المناسب.', scheduleBody: 'محادثة مركزة لمدة 30 دقيقة. بلا ضغط.', scheduleConfirm: 'تأكيد هذا الوقت', confirmed: 'تم حجزك في التقويم.',
    faqKicker: 'إجابات واضحة', faqTitle: 'قبل أن نلتقي', faqs: [['كيف تبدأ المهمة الأولى؟', 'نبدأ بمحادثة اكتشاف مركزة، ثم sprint استراتيجي مدفوع عندما تحتاج المشكلة إلى تعريف أعمق.'], ['ما نطاق الاستثمار؟', 'تبدأ معظم المشاريع بين 18 ألفاً و65 ألف يورو، حسب النطاق وعمق النظام.'], ['كم يستغرق المشروع؟', 'يمكن أن يستغرق الإطلاق المركز من 6 إلى 10 أسابيع. الأنظمة الأكبر تطلق على مراحل مرئية.'], ['هل تدعمون ما تبنونه؟', 'نعم. كل تسليم يتضمن التوثيق وطريقاً واضحاً للرعاية والتحسين.'], ['من يملك المنتج النهائي؟', 'أنتم. الكود وملفات التصميم والحسابات ملككم منذ اليوم الأول.']], finalTitle: 'فصلك القادم يحتاج إلى نظام أفضل.', finalCta: 'احجز جلسة الاستراتيجية المجانية',
  },
} as const;

function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [confirmed, setConfirmed] = useState(false);
  const [sent, setSent] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const t = copy[lang] as Copy;
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  useEffect(() => {
    let shown = false;
    const onLeave = (event: MouseEvent) => {
      if (!shown && event.clientY < 12) { setExitOpen(true); shown = true; }
    };
    document.addEventListener('mouseout', onLeave);
    return () => document.removeEventListener('mouseout', onLeave);
  }, []);

  const dayLabels = useMemo(() => lang === 'fr' ? ['Mar 18', 'Mer 19', 'Jeu 20', 'Ven 21'] : lang === 'ar' ? ['الثلاثاء 18', 'الأربعاء 19', 'الخميس 20', 'الجمعة 21'] : ['Tue 18', 'Wed 19', 'Thu 20', 'Fri 21'], [lang]);

  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const submitForm = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey={lang}>
          <div className="spectra-page noise" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[.07] bg-[#080a0d]/75 backdrop-blur-xl">
              <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
                <button onClick={() => scrollTo('top')} className="focus-ring flex items-center gap-3" aria-label="Spectra home" data-testid="button-home">
                  <span className="relative flex h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-[#11151a]">
                    <img src="/assets/spectra-logo.jpeg" alt="Spectra" className="h-full w-full object-cover" />
                  </span>
                  <span className="font-code text-[12px] font-medium tracking-[.28em] text-[#e7ebf0]">SPECTRA</span>
                </button>
                <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
                  {t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(['capabilities','method','work','faq'][index])} className="focus-ring text-[12px] text-[#8e9aaa] transition-colors hover:text-white" data-testid={`link-nav-${index}`}>{item}</button>)}
                </nav>
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.03] p-1 sm:flex" aria-label="Language selector">
                    {(['en','fr','ar'] as Lang[]).map((item) => <button key={item} onClick={() => setLang(item)} className={`focus-ring rounded-full px-2.5 py-1 font-code text-[10px] uppercase transition ${lang === item ? 'bg-white text-[#080a0d]' : 'text-[#8290a2] hover:text-white'}`} data-testid={`button-language-${item}`}>{item}</button>)}
                  </div>
                  <button onClick={() => scrollTo('consultation')} className="hidden rounded-full bg-[#e7ebf0] px-4 py-2.5 text-[11px] font-bold text-[#080a0d] transition hover:bg-[#9fc5ff] sm:block" data-testid="button-header-cta">{t.book}</button>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring rounded-full border border-white/15 p-2 text-[#d6dde8] lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
                </div>
              </div>
              {menuOpen && <div className="border-t border-white/10 bg-[#0b0e12] px-5 py-5 lg:hidden">
                <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
                  {t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(['capabilities','method','work','faq'][index])} className="text-start text-sm text-[#b7c1ce]" data-testid={`link-mobile-nav-${index}`}>{item}</button>)}
                  <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-4">{(['en','fr','ar'] as Lang[]).map(item => <button key={item} onClick={() => setLang(item)} className={`rounded-full border px-3 py-1.5 font-code text-[10px] uppercase ${lang === item ? 'border-white bg-white text-black' : 'border-white/15 text-[#9ba8b7]'}`} data-testid={`button-mobile-language-${item}`}>{item}</button>)}</div>
                  <button onClick={() => scrollTo('consultation')} className="mt-1 rounded-full bg-[#e7ebf0] px-4 py-3 text-xs font-bold text-[#080a0d]" data-testid="button-mobile-cta">{t.book}</button>
                </div>
              </div>}
            </header>

            <main id="top">
              <section className="relative flex min-h-[760px] items-center overflow-hidden border-b border-white/[.07] pt-24 lg:min-h-[850px]">
                <div className="grid-fade absolute inset-0 opacity-60" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-[12%] top-[22%] h-px w-[70%] bg-gradient-to-r from-transparent via-[#6689b6]/50 to-transparent" style={{ animation: 'pulse-line 4s ease-in-out infinite' }} />
                  <div className="absolute left-[67%] top-[4%] h-[460px] w-[460px] rounded-full border border-[#526d8f]/20" style={{ animation: 'rotate-slow 34s linear infinite' }}><div className="absolute left-0 top-1/2 h-2 w-2 rounded-full bg-[#79aef4] shadow-[0_0_26px_8px_rgba(91,146,232,.45)]" /></div>
                  <div className="absolute right-[8%] top-[31%] h-1.5 w-1.5 rounded-full bg-[#d7e6fa]" style={{ animation: 'drift 5s ease-in-out infinite' }} />
                  <div className="absolute left-[17%] top-[51%] h-1.5 w-1.5 rounded-full bg-[#7096c7]" style={{ animation: 'drift 7s ease-in-out infinite reverse' }} />
                  <div className="absolute bottom-[11%] right-[21%] h-40 w-40 rounded-full bg-[#29568f]/10 blur-3xl" />
                </div>
                <div className="relative z-10 mx-auto grid w-full max-w-[1320px] gap-16 px-5 pb-20 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:px-12 lg:pb-28">
                  <div className="max-w-4xl">
                    <div className="reveal mb-7 flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#79aef4]" /><span className="eyebrow">{t.badge}</span></div>
                    <h1 className="reveal delay-1 max-w-4xl text-[clamp(3.4rem,7.6vw,7.8rem)] font-semibold leading-[.94] tracking-[-.075em] text-[#e8edf3]">{t.heroTitle}</h1>
                    <p className="reveal delay-2 mt-8 max-w-xl text-base leading-7 text-[#98a6b6] sm:text-lg">{t.heroBody}</p>
                    <div className="reveal delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button onClick={() => scrollTo('lesson')} className="focus-ring group flex items-center justify-center gap-3 rounded-full bg-[#e8edf3] px-6 py-3.5 text-sm font-bold text-[#090b0e] transition hover:bg-[#a6c9ff]" data-testid="button-hero-watch"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b0e12] text-white"><Play size={10} fill="currentColor" /></span>{t.watch}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button>
                      <button onClick={() => scrollTo('consultation')} className="focus-ring flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm text-[#d2dbe6] transition hover:border-[#77a9e6]/60 hover:bg-white/[.05]" data-testid="button-hero-book">{t.book}<ArrowUpRight size={15} /></button>
                    </div>
                    <div className="reveal delay-3 mt-12 flex items-center gap-5 text-[10px] text-[#6f7c8c]"><span className="flex items-center gap-2 font-code"><ShieldCheck size={13} className="text-[#83abe1]" /> {lang === 'ar' ? 'سرية تامة' : lang === 'fr' ? 'Confidentiel' : 'Confidential by default'}</span><span className="h-3 w-px bg-white/15" /><span>{t.status}</span></div>
                  </div>
                  <div className="relative hidden min-h-[420px] lg:block">
                    <div className="glass absolute right-0 top-6 h-[330px] w-[360px] rotate-[4deg] rounded-[28px] p-5 opacity-70" style={{ animation: 'drift 8s ease-in-out infinite' }}><div className="h-full rounded-2xl border border-white/[.08] bg-[#10151b] p-4"><div className="mb-5 flex items-center justify-between"><span className="font-code text-[9px] text-[#6f7d8c]">SPECTRA / SYSTEM_04</span><span className="h-2 w-2 rounded-full bg-[#74a8ee]" /></div><div className="space-y-3"><div className="h-3 w-2/3 rounded bg-white/10" /><div className="h-2 w-1/2 rounded bg-white/5" /><div className="mt-8 grid grid-cols-2 gap-2"><div className="h-24 rounded-lg border border-white/10 bg-white/[.025]" /><div className="h-24 rounded-lg border border-[#6f9bd4]/30 bg-[#31547f]/10" /></div><div className="mt-3 h-2 w-full rounded bg-white/5" /><div className="h-2 w-4/5 rounded bg-white/5" /></div></div></div>
                    <div className="absolute bottom-0 left-0 h-[235px] w-[280px] rounded-[22px] border border-[#aabed9]/15 bg-[#151a20]/80 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-2 font-code text-[9px] text-[#8494a8]"><Sparkles size={12} className="text-[#81b1f7]" /> LIVE SIGNAL</div><div className="mt-8 flex items-end gap-1.5">{[34,46,40,65,54,78,70,90,82,100].map((h, i) => <span key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#385777] to-[#a9caef]" style={{ height: `${h}%`, opacity: .35 + i * .06 }} />)}</div><div className="mt-5 flex justify-between font-code text-[9px] text-[#687687]"><span>CONVERSION</span><span className="text-[#dbe7f7]">+47.8%</span></div></div>
                  </div>
                </div>
                <button onClick={() => scrollTo('lesson')} className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-code text-[10px] uppercase tracking-[.18em] text-[#687789] md:flex" data-testid="button-scroll-explore"><span className="h-9 w-6 rounded-full border border-white/15 p-1"><span className="block h-2 w-1 rounded-full bg-[#a5c8f5]" /></span>{t.scroll}</button>
              </section>

              <section id="lesson" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
                  <div><span className="eyebrow">{t.lessonKicker}</span><h2 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.04] tracking-[-.055em] text-[#e4eaf2] sm:text-5xl">{t.lessonTitle}</h2><p className="mt-6 max-w-md text-sm leading-7 text-[#8f9cab]">{t.lessonBody}</p><div className="mt-8 space-y-3">{t.lessonPoints.map((point, i) => <div key={point} className="flex gap-3 text-sm text-[#bbc6d3]"><Check size={16} className="mt-0.5 shrink-0 text-[#77aaf0]" />{point}</div>)}</div></div>
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-[28px] border border-[#6c95c3]/15" />
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-[#11161d] shadow-2xl">
                      {!playing ? <button onClick={() => setPlaying(true)} className="group absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_60%_35%,rgba(83,129,182,.3),transparent_36%),linear-gradient(135deg,#141b24,#0b0e13)]" data-testid="button-play-lesson"><div className="absolute inset-0 grid-fade opacity-70" /><div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/[.08] text-white backdrop-blur-md transition group-hover:scale-105 group-hover:bg-[#75a9ed] group-hover:text-[#081018]"><Play size={23} fill="currentColor" /></div><span className="absolute bottom-5 left-5 font-code text-[10px] tracking-widest text-[#aabbd0]">LESSON_01 / 14:22</span><span className="absolute bottom-5 right-5 font-code text-[10px] text-[#7c8b9f]">SPECTRA FIELD NOTES</span></button> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#101821]"><div className="h-1 w-40 overflow-hidden rounded bg-white/10"><div className="h-full w-1/3 rounded bg-[#7db0f4]" style={{ animation: 'scan 2.6s linear infinite' }} /></div><p className="font-code text-[10px] tracking-[.16em] text-[#93acd0]">{lang === 'ar' ? 'الدرس قيد التشغيل' : lang === 'fr' ? 'LEÇON EN COURS' : 'LESSON PLAYING'}</p><button onClick={() => setPlaying(false)} className="text-xs text-[#8291a2] underline underline-offset-4" data-testid="button-pause-lesson">{lang === 'ar' ? 'إيقاف المعاينة' : lang === 'fr' ? 'Mettre en pause' : 'Pause preview'}</button></div>}
                    </div>
                    <button onClick={() => scrollTo('consultation')} className="group mt-6 flex items-center gap-3 text-sm font-semibold text-[#cbd9ec]" data-testid="button-lesson-cta">{t.lessonCta}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button>
                  </div>
                </div>
              </section>

              <section id="capabilities" className="scroll-mt-20 border-y border-white/[.07] bg-[#0b0e12]">
                <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="max-w-2xl"><span className="eyebrow">{t.capabilitiesKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.capabilitiesTitle}</h2><p className="mt-5 text-[#8e9bac]">{t.capabilitiesBody}</p></div><div className="mt-14 grid border-l border-t border-white/10 sm:grid-cols-2">{t.capabilities.map(([number, title, body]) => <article key={number} className="hover-lift min-h-[230px] border-b border-r border-white/10 p-7 sm:p-9"><span className="font-code text-[10px] text-[#7095c1]">{number}</span><h3 className="mt-12 text-xl font-medium text-[#e0e6ee]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#7f8b9a]">{body}</p><ArrowUpRight size={16} className="mt-7 text-[#769dd0]" /></article>)}</div></div>
              </section>

              <section className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="absolute inset-0 grid-fade opacity-35" /><div className="relative mx-auto max-w-[1320px]"><span className="eyebrow">{t.resultsKicker}</span><h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.resultsTitle}</h2><div className="mt-16 grid grid-cols-2 border-y border-white/10 lg:grid-cols-4">{t.results.map(([number, label]) => <div key={label} className="border-b border-white/10 px-3 py-8 last:border-0 sm:px-7 lg:border-b-0 lg:border-r lg:last:border-r-0"><strong className="block text-4xl font-medium tracking-[-.06em] text-[#e8eef6] sm:text-6xl">{number}</strong><span className="mt-3 block font-code text-[10px] uppercase tracking-[.13em] text-[#748092]">{label}</span></div>)}</div></div></section>

              <section id="method" className="scroll-mt-20 border-y border-white/[.07] bg-[#0a0d11]"><div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="eyebrow">{t.methodKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e3eaf2] sm:text-6xl">{t.methodTitle}</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#8794a5]">{t.methodBody}</p></div><div className="relative">{t.steps.map(([number,title,body], i) => <div key={number} className="group relative flex gap-6 border-b border-white/10 py-7 first:pt-0 last:border-0"><div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#668bb9]/50 bg-[#0a0d11] font-code text-[10px] text-[#a9c7ec]">{number}</div><div><h3 className="text-lg text-[#dbe4ee]">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#7e8a9a]">{body}</p></div>{i < t.steps.length - 1 && <span className="absolute left-[18px] top-16 h-full w-px bg-gradient-to-b from-[#668bb8]/50 to-transparent rtl:right-[18px] rtl:left-auto" />}</div>)}</div></div></div></section>

              <section id="work" className="scroll-mt-20 mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><span className="eyebrow">{t.workKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.workTitle}</h2></div><p className="max-w-xs text-sm leading-6 text-[#8491a2]">{t.workBody}</p></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{t.work.map(([name,title,category,metric,metricLabel], i) => <article key={name} className="hover-lift group overflow-hidden rounded-2xl border border-white/10 bg-[#10151b]"><div className={`relative h-64 overflow-hidden border-b border-white/10 ${i === 0 ? 'bg-[radial-gradient(circle_at_64%_42%,rgba(77,152,204,.33),transparent_23%),linear-gradient(135deg,#17212b,#0c1015)]' : i === 1 ? 'bg-[radial-gradient(circle_at_40%_28%,rgba(174,185,197,.26),transparent_22%),linear-gradient(135deg,#282a2c,#101215)]' : 'bg-[radial-gradient(circle_at_68%_56%,rgba(75,113,159,.38),transparent_25%),linear-gradient(135deg,#171d25,#0c1015)]'}`}><div className="absolute inset-6 rounded-xl border border-white/10 bg-black/10 p-4 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105"><div className="flex items-center justify-between font-code text-[8px] text-white/50"><span>{name.toUpperCase()}</span><ArrowUpRight size={13} /></div><div className="mt-10 h-2 w-1/2 rounded bg-white/25" /><div className="mt-3 h-2 w-2/3 rounded bg-white/10" /><div className="mt-7 grid grid-cols-3 gap-2"><div className="h-16 rounded bg-white/[.08]" /><div className="col-span-2 h-16 rounded bg-[#6b9bd0]/20" /></div></div><div className="absolute bottom-4 left-5 font-code text-[9px] text-white/45">CASE / 0{i + 1}</div></div><div className="p-6"><span className="font-code text-[9px] uppercase tracking-widest text-[#718197]">{category}</span><h3 className="mt-3 text-xl text-[#e0e6ee]">{title}</h3><div className="mt-7 flex items-end justify-between"><strong className="text-3xl tracking-[-.05em] text-[#9fc6f5]">{metric}</strong><span className="max-w-[110px] text-right text-[10px] leading-4 text-[#778596]">{metricLabel}</span></div></div></article>)}</div></section>

              <section className="border-y border-white/[.07] bg-[#0b0e12]"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end lg:px-12 lg:py-32"><div><span className="eyebrow">{t.proofKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.proofTitle}</h2></div><div className="border-l border-[#7197c5]/40 pl-6 sm:pl-10"><div className="mb-6 flex gap-1 text-[#b9d5f7]">{[1,2,3,4,5].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />)}</div><blockquote className="max-w-2xl text-2xl leading-[1.35] tracking-[-.03em] text-[#dbe3ec] sm:text-3xl">“{t.quote}”</blockquote><p className="mt-7 font-code text-[10px] uppercase tracking-widest text-[#7c8b9d]">{t.quoteBy}</p></div></div></section>

              <section id="consultation" className="scroll-mt-20 mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="eyebrow">{t.formKicker}</span><h2 className="mt-5 max-w-md text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.formTitle}</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#8996a7]">{t.formBody}</p><div className="mt-10 flex items-center gap-3 text-xs text-[#8090a4]"><Clock3 size={16} className="text-[#78a8e7]" /> 30 min / complimentary / private</div></div><form onSubmit={submitForm} className="glass rounded-2xl p-5 sm:p-8">{sent ? <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#79aaf0]/50 bg-[#4777af]/15 text-[#a9d0ff]"><Check size={25} /></div><h3 className="mt-6 text-2xl text-[#e4ecf6]">{t.formSuccess}</h3><button type="button" onClick={() => { setSent(false); scrollTo('schedule'); }} className="mt-8 flex items-center gap-2 text-sm text-[#9cc6fb]" data-testid="button-after-submit">{t.scheduleTitle}<ArrowRight size={15} /></button></div> : <><div className="grid gap-5 sm:grid-cols-2"><Field label={t.formFields[0]} id="name" /><Field label={t.formFields[1]} id="company" /><Field label={t.formFields[2]} id="email" type="email" /><Field label={t.formFields[3]} id="phone" /><label className="sm:col-span-2"><span className="mb-2 block text-[11px] text-[#9aa8b8]">{t.formFields[4]}</span><textarea required rows={3} className="focus-ring w-full resize-none rounded-lg border border-white/10 bg-white/[.03] px-3 py-3 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]" data-testid="input-project" /></label></div><div className="mt-7"><span className="mb-3 block text-[11px] text-[#9aa8b8]">{lang === 'ar' ? 'الخدمات التي تهمك' : lang === 'fr' ? 'Services concernés' : 'Services you may need'}</span><div className="flex flex-wrap gap-2">{t.services.map(service => <label key={service} className="cursor-pointer"><input type="checkbox" className="peer sr-only" data-testid={`checkbox-service-${service}`} /><span className="block rounded-full border border-white/10 px-3 py-2 text-xs text-[#8996a8] transition peer-checked:border-[#76a9ee] peer-checked:bg-[#31527b]/30 peer-checked:text-[#d8e8fc]">{service}</span></label>)}</div></div><div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center"><span className="flex items-center gap-2 text-[10px] text-[#687688]"><ShieldCheck size={13} className="text-[#78a8e7]" /> {lang === 'ar' ? 'لن نشارك بياناتك' : lang === 'fr' ? 'Vos données restent privées' : 'Your details stay private'}</span><button type="submit" className="group flex items-center justify-center gap-3 rounded-full bg-[#e7edf4] px-5 py-3 text-sm font-bold text-[#080a0d] transition hover:bg-[#a9cbfb]" data-testid="button-submit-consultation">{t.formButton}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div></>}</form></div></section>

              <section id="schedule" className="scroll-mt-20 border-y border-white/[.07] bg-[#0b0e12]"><div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="eyebrow">{t.scheduleKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.scheduleTitle}</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#8996a7]">{t.scheduleBody}</p></div><div className="glass rounded-2xl p-5 sm:p-8">{confirmed ? <div className="flex min-h-[275px] flex-col items-center justify-center text-center"><CalendarDays className="text-[#83b5f5]" size={30} /><h3 className="mt-5 text-2xl text-[#e4ecf6]">{t.confirmed}</h3><p className="mt-2 text-sm text-[#8795a6]">{dayLabels[selectedDay]} · {selectedTime} · GMT+1</p><button onClick={() => setConfirmed(false)} className="mt-6 text-xs text-[#91baf0] underline underline-offset-4" data-testid="button-edit-time">Edit time</button></div> : <><div className="flex items-center justify-between"><span className="font-code text-[10px] uppercase tracking-widest text-[#8290a2]">April 2025</span><span className="flex items-center gap-2 text-[10px] text-[#647386]"><Globe2 size={13} /> GMT+1 / Paris</span></div><div className="mt-6 grid grid-cols-4 gap-2">{dayLabels.map((day, i) => <button key={day} onClick={() => setSelectedDay(i)} className={`rounded-lg border px-2 py-3 text-xs transition ${selectedDay === i ? 'border-[#7aacee] bg-[#31527b]/30 text-[#dceafe]' : 'border-white/10 text-[#8795a7] hover:border-white/25'}`} data-testid={`button-day-${i}`}>{day}</button>)}</div><div className="mt-6 flex flex-wrap gap-2">{['09:00','10:30','13:00','15:30','17:00'].map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`rounded-lg border px-4 py-2.5 font-code text-[11px] transition ${selectedTime === time ? 'border-[#7aacee] bg-[#31527b]/30 text-[#dceafe]' : 'border-white/10 text-[#8795a7] hover:border-white/25'}`} data-testid={`button-time-${time}`}>{time}</button>)}</div><button onClick={() => setConfirmed(true)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#e7edf4] py-3 text-sm font-bold text-[#080a0d] transition hover:bg-[#aacbfa]" data-testid="button-confirm-time">{t.scheduleConfirm}<ArrowRight size={15} /></button></>}</div></div></div></section>

              <section id="faq" className="scroll-mt-20 mx-auto max-w-[1000px] px-5 py-24 sm:px-8 lg:py-36"><div className="text-center"><span className="eyebrow">{t.faqKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.faqTitle}</h2></div><div className="mt-14 border-t border-white/10">{t.faqs.map(([question, answer], i) => <div key={question} className="border-b border-white/10"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-5 py-6 text-start text-base text-[#d9e1eb]" aria-expanded={openFaq === i} data-testid={`button-faq-${i}`}><span>{question}</span><ChevronDown size={18} className={`shrink-0 text-[#7c9ec7] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} /></button>{openFaq === i && <p className="max-w-2xl pb-7 text-sm leading-7 text-[#8491a2]">{answer}</p>}</div>)}</div></section>

              <section className="relative overflow-hidden border-t border-white/[.07] bg-[#0b0f14]"><div className="absolute inset-0 grid-fade opacity-50" /><div className="relative mx-auto flex max-w-[1320px] flex-col justify-between gap-10 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-32"><div><span className="eyebrow">SPECTRA / 2025</span><h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.07em] text-[#e7edf4] sm:text-7xl">{t.finalTitle}</h2></div><button onClick={() => scrollTo('consultation')} className="group flex w-fit items-center gap-3 rounded-full bg-[#e7edf4] px-6 py-3.5 text-sm font-bold text-[#080a0d] transition hover:bg-[#a9cbfb]" data-testid="button-final-cta">{t.finalCta}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button></div></section>
            </main>

            <footer className="border-t border-white/[.07]"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-12"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 overflow-hidden rounded-full border border-white/20"><img src="/assets/spectra-logo.jpeg" alt="Spectra" className="h-full w-full object-cover" /></span><span className="font-code text-xs tracking-[.28em] text-[#e7ebf0]">SPECTRA</span></div><p className="mt-6 max-w-xs text-xs leading-6 text-[#718091]">Digital products and systems for businesses with somewhere serious to go.</p></div><FooterCol title={lang === 'ar' ? 'استكشف' : lang === 'fr' ? 'Explorer' : 'Explore'} items={t.nav} onSelect={(i) => scrollTo(['capabilities','method','work','faq'][i])} /><FooterCol title={lang === 'ar' ? 'تواصل' : lang === 'fr' ? 'Contact' : 'Contact'} items={['hello@spectra.agency', 'London / Paris / Remote', 'LinkedIn', 'Instagram']} onSelect={() => {}} /><div><span className="eyebrow">STATUS</span><p className="mt-4 flex items-center gap-2 text-xs text-[#98a7b8]"><span className="h-1.5 w-1.5 rounded-full bg-[#7ab0fa]" /> {t.status}</p></div></div><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 border-t border-white/10 px-5 py-6 text-[10px] text-[#5e6b7c] sm:flex-row sm:px-8 lg:px-12"><span>© 2025 Spectra Agency. All rights reserved.</span><span>Privacy / Terms / Built with intent</span></div></footer>

            <button onClick={() => scrollTo('consultation')} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-[#82afea]/40 bg-[#152338]/90 px-4 py-3 text-xs font-semibold text-[#dbeaff] shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-[#203b60] sm:right-8" data-testid="button-floating-cta"><CalendarDays size={15} /> {t.book}</button>
            {exitOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Special invitation"><div className="glass relative max-w-md rounded-2xl p-7 sm:p-9"><button onClick={() => setExitOpen(false)} className="absolute right-4 top-4 text-[#8290a1]" aria-label="Close" data-testid="button-close-exit"><X size={18} /></button><span className="eyebrow">A considered next step</span><h2 className="mt-5 text-3xl font-semibold tracking-[-.05em] text-[#e7edf4]">Before you go — take the scorecard with you.</h2><p className="mt-4 text-sm leading-6 text-[#8997a8]">Book a private 30-minute conversation and we’ll map the highest-leverage opportunity in your current digital experience.</p><button onClick={() => { setExitOpen(false); scrollTo('consultation'); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#e7edf4] py-3 text-sm font-bold text-[#080a0d]" data-testid="button-exit-cta">{t.book}<ArrowRight size={15} /></button></div></div>}
          </div>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Field({ label, id, type = 'text' }: { label: string; id: string; type?: string }) {
  return <label><span className="mb-2 block text-[11px] text-[#9aa8b8]">{label}</span><input required={id !== 'phone'} id={id} name={id} type={type} className="focus-ring w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-3 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]" data-testid={`input-${id}`} /></label>;
}

function FooterCol({ title, items, onSelect }: { title: string; items: readonly string[]; onSelect: (index: number) => void }) {
  return <div><span className="eyebrow">{title}</span><div className="mt-4 flex flex-col gap-3">{items.map((item, i) => <button key={item} onClick={() => onSelect(i)} className="w-fit text-start text-xs text-[#8491a2] transition hover:text-[#dce7f4]" data-testid={`link-footer-${i}`}>{item}</button>)}</div></div>;
}

export default App;