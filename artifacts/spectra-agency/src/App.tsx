import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { AdminAvailability, AdminBookings, AdminLeads, AdminOverview, AdminPortfolio, AdminTestimonials, AdminVideo } from '@/pages/admin';
import { AdminLangProvider, type AdminLang } from '@/pages/admin-i18n';
import { ProtectedVideoPlayer } from '@/components/ProtectedVideoPlayer';
import { AccordionGallery } from '@/components/AccordionGallery';
import { setAuthTokenGetter, useGetPublicConfig } from '@workspace/api-client-react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Calendar, CalendarDays, Check, ChevronDown,
  Clock3, ExternalLink, Globe2, Lock, Menu, MessageSquareQuote, Play, RefreshCw, ShieldCheck, Sparkles, User, Video, Volume2, VolumeX, X, Zap,
} from 'lucide-react';

const queryClient = new QueryClient();

if (typeof window !== 'undefined') {
  setAuthTokenGetter(() => localStorage.getItem('spectra_admin_token'));
}

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
    formFields: ['Your name', 'Company', 'Work email', 'Phone number *', 'What are you looking to build?'],
    formButton: 'Request my consultation',
    formSuccess: 'Your note is with the team. We’ll be in touch within one business day.',
    services: ['Website', 'Mobile app', 'CRM / ERP', 'Automation', 'AI system', 'Brand / growth'],
    showcaseKicker: 'Selected Deployments',
    showcaseTitle: 'Websites & digital systems we engineered.',
    showcaseBody: 'Interactive scrollable previews of live client digital platforms built with precision by Spectra.',
    showcaseModalTitle: 'Consultation Required',
    showcaseModalBody: 'To access live client deployments and full interactive case studies, please complete our quick consultation form first.',
    showcaseModalBtn: 'Complete Consultation Form',
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
    formKicker: 'Faire le prochain pas', formTitle: 'Parlons de ce que vous construisez.', formBody: 'Dites-nous assez pour commencer une conversation utile. Réponse sous un jour ouvré.', formFields: ['Votre nom', 'Entreprise', 'Email professionnel', 'Numéro de téléphone *', 'Que souhaitez-vous construire ?'], formButton: 'Demander ma consultation', formSuccess: 'Votre message est bien arrivé. Nous revenons vers vous sous un jour ouvré.', services: ['Site web', 'Application mobile', 'CRM / ERP', 'Automatisation', 'Système IA', 'Marque / croissance'],
    showcaseKicker: 'Déploiements Récents',
    showcaseTitle: 'Sites et plateformes conçus par Spectra.',
    showcaseBody: 'Aperçus interactifs déroulants des produits numériques déployés avec précision pour nos clients.',
    showcaseModalTitle: 'Consultation Requise',
    showcaseModalBody: 'Pour accéder à nos déploiements interactifs en direct et aux études de cas, veuillez d’abord remplir notre formulaire de consultation.',
    showcaseModalBtn: 'Remplir le formulaire',
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
    formKicker: 'اتخذ الخطوة التالية', formTitle: 'لنتحدث عن الشيء الذي تبنيه.', formBody: 'أخبرنا بما يكفي لبدء محادثة مفيدة. نرد خلال يوم عمل واحد.', formFields: ['اسمك', 'الشركة', 'البريد الإلكتروني للعمل', 'رقم الهاتف *', 'ماذا تريد أن تبني؟'], formButton: 'اطلب استشارتي', formSuccess: 'وصلت رسالتك إلى الفريق. سنتواصل معك خلال يوم عمل.', services: ['موقع إلكتروني', 'تطبيق جوال', 'CRM / ERP', 'أتمتة', 'نظام ذكاء اصطناعي', 'علامة / نمو'],
    showcaseKicker: 'أعمالنا ومنصاتنا',
    showcaseTitle: 'مواقع وأنظمة رقمية تم بناؤها بواسطة Spectra.',
    showcaseBody: 'معاينة تفاعلية قابلة للتمرير للمواقع والمنصات الرقمية التي قمنا بتطويرها لعملائنا.',
    showcaseModalTitle: 'استمارة الاستشارة مطلوبة',
    showcaseModalBody: 'للوصول إلى الأنظمة التفاعلية المباشرة ومشاريع عملائنا، يُرجى ملء استمارة الاستشارة أولاً.',
    showcaseModalBtn: 'الانتقال إلى استمارة الاستشارة',
    scheduleKicker: 'اختر خطوتك التالية', scheduleTitle: 'اعثر على الوقت المناسب.', scheduleBody: 'محادثة مركزة لمدة 30 دقيقة. بلا ضغط.', scheduleConfirm: 'تأكيد هذا الوقت', confirmed: 'تم حجزك في التقويم.',
    faqKicker: 'إجابات واضحة', faqTitle: 'قبل أن نلتقي', faqs: [['كيف تبدأ المهمة الأولى؟', 'نبدأ بمحادثة اكتشاف مركزة، ثم sprint استراتيجي مدفوع عندما تحتاج المشكلة إلى تعريف أعمق.'], ['ما نطاق الاستثمار؟', 'تبدأ معظم المشاريع بين 18 ألفاً و65 ألف يورو، حسب النطاق وعمق النظام.'], ['كم يستغرق المشروع؟', 'يمكن أن يستغرق الإطلاق المركز من 6 إلى 10 أسابيع. الأنظمة الأكبر تطلق على مراحل مرئية.'], ['هل تدعمون ما تبنونه؟', 'نعم. كل تسليم يتضمن التوثيق وطريقاً واضحاً للرعاية والتحسين.'], ['من يملك المنتج النهائي؟', 'أنتم. الكود وملفات التصميم والحسابات ملككم منذ اليوم الأول.']], finalTitle: 'فصلك القادم يحتاج إلى نظام أفضل.', finalCta: 'احجز جلسة الاستراتيجية المجانية',
  },
} as const;

function PublicHome() {
  const [lang, setLang] = useState<Lang>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [exitOpen, setExitOpen] = useState(false);
  const publicConfig = useGetPublicConfig();
  const t = copy[lang] as Copy;
  const isRtl = lang === 'ar';

  // Testimonials state from API
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Portfolio showcase state
  const [portfolioWebsites, setPortfolioWebsites] = useState<any[]>([]);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('spectra_lead_submitted') === 'true';
  });
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [selectedWebsiteTitle, setSelectedWebsiteTitle] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  // Merged Consultation & Calendar state
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('10:30');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Website']);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState<{ name: string; email: string; slot: string; company: string } | null>(null);

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

  useEffect(() => {
    fetch('/api/public/testimonials')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch(() => {});

    fetch('/api/public/portfolio')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setPortfolioWebsites(data);
        }
      })
      .catch(() => {});
  }, []);

  const availableDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const current = new Date(now);
    current.setDate(current.getDate() + 1);

    while (days.length < 6) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const isoDate = current.toISOString().slice(0, 10);
        const dayName = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short' }).format(current);
        const dayNumber = current.getDate();
        const monthName = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short' }).format(current);
        days.push({
          isoDate,
          label: `${dayName} ${dayNumber} ${monthName}`,
          dayName,
          dayNumber,
          monthName,
          dateObj: new Date(current),
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [lang]);

  const availableSlots = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const target = id === 'schedule' ? 'consultation' : id;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWebsiteClick = (url: string, title: string) => {
    if (isLeadSubmitted) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedWebsiteTitle(title);
      setGateModalOpen(true);
    }
  };

  const showcaseItems = useMemo(() => {
    const list =
      portfolioWebsites.length > 0
        ? portfolioWebsites
        : [
            {
              id: 1,
              title: 'The Results Academy',
              url: 'https://theresults-academy.com/',
              category: 'E-Learning Platform',
              description: 'Interactive modern educational portal and digital curriculum system.',
            },
            {
              id: 2,
              title: 'The Bequer',
              url: 'https://thebequer.tech/',
              category: 'Cosmetics & Tech',
              description: 'Luxury e-commerce and branded cosmetic retail experience.',
            },
            {
              id: 3,
              title: 'FYN Beauty',
              url: 'https://fynbeauty.shop/',
              category: 'Cosmetics Store',
              description: 'High-converting boutique beauty showcase and checkout flow.',
            },
            {
              id: 4,
              title: 'Astra Health Platform',
              url: 'https://astrahealth.io',
              category: 'Healthcare Platform',
              description: 'Patient access infrastructure, HIPAA-compliant flows and booking system.',
            },
            {
              id: 5,
              title: 'Nadir Finance Architecture',
              url: 'https://nadir.finance',
              category: 'Fintech Platform',
              description: 'Enterprise treasury interface and complex capital liquidity engine.',
            },
          ];

    return list.map((site: any) => {
      const snapshotUrl =
        site.imageUrl ||
        `https://api.microlink.io/?url=${encodeURIComponent(site.url)}&screenshot=true&embed=screenshot.url`;
      return {
        image: snapshotUrl,
        label: site.title,
        category: site.category || 'Digital System',
        link: '#',
        alt: site.title,
        isLocked: !isLeadSubmitted,
        actionLabel: isLeadSubmitted
          ? lang === 'ar'
            ? 'فتح الموقع المباشر ↗'
            : lang === 'fr'
            ? 'Ouvrir le site ↗'
            : 'Open Live Site ↗'
          : lang === 'ar'
          ? 'معاينة المشروع 🔒'
          : lang === 'fr'
          ? 'Accéder au projet 🔒'
          : 'Preview Project 🔒',
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          handleWebsiteClick(site.url, site.title);
        },
      };
    });
  }, [portfolioWebsites, isLeadSubmitted, lang]);

  const handleMergedSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientName.trim() || !companyName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      if (!clientPhone.trim()) setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setSubmittingBooking(true);
    try {
      // 1. Create Lead
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          company: companyName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim(),
          projectDescription: projectDescription.trim() || 'Strategic consultation request',
          interestedServices: selectedServices,
        }),
      });
      if (!leadRes.ok) {
        const err = await leadRes.json().catch(() => ({}));
        throw new Error(err.error || 'Lead registration failed');
      }
      const lead = await leadRes.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem('spectra_lead_submitted', 'true');
      }
      setIsLeadSubmitted(true);

      // 2. Book Slot if selected
      const currentDay = availableDays[selectedDayIndex];
      let slotLabel = '';
      if (currentDay && selectedSlotTime) {
        const startsAt = new Date(`${currentDay.isoDate}T${selectedSlotTime}:00.000Z`);
        const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
        slotLabel = `${currentDay.label} · ${selectedSlotTime} · GMT+1 (${lang === 'ar' ? 'تلمسان' : 'Tlemcen'})`;

        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadId: lead.id,
              startsAt: startsAt.toISOString(),
              endsAt: endsAt.toISOString(),
              timezone: 'Africa/Algiers',
            }),
          });
        } catch (bookingErr) {
          console.warn('Booking slot creation error, lead preserved:', bookingErr);
        }
      }

      setConfirmedDetails({
        name: clientName,
        email: clientEmail,
        company: companyName,
        slot: slotLabel || `${currentDay?.label || 'Upcoming week'} · 30 min`,
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Could not complete booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey={lang}>
          <div className="spectra-page noise" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[.07] bg-[#080a0d]/80 backdrop-blur-xl">
              <div className="mx-auto flex h-[70px] sm:h-[72px] max-w-[1320px] items-center justify-between px-4 sm:px-8 lg:px-12">
                <button onClick={() => scrollTo('top')} className="focus-ring flex items-center gap-2.5 sm:gap-3" aria-label="Spectra home" data-testid="button-home">
                  <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-white/20 bg-[#11151a]">
                    <img src="/assets/spectra-logo.jpeg" alt="Spectra" className="h-full w-full object-cover" />
                  </span>
                  <span className="font-code text-[11px] sm:text-[12px] font-medium tracking-[.28em] text-[#e7ebf0]">SPECTRA</span>
                </button>
                <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
                  {t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(['capabilities','method','work','faq'][index])} className="focus-ring text-[12px] text-[#8e9aaa] transition-colors hover:text-white" data-testid={`link-nav-${index}`}>{item}</button>)}
                </nav>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.03] p-1 sm:flex" aria-label="Language selector">
                    {(['en','fr','ar'] as Lang[]).map((item) => <button key={item} onClick={() => setLang(item)} className={`focus-ring rounded-full px-2.5 py-1 font-code text-[10px] uppercase transition ${lang === item ? 'bg-white text-[#080a0d]' : 'text-[#8290a2] hover:text-white'}`} data-testid={`button-language-${item}`}>{item}</button>)}
                  </div>
                  <button onClick={() => scrollTo('consultation')} className="hidden rounded-full bg-[#e7ebf0] px-4 py-2.5 text-[11px] font-bold text-[#080a0d] transition hover:bg-[#9fc5ff] sm:block" data-testid="button-header-cta">{t.book}</button>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#d6dde8] lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
                </div>
              </div>
              {menuOpen && (
                <div className="border-t border-white/10 bg-[#0b0e12]/95 backdrop-blur-2xl px-5 py-6 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mx-auto flex max-w-[1320px] flex-col gap-4">
                    {t.nav.map((item, index) => (
                      <button
                        key={item}
                        onClick={() => {
                          setMenuOpen(false);
                          scrollTo(['capabilities','method','work','faq'][index]);
                        }}
                        className="text-start py-2 text-base font-medium text-[#c4cfdc] transition hover:text-white active:text-[#7ba9e8]"
                        data-testid={`link-mobile-nav-${index}`}
                      >
                        {item}
                      </button>
                    ))}
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-code text-[10px] uppercase tracking-wider text-[#738294]">Language</span>
                      <div className="flex items-center gap-2">
                        {(['en','fr','ar'] as Lang[]).map(item => (
                          <button
                            key={item}
                            onClick={() => setLang(item)}
                            className={`rounded-full border px-3.5 py-1.5 font-code text-[11px] uppercase transition ${lang === item ? 'border-white bg-white font-semibold text-black' : 'border-white/15 text-[#9ba8b7] hover:border-white/30'}`}
                            data-testid={`button-mobile-language-${item}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        scrollTo('consultation');
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#e7ebf0] px-4 py-3.5 text-xs font-bold text-[#080a0d] shadow-lg active:scale-[0.98] transition"
                      data-testid="button-mobile-cta"
                    >
                      <CalendarDays size={15} />
                      {t.book}
                    </button>
                    <a
                      href="/admin/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#6d7f95] hover:text-[#bcd3ee] transition"
                    >
                      <Lock size={12} /> Studio Operating Room (Admin)
                    </a>
                  </div>
                </div>
              )}
            </header>

            <main id="top">
              <section id="lesson" className="relative flex min-h-[auto] lg:min-h-[860px] flex-col items-center overflow-hidden border-b border-white/[.07] pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-28">
                <div className="grid-fade absolute inset-0 opacity-60" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute left-[15%] top-[18%] h-px w-[70%] bg-gradient-to-r from-transparent via-[#6689b6]/40 to-transparent" style={{ animation: 'pulse-line 4s ease-in-out infinite' }} />
                  <div className="absolute left-[70%] top-[2%] h-[480px] w-[480px] rounded-full border border-[#526d8f]/15" style={{ animation: 'rotate-slow 40s linear infinite' }}>
                    <div className="absolute left-0 top-1/2 h-2 w-2 rounded-full bg-[#79aef4] shadow-[0_0_26px_8px_rgba(91,146,232,.45)]" />
                  </div>
                  <div className="absolute right-[10%] top-[26%] h-1.5 w-1.5 rounded-full bg-[#d7e6fa]" style={{ animation: 'drift 5s ease-in-out infinite' }} />
                  <div className="absolute left-[12%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#7096c7]" style={{ animation: 'drift 7s ease-in-out infinite reverse' }} />
                  <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-80 w-[720px] rounded-full bg-[#29568f]/15 blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 sm:px-8 lg:px-12 text-center">
                  <div className="reveal mb-5 sm:mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[.03] px-3.5 sm:px-4 py-1.5 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#79aef4] shadow-[0_0_12px_2px_rgba(121,174,244,.7)] animate-pulse" />
                    <span className="eyebrow text-[10px] sm:text-xs">{t.lessonKicker}</span>
                  </div>

                  <h1 className="reveal delay-1 max-w-4xl text-center text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.08] sm:leading-[1.03] tracking-[-.05em] text-[#e8edf3] break-words">
                    {t.lessonTitle}
                  </h1>

                  <p className="reveal delay-2 mt-5 sm:mt-6 max-w-2xl text-center text-sm leading-6 text-[#98a6b6] sm:text-lg sm:leading-7">
                    {t.lessonBody}
                  </p>

                  {/* Free Video Lesson Player */}
                  <div className="reveal delay-3 relative mt-8 sm:mt-10 w-full max-w-4xl">
                    <div className="absolute -inset-2 sm:-inset-3.5 rounded-[22px] sm:rounded-[32px] border border-[#6c95c3]/25 bg-gradient-to-b from-[#6c95c3]/15 to-transparent blur-[1px]" />
                    <div className="relative aspect-video overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 bg-[#11161d] shadow-[0_25px_80px_rgba(0,0,0,.75)]">
                      {!playing ? (
                        <button
                          onClick={() => setPlaying(true)}
                          className="group absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_60%_35%,rgba(83,129,182,.3),transparent_36%),linear-gradient(135deg,#141b24,#0b0e13)] cursor-pointer"
                          data-testid="button-play-lesson"
                        >
                          <div className="absolute inset-0 grid-fade opacity-70" />
                          <div className="relative flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-white/30 bg-white/[.08] text-white backdrop-blur-md shadow-[0_0_40px_rgba(121,174,244,.3)] transition duration-300 group-hover:scale-105 group-hover:bg-[#75a9ed] group-hover:text-[#081018]">
                            <Play size={22} fill="currentColor" className="translate-x-0.5 sm:scale-110" />
                          </div>
                          <span className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 font-code text-[9px] sm:text-[10px] tracking-widest text-[#aabbd0]">
                            {publicConfig?.data?.video?.title ? publicConfig.data.video.title.toUpperCase() : 'LESSON_01'}
                          </span>
                          <span className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 font-code text-[9px] sm:text-[10px] text-[#7c8b9f]">
                            SPECTRA FIELD NOTES
                          </span>
                        </button>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b10]">
                          {publicConfig?.data?.video?.url ? (
                            <ProtectedVideoPlayer
                              url={publicConfig.data.video.url}
                              title={publicConfig.data.video.title || 'SPECTRA FIELD NOTES'}
                              onClose={() => setPlaying(false)}
                              lang={lang}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="h-1 w-48 overflow-hidden rounded bg-white/10">
                                <div className="h-full w-1/3 rounded bg-[#7db0f4]" style={{ animation: 'scan 2.6s linear infinite' }} />
                              </div>
                              <p className="font-code text-[11px] tracking-[.18em] text-[#93acd0]">
                                {lang === 'ar' ? 'الدرس قيد التشغيل' : lang === 'fr' ? 'LEÇON EN COURS' : 'LESSON PLAYING'}
                              </p>
                              <button
                                onClick={() => setPlaying(false)}
                                className="text-xs text-[#8291a2] underline underline-offset-4 cursor-pointer hover:text-white"
                                data-testid="button-pause-lesson"
                              >
                                {lang === 'ar' ? 'إيقاف المعاينة' : lang === 'fr' ? 'Mettre en pause' : 'Pause preview'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Takeaways Grid */}
                  <div className="reveal delay-3 mt-6 sm:mt-8 grid w-full max-w-4xl gap-2.5 sm:gap-3 sm:grid-cols-2 text-start">
                    {t.lessonPoints.map((point) => (
                      <div key={point} className="glass flex items-start gap-3 rounded-xl p-3 sm:p-3.5 text-xs text-[#bbc6d3]">
                        <Check size={16} className="mt-0.5 shrink-0 text-[#77aaf0]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Primary Funnel CTAs */}
                  <div className="reveal delay-3 mt-8 sm:mt-10 flex w-full max-w-md flex-col sm:max-w-none sm:w-auto sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    <button
                      onClick={() => scrollTo('consultation')}
                      className="focus-ring group flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-[#e8edf3] px-7 py-3 text-sm font-bold text-[#090b0e] transition hover:bg-[#a6c9ff] active:scale-[0.98] cursor-pointer"
                      data-testid="button-hero-book"
                    >
                      {t.book}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => scrollTo('capabilities')}
                      className="focus-ring flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-[#d2dbe6] transition hover:border-[#77a9e6]/60 hover:bg-white/[.05] active:scale-[0.98] cursor-pointer"
                      data-testid="button-hero-watch"
                    >
                      <span>{t.nav[0]}</span>
                      <ArrowDownRight size={16} />
                    </button>
                  </div>

                  {/* Trust Signals & Availability */}
                  <div className="reveal delay-3 mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-[#6f7c8c]">
                    <span className="flex items-center gap-1.5 font-code">
                      <ShieldCheck size={14} className="text-[#83abe1]" />
                      {lang === 'ar' ? 'سرية تامة' : lang === 'fr' ? 'Confidentiel' : 'Confidential by default'}
                    </span>
                    <span className="h-3 w-px bg-white/15" />
                    <span className="flex items-center gap-1.5 font-code">
                      <Clock3 size={14} className="text-[#83abe1]" />
                      {lang === 'ar' ? '14 دقيقة' : lang === 'fr' ? '14 minutes' : '14 minutes'}
                    </span>
                    <span className="h-3 w-px bg-white/15" />
                    <span>{t.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => scrollTo('capabilities')}
                  className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-code text-[10px] uppercase tracking-[.18em] text-[#687789] md:flex cursor-pointer hover:text-white transition-colors"
                  data-testid="button-scroll-explore"
                >
                  <span className="h-9 w-6 rounded-full border border-white/15 p-1 flex justify-center">
                    <span className="block h-2 w-1 rounded-full bg-[#a5c8f5] animate-bounce" />
                  </span>
                  {t.scroll}
                </button>
              </section>

              <section id="capabilities" className="scroll-mt-20 border-y border-white/[.07] bg-[#0b0e12]">
                <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="max-w-2xl"><span className="eyebrow">{t.capabilitiesKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.capabilitiesTitle}</h2><p className="mt-5 text-[#8e9bac]">{t.capabilitiesBody}</p></div><div className="mt-14 grid border-l border-t border-white/10 sm:grid-cols-2">{t.capabilities.map(([number, title, body]) => <article key={number} className="hover-lift min-h-[230px] border-b border-r border-white/10 p-7 sm:p-9"><span className="font-code text-[10px] text-[#7095c1]">{number}</span><h3 className="mt-12 text-xl font-medium text-[#e0e6ee]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#7f8b9a]">{body}</p><ArrowUpRight size={16} className="mt-7 text-[#769dd0]" /></article>)}</div></div>
              </section>

              <section className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="absolute inset-0 grid-fade opacity-35" /><div className="relative mx-auto max-w-[1320px]"><span className="eyebrow">{t.resultsKicker}</span><h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.resultsTitle}</h2><div className="mt-16 grid grid-cols-2 border-y border-white/10 lg:grid-cols-4">{t.results.map(([number, label]) => <div key={label} className="border-b border-white/10 px-3 py-8 last:border-0 sm:px-7 lg:border-b-0 lg:border-r lg:last:border-r-0"><strong className="block text-4xl font-medium tracking-[-.06em] text-[#e8eef6] sm:text-6xl">{number}</strong><span className="mt-3 block font-code text-[10px] uppercase tracking-[.13em] text-[#748092]">{label}</span></div>)}</div></div></section>

              <section id="method" className="scroll-mt-20 border-y border-white/[.07] bg-[#0a0d11]"><div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="eyebrow">{t.methodKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e3eaf2] sm:text-6xl">{t.methodTitle}</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#8794a5]">{t.methodBody}</p></div><div className="relative">{t.steps.map(([number,title,body], i) => <div key={number} className="group relative flex gap-6 border-b border-white/10 py-7 first:pt-0 last:border-0"><div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#668bb9]/50 bg-[#0a0d11] font-code text-[10px] text-[#a9c7ec]">{number}</div><div><h3 className="text-lg text-[#dbe4ee]">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#7e8a9a]">{body}</p></div>{i < t.steps.length - 1 && <span className="absolute left-[18px] top-16 h-full w-px bg-gradient-to-b from-[#668bb8]/50 to-transparent rtl:right-[18px] rtl:left-auto" />}</div>)}</div></div></div></section>

              {/* Client Feedback Videos (Only rendered if admin uploaded testimonials) */}
              {testimonials && testimonials.length > 0 && (
                <section id="work" className="scroll-mt-20 mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                      <span className="eyebrow">{lang === 'ar' ? 'أعمال مختارة وآراء العملاء' : lang === 'fr' ? 'Projets choisis & retours clients' : 'Selected work & client feedback'}</span>
                      <h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">
                        {lang === 'ar' ? 'تجارب عملاء ونتائج موثقة.' : lang === 'fr' ? 'Retours d’expérience & résultats vérifiés.' : 'Real results, verified by client feedback.'}
                      </h2>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-[#8491a2]">
                      {lang === 'ar' ? 'شاهد آراء عملائنا بالفيديو والنتائج التي تحققت مع استوديو Spectra.' : lang === 'fr' ? 'Découvrez en vidéo les retours de nos clients sur la vélocité et le levier digital créés par Spectra.' : 'Client feedback videos showcasing the measurable velocity, craft, and commercial leverage Spectra creates.'}
                    </p>
                  </div>
                  <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {testimonials.map((item) => (
                      <article key={item.id} className="hover-lift group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#10151b] shadow-2xl transition duration-300">
                        <div>
                          <div className="relative aspect-video w-full overflow-hidden border-b border-white/10 bg-black">
                            <ProtectedVideoPlayer
                              url={item.videoUrl}
                              title={`${item.clientName} · ${item.company}`}
                              lang={lang}
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-code text-[9px] uppercase tracking-widest text-[#718197]">
                                {item.company}
                              </span>
                              {item.metric && (
                                <div className="flex items-center gap-1.5 rounded-full border border-[#72a3e6]/30 bg-[#294c79]/20 px-2.5 py-0.5 font-code text-[11px] text-[#9fc6f5]">
                                  <strong>{item.metric}</strong>
                                  <span className="text-[9px] text-[#7d90a7]">{item.metricLabel}</span>
                                </div>
                              )}
                            </div>
                            <blockquote className="mt-4 text-sm leading-6 text-[#d2dde9] italic">
                              “{item.quote}”
                            </blockquote>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/[.07] bg-white/[.015] px-6 py-4">
                          <div>
                            <strong className="block text-xs font-semibold text-[#e1eaf3]">
                              {item.clientName}
                            </strong>
                            <small className="block text-[10px] text-[#768598]">
                              {item.clientRole ? `${item.clientRole} · ` : ''}{item.company}
                            </small>
                          </div>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-[#86b5f4]">
                            <Play size={11} fill="currentColor" />
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Showcase Websites (Interactive Accordion Gallery & Lead-Gating) */}
              <section id="showcase" className="scroll-mt-20 mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10">
                  <div>
                    <span className="eyebrow">{t.showcaseKicker}</span>
                    <h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">
                      {t.showcaseTitle}
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#8491a2]">
                    {t.showcaseBody}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#090d13]/85 p-3 sm:p-6 shadow-2xl backdrop-blur-xl">
                  <AccordionGallery
                    items={showcaseItems}
                    defaultIndex={Math.min(1, Math.max(0, showcaseItems.length - 1))}
                    expandRatio={0.52}
                    height={480}
                    gap={12}
                    radius={16}
                    accentColor="#79acee"
                    overlayColor="#070b12"
                    textColor="#f1f6fc"
                    trigger="hover"
                    tilt={6}
                    duration={0.65}
                    grayscale={false}
                  />
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 text-[11px] text-[#71859c]">
                    <span className="flex items-center gap-2">
                      <Lock size={12} className="text-[#79acee]" />
                      {lang === 'ar'
                        ? 'مرر فوق أي مشروع لتوسيعه ومعاينته · انقر للوصول أو طلب معاينة استراتيجية'
                        : lang === 'fr'
                        ? 'Survolez un projet pour agrandir l’aperçu · Cliquez pour accéder au projet'
                        : 'Hover any project panel to expand live preview · Click to unlock access'}
                    </span>
                    <span className="font-code text-[10px] uppercase tracking-wider text-[#79acee]/80">
                      {showcaseItems.length} {lang === 'ar' ? 'مشاريع حية' : lang === 'fr' ? 'Projets déployés' : 'Deployed Systems'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="border-y border-white/[.07] bg-[#0b0e12]"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end lg:px-12 lg:py-32"><div><span className="eyebrow">{t.proofKicker}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">{t.proofTitle}</h2></div><div className="border-l border-[#7197c5]/40 pl-6 sm:pl-10"><div className="mb-6 flex gap-1 text-[#b9d5f7]">{[1,2,3,4,5].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" />)}</div><blockquote className="max-w-2xl text-2xl leading-[1.35] tracking-[-.03em] text-[#dbe3ec] sm:text-3xl">“{t.quote}”</blockquote><p className="mt-7 font-code text-[10px] uppercase tracking-widest text-[#7c8b9d]">{t.quoteBy}</p></div></div></section>

              {/* Merged Consultation & Interactive Booking Calendar */}
              <section id="consultation" className="scroll-mt-20 border-y border-white/[.07] bg-[#0a0e13] relative overflow-hidden">
                <div id="schedule" className="absolute top-0" />
                <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
                  <div className="max-w-3xl mb-14">
                    <span className="eyebrow">{t.formKicker}</span>
                    <h2 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-6xl">
                      {lang === 'ar' ? 'احجز جلستك الاستراتيجية وشاركنا رؤيتك.' : lang === 'fr' ? 'Réservez votre appel stratégique & décrivez votre projet.' : 'Book your strategy call & share your vision.'}
                    </h2>
                    <p className="mt-4 max-w-xl text-base text-[#8997a8]">
                      {lang === 'ar' ? 'اختر موعداً متاحاً في التقويم وأخبرنا عن تفاصيل مشروعك في خطوة واحدة سلسة. بدون عروض بيعية أو ضغط.' : lang === 'fr' ? 'Choisissez un créneau disponible et décrivez votre projet en une seule étape. Échange ciblé de 30 minutes, sans pression commerciale.' : 'Select an available 30-minute window and tell us about what you’re building in one unified step. No pitch deck, no pressure.'}
                    </p>
                  </div>

                  {bookingSuccess && confirmedDetails ? (
                    <div className="glass mx-auto max-w-2xl rounded-2xl p-8 sm:p-12 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#79aaf0]/50 bg-[#4777af]/20 text-[#a9d0ff] shadow-[0_0_40px_rgba(121,174,244,.3)] animate-pulse">
                        <Check size={32} />
                      </div>
                      <h3 className="mt-6 text-3xl font-semibold text-[#e4ecf6]">
                        {t.confirmed}
                      </h3>
                      <p className="mt-3 text-sm text-[#8a98a9]">
                        {lang === 'ar'
                          ? `شكراً ${confirmedDetails.name}. تم حجز جلستك الاستراتيجية الخاصة بنجاح.`
                          : lang === 'fr'
                          ? `Merci ${confirmedDetails.name}. Votre consultation privée de 30 minutes est bien enregistrée.`
                          : `Thank you, ${confirmedDetails.name}. Your private 30-minute strategy consultation is reserved.`}
                      </p>

                      <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#75a7ea]/30 bg-[#25426b]/30 px-5 py-3 text-sm text-[#d6e7fc]">
                        <CalendarDays size={17} className="text-[#88b9f7]" />
                        <strong>{confirmedDetails.slot}</strong>
                      </div>

                      <p className="mt-5 text-xs text-[#708093]">
                        {lang === 'ar'
                          ? `تم إرسال دعوة التقويم وملف التحضير إلى ${confirmedDetails.email}`
                          : lang === 'fr'
                          ? `L'invitation calendrier et la note de préparation ont été envoyées à ${confirmedDetails.email}`
                          : `A calendar invite and preparation briefing have been dispatched to ${confirmedDetails.email}`}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setBookingSuccess(false);
                          setClientName('');
                          setCompanyName('');
                          setClientEmail('');
                          setClientPhone('');
                          setProjectDescription('');
                        }}
                        className="mt-8 text-xs text-[#9cc6fb] underline underline-offset-4 cursor-pointer hover:text-white"
                      >
                        {lang === 'ar' ? 'حجز موعد إضافي أو تعديل' : lang === 'fr' ? 'Réserver un autre créneau' : 'Schedule another slot or modify'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleMergedSubmit} className="glass rounded-2xl p-5 sm:p-10 lg:p-12">
                      <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
                        {/* Left Column: Calendar & Free Slots */}
                        <div className="space-y-5 sm:space-y-6">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                              <span className="font-code text-[10px] uppercase tracking-widest text-[#7da6d8]">
                                {lang === 'ar' ? 'الخطوة الأولى' : lang === 'fr' ? 'Étape 1' : 'Step 1'}
                              </span>
                              <h4 className="mt-1 text-base sm:text-lg font-semibold text-[#e1e9f2]">
                                {lang === 'ar' ? 'اختر اليوم والوقت المناسب' : lang === 'fr' ? 'Choisissez le jour & l’heure' : 'Choose your consultation slot'}
                              </h4>
                            </div>
                            <span className="flex items-center gap-1.5 font-code text-[10px] text-[#78899d]">
                              <Globe2 size={13} className="text-[#6d9fdc]" /> {lang === 'ar' ? 'تلمسان · GMT+1' : lang === 'fr' ? 'Tlemcen · GMT+1' : 'Tlemcen, Algeria · GMT+1'}
                            </span>
                          </div>

                          {/* Day Selector Chips: Swipeable on mobile, grid on desktop */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="block font-code text-[10px] uppercase tracking-wider text-[#8b99aa]">
                                {lang === 'ar' ? 'الأيام المتاحة' : lang === 'fr' ? 'Jours disponibles' : 'Available business days'}
                              </span>
                              <span className="text-[9px] text-[#6d8095] sm:hidden">
                                {lang === 'ar' ? 'اسحب لليمين/اليسار ←' : lang === 'fr' ? 'Glisser ←' : 'Swipe for days →'}
                              </span>
                            </div>
                            <div className="flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-1 px-1">
                              {availableDays.map((day, idx) => (
                                <button
                                  key={day.isoDate}
                                  type="button"
                                  onClick={() => setSelectedDayIndex(idx)}
                                  className={`flex shrink-0 min-w-[76px] sm:min-w-0 min-h-[58px] flex-col items-center justify-center rounded-xl border p-2 transition cursor-pointer active:scale-[0.97] ${
                                    selectedDayIndex === idx
                                      ? 'border-[#79acee] bg-[#2d4d77]/40 text-[#e4f0fe] shadow-[0_0_20px_rgba(110,165,240,.2)] ring-1 ring-[#79acee]'
                                      : 'border-white/10 bg-white/[.02] text-[#8492a3] hover:border-white/25 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#7e8f9f]">{day.dayName}</span>
                                  <strong className="mt-0.5 text-base font-semibold">{day.dayNumber}</strong>
                                  <span className="text-[9px] text-[#6f7e8e]">{day.monthName}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Time Slot Picker: 2 columns on mobile, 3 on desktop */}
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="font-code text-[10px] uppercase tracking-wider text-[#8b99aa]">
                                {lang === 'ar' ? 'الأوقات الشاغرة (30 دقيقة)' : lang === 'fr' ? 'Créneaux libres (30 min)' : 'Available time slots (30 min)'}
                              </span>
                              <span className="text-[10px] text-[#7198c8]">
                                {availableSlots.length} {lang === 'ar' ? 'مواعيد حرة' : lang === 'fr' ? 'créneaux libres' : 'free slots'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlotTime(slot)}
                                  className={`rounded-xl border py-2.5 px-3 min-h-[44px] font-code text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                                    selectedSlotTime === slot
                                      ? 'border-[#79acee] bg-[#2d4d77]/50 text-[#e4f0fe] shadow-[0_0_15px_rgba(110,165,240,.25)] ring-1 ring-[#79acee]'
                                      : 'border-white/10 bg-white/[.02] text-[#8695a6] hover:border-white/25 hover:text-white'
                                  }`}
                                >
                                  <Clock3 size={12} className={selectedSlotTime === slot ? 'text-[#84b5f4]' : 'text-[#5d6c7d]'} />
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Selected Slot Banner */}
                          <div className="flex items-center gap-3 rounded-xl border border-[#76a6e7]/25 bg-[#172b44]/40 p-3 text-xs text-[#a9cbf4]">
                            <CalendarDays size={16} className="shrink-0 text-[#79acee]" />
                            <span className="leading-snug">
                              <strong>
                                {lang === 'ar' ? 'الموعد المحدد: ' : lang === 'fr' ? 'Créneau sélectionné : ' : 'Selected reservation: '}
                              </strong>
                              {availableDays[selectedDayIndex]?.label} · {selectedSlotTime} · GMT+1 ({lang === 'ar' ? 'تلمسان' : 'Tlemcen'})
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Contact & Project Details */}
                        <div className="space-y-5">
                          <div className="border-b border-white/10 pb-4">
                            <span className="font-code text-[10px] uppercase tracking-widest text-[#7da6d8]">
                              {lang === 'ar' ? 'الخطوة الثانية' : lang === 'fr' ? 'Étape 2' : 'Step 2'}
                            </span>
                            <h4 className="mt-1 text-base sm:text-lg font-semibold text-[#e1e9f2]">
                              {lang === 'ar' ? 'بياناتك وتفاصيل المشروع' : lang === 'fr' ? 'Vos coordonnées & votre projet' : 'Your details & project scope'}
                            </h4>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">
                                {t.formFields[0]} *
                              </label>
                              <input
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="focus-ring w-full rounded-lg border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
                                placeholder="e.g. Maya Laurent"
                                data-testid="input-name"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">
                                {t.formFields[1]} *
                              </label>
                              <input
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="focus-ring w-full rounded-lg border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
                                placeholder="e.g. Nadir Finance"
                                data-testid="input-company"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">
                                {t.formFields[2]} *
                              </label>
                              <input
                                required
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="focus-ring w-full rounded-lg border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
                                placeholder="maya@nadir.finance"
                                data-testid="input-email"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#9aa8b8]">
                                <span>{t.formFields[3]}</span>
                                <span className="text-[10px] text-[#79aef4] font-code uppercase tracking-wider">
                                  {lang === 'ar' ? 'إجباري' : lang === 'fr' ? 'Requis' : 'Required'}
                                </span>
                              </label>
                              <input
                                required
                                type="tel"
                                value={clientPhone}
                                onChange={(e) => {
                                  setClientPhone(e.target.value);
                                  if (e.target.value.trim()) setPhoneError(false);
                                }}
                                className={`focus-ring w-full rounded-lg border ${
                                  phoneError ? 'border-[#e27373] bg-[#e27373]/10' : 'border-white/10 bg-white/[.03]'
                                } px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]`}
                                placeholder="+213 5... / +33 6..."
                                data-testid="input-phone"
                              />
                              {phoneError && (
                                <span className="mt-1 block text-[11px] text-[#e27373]">
                                  {lang === 'ar' ? 'يرجى إدخال رقم الهاتف للمتابعة' : lang === 'fr' ? 'Veuillez saisir votre numéro de téléphone' : 'Please enter your phone number to continue'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Services Multi-Select */}
                          <div>
                            <span className="mb-2 block text-xs font-medium text-[#9aa8b8]">
                              {lang === 'ar' ? 'الخدمات التي تهمك' : lang === 'fr' ? 'Services concernés' : 'Services you may need'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {t.services.map((service) => {
                                const isChecked = selectedServices.includes(service);
                                return (
                                  <button
                                    key={service}
                                    type="button"
                                    onClick={() => {
                                      setSelectedServices((prev) =>
                                        isChecked ? prev.filter((s) => s !== service) : [...prev, service]
                                      );
                                    }}
                                    className={`rounded-full border px-3 py-1.5 text-xs transition cursor-pointer ${
                                      isChecked
                                        ? 'border-[#76a9ee] bg-[#31527b]/40 text-[#d8e8fc]'
                                        : 'border-white/10 bg-white/[.02] text-[#8695a7] hover:border-white/20'
                                    }`}
                                  >
                                    {service}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Project description textarea */}
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">
                              {t.formFields[4]} *
                            </label>
                            <textarea
                              required
                              rows={3}
                              value={projectDescription}
                              onChange={(e) => setProjectDescription(e.target.value)}
                              placeholder="Briefly describe your objectives, timeline, or current digital bottleneck..."
                              className="focus-ring w-full resize-none rounded-lg border border-white/10 bg-white/[.03] p-3 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
                              data-testid="input-project"
                            />
                          </div>

                          {/* Submit Bar */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                            <span className="flex items-center gap-2 text-[10px] text-[#718194]">
                              <ShieldCheck size={14} className="text-[#78a8e7]" />
                              {lang === 'ar' ? 'بياناتك مشفرة ولن تتم مشاركتها' : lang === 'fr' ? 'Vos données restent strictement confidentielles' : 'Private consultation · NDA on request'}
                            </span>

                            <button
                              type="submit"
                              disabled={submittingBooking}
                              className="group flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-[#e7edf4] px-8 py-3.5 text-sm font-bold text-[#080a0d] transition hover:bg-[#a9cbfb] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                              data-testid="button-submit-consultation"
                            >
                              {submittingBooking ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  {lang === 'ar'
                                    ? `تأكيد حجز ${selectedSlotTime} وإرسال الطلب`
                                    : lang === 'fr'
                                    ? `Confirmer pour ${selectedSlotTime} & Envoyer`
                                    : `Confirm Call for ${selectedSlotTime} & Send`}
                                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              <section id="faq" className="scroll-mt-20 mx-auto max-w-[1000px] px-5 py-20 sm:px-8 lg:py-36"><div className="text-center"><span className="eyebrow">{t.faqKicker}</span><h2 className="mt-5 text-3xl font-semibold tracking-[-.055em] text-[#e4eaf2] sm:text-5xl lg:text-6xl">{t.faqTitle}</h2></div><div className="mt-12 sm:mt-14 border-t border-white/10">{t.faqs.map(([question, answer], i) => <div key={question} className="border-b border-white/10"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-5 py-5 sm:py-6 text-start text-sm sm:text-base text-[#d9e1eb]" aria-expanded={openFaq === i} data-testid={`button-faq-${i}`}><span>{question}</span><ChevronDown size={18} className={`shrink-0 text-[#7c9ec7] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} /></button>{openFaq === i && <p className="max-w-2xl pb-6 sm:pb-7 text-xs sm:text-sm leading-6 sm:leading-7 text-[#8491a2]">{answer}</p>}</div>)}</div></section>

              <section className="relative overflow-hidden border-t border-white/[.07] bg-[#0b0f14]"><div className="absolute inset-0 grid-fade opacity-50" /><div className="relative mx-auto flex max-w-[1320px] flex-col justify-between gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-32"><div><span className="eyebrow">SPECTRA / 2025</span><h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[.98] tracking-[-.07em] text-[#e7edf4] sm:text-6xl lg:text-7xl">{t.finalTitle}</h2></div><button onClick={() => scrollTo('consultation')} className="group flex w-full sm:w-fit min-h-[48px] items-center justify-center gap-3 rounded-full bg-[#e7edf4] px-7 py-3.5 text-sm font-bold text-[#080a0d] transition hover:bg-[#a9cbfb] active:scale-[0.98]" data-testid="button-final-cta">{t.finalCta}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button></div></section>
            </main>

            <footer className="border-t border-white/[.07]"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-12"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 overflow-hidden rounded-full border border-white/20"><img src="/assets/spectra-logo.jpeg" alt="Spectra" className="h-full w-full object-cover" /></span><span className="font-code text-xs tracking-[.28em] text-[#e7ebf0]">SPECTRA</span></div><p className="mt-5 max-w-xs text-xs leading-6 text-[#718091]">Digital products and systems for businesses with somewhere serious to go.</p></div><FooterCol title={lang === 'ar' ? 'استكشف' : lang === 'fr' ? 'Explorer' : 'Explore'} items={t.nav} onSelect={(i) => scrollTo(['capabilities','method','work','faq'][i])} /><FooterCol title={lang === 'ar' ? 'تواصل' : lang === 'fr' ? 'Contact' : 'Contact'} items={['hello@spectra.agency', lang === 'ar' ? 'تلمسان، الجزائر / عن بعد' : lang === 'fr' ? 'Tlemcen, Algérie / À distance' : 'Tlemcen, Algeria / Remote', 'LinkedIn', 'Instagram']} onSelect={() => {}} /><div><span className="eyebrow">STATUS</span><p className="mt-4 flex items-center gap-2 text-xs text-[#98a7b8]"><span className="h-1.5 w-1.5 rounded-full bg-[#7ab0fa]" /> {t.status}</p></div></div><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 border-t border-white/10 px-5 py-6 text-[10px] text-[#5e6b7c] sm:flex-row sm:px-8 lg:px-12"><span>© 2025 Spectra Agency. All rights reserved.</span><span>Privacy / Terms / Built with intent</span></div></footer>

            <button onClick={() => scrollTo('consultation')} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center gap-2 rounded-full border border-[#82afea]/40 bg-[#152338]/90 px-4 py-3 text-xs font-semibold text-[#dbeaff] shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-[#203b60] active:scale-95 safe-bottom" data-testid="button-floating-cta"><CalendarDays size={15} /> {t.book}</button>
            {exitOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Special invitation"><div className="glass relative max-w-md rounded-2xl p-7 sm:p-9"><button onClick={() => setExitOpen(false)} className="absolute right-4 top-4 text-[#8290a1]" aria-label="Close" data-testid="button-close-exit"><X size={18} /></button><span className="eyebrow">A considered next step</span><h2 className="mt-5 text-3xl font-semibold tracking-[-.05em] text-[#e7edf4]">Before you go — take the scorecard with you.</h2><p className="mt-4 text-sm leading-6 text-[#8997a8]">Book a private 30-minute conversation and we’ll map the highest-leverage opportunity in your current digital experience.</p><button onClick={() => { setExitOpen(false); scrollTo('consultation'); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#e7edf4] py-3 text-sm font-bold text-[#080a0d]" data-testid="button-exit-cta">{t.book}<ArrowRight size={15} /></button></div></div>}

            {gateModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Consultation Required">
                <div className="glass relative max-w-md rounded-2xl p-7 sm:p-9 border border-[#82afea]/30 shadow-2xl">
                  <button onClick={() => setGateModalOpen(false)} className="absolute right-4 top-4 text-[#8290a1] hover:text-white" aria-label="Close">
                    <X size={18} />
                  </button>
                  <span className="eyebrow">{lang === 'ar' ? 'معاينة المشروع' : lang === 'fr' ? 'Aperçu du Projet' : 'Project Preview'}</span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-[-.05em] text-[#e7edf4]">
                    {selectedWebsiteTitle ? `"${selectedWebsiteTitle}"` : (lang === 'ar' ? 'هذا الموقع' : lang === 'fr' ? 'Ce site' : 'This website')}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[#8997a8]">
                    {t.portfolioGateNotice}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => {
                        setGateModalOpen(false);
                        scrollTo('consultation');
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#e7edf4] py-3 text-sm font-bold text-[#080a0d] hover:bg-[#a9cbfb] transition active:scale-[0.98]"
                    >
                      {t.portfolioGateAction}
                      <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => setGateModalOpen(false)}
                      className="rounded-full border border-white/10 px-5 py-3 text-xs font-semibold text-[#a6b6c8] hover:bg-white/5 transition"
                    >
                      {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Field({ label, id, type = 'text' }: { label: string; id: string; type?: string }) {
  return <label><span className="mb-2 block text-[11px] text-[#9aa8b8]">{label}</span><input required id={id} name={id} type={type} className="focus-ring w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-3 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]" data-testid={`input-${id}`} /></label>;
}

function FooterCol({ title, items, onSelect }: { title: string; items: readonly string[]; onSelect: (index: number) => void }) {
  return <div><span className="eyebrow">{title}</span><div className="mt-4 flex flex-col gap-3">{items.map((item, i) => <button key={item} onClick={() => onSelect(i)} className="w-fit text-start text-xs text-[#8491a2] transition hover:text-[#dce7f4]" data-testid={`link-footer-${i}`}>{item}</button>)}</div></div>;
}

function ShowcaseCard({
  site,
  lang,
  isLeadSubmitted,
  onWebsiteClick,
}: {
  site: any;
  lang: string;
  isLeadSubmitted: boolean;
  onWebsiteClick: (url: string, title: string) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cleanDomain = site.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const snapshotUrl =
    site.imageUrl ||
    `https://api.microlink.io/?url=${encodeURIComponent(site.url)}&screenshot=true&embed=screenshot.url`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1319] shadow-2xl transition duration-300 hover:border-[#79aef4]/50 flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onWebsiteClick(site.url, site.title)}
    >
      {/* Browser Window Mockup Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#131922] px-4 py-2.5 z-10">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-3 py-1 font-code text-[11px] text-[#93a6be]">
          <Lock size={11} className="text-[#79aef4]" />
          <span className="truncate max-w-[160px] sm:max-w-xs">{cleanDomain}</span>
        </div>
        <span className="text-[10px] font-code uppercase tracking-wider text-[#687b92]">
          {site.category}
        </span>
      </div>

      {/* Interactive Viewport Mockup */}
      <div className="relative h-[340px] sm:h-[400px] w-full overflow-hidden bg-[#070b10]">
        {/* Loading Spinner Skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080d14] z-0">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#79aef4]/20 border-t-[#79aef4]" />
            <span className="mt-3 font-code text-[11px] text-[#697d95]">
              {lang === 'ar' ? 'جارٍ تحميل المعاينة المباشرة...' : lang === 'fr' ? 'Chargement de l’aperçu...' : 'Rendering live preview...'}
            </span>
          </div>
        )}

        {/* Snapshot Image with Smooth Hover Scrolling */}
        {!imgError ? (
          <div className="w-full h-full overflow-hidden">
            <img
              src={snapshotUrl}
              alt={site.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(true);
              }}
              className="w-full object-cover object-top origin-top will-change-transform"
              style={{
                transform: isHovered ? 'translateY(calc(-100% + 380px))' : 'translateY(0)',
                opacity: imgLoaded ? 1 : 0,
                transition: 'transform 6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
              }}
            />
          </div>
        ) : (
          /* Graceful Fallback if site screenshot fails */
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#101824] to-[#080d14]">
            <Globe2 size={40} className="text-[#79aef4]/50 mb-3" />
            <h4 className="text-base font-semibold text-[#e1ecf8]">{site.title}</h4>
            <p className="text-xs text-[#71859c] mt-1">{cleanDomain}</p>
            <span className="mt-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#9db4ce]">
              {lang === 'ar' ? 'انقر لمعاينة المشروع' : lang === 'fr' ? 'Cliquer pour ouvrir le site' : 'Click to preview live project'}
            </span>
          </div>
        )}

        {/* Interactive Click Shield Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-[#080c11] via-[#080c11]/40 to-transparent pointer-events-none">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#0e1620]/95 p-3.5 sm:p-4 backdrop-blur-md shadow-lg transition-transform group-hover:-translate-y-0.5 pointer-events-auto">
            <div>
              <h4 className="text-sm font-semibold text-[#e8f0fa] flex items-center gap-2">
                {site.title}
                {isLeadSubmitted ? (
                  <span className="text-[10px] font-code text-[#79aef4] border border-[#79aef4]/30 rounded px-1.5 py-0.5">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] font-code text-[#8fa2b8] border border-white/10 rounded px-1.5 py-0.5">
                    RESTRICTED
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[#8ea1b8] mt-0.5">{site.description || site.category}</p>
            </div>
            <div className="shrink-0">
              {isLeadSubmitted ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#79aef4]/40 bg-[#79aef4]/15 px-3 py-1.5 text-xs font-medium text-[#9ec4f5] shadow-[0_0_15px_rgba(121,174,244,0.2)]">
                  <ExternalLink size={13} />
                  {lang === 'ar' ? 'فتح الموقع' : lang === 'fr' ? 'Ouvrir le site' : 'Open Site'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#b8cce2] group-hover:border-[#79aef4]/50 group-hover:text-white transition">
                  <Lock size={12} className="text-[#79aef4]" />
                  {lang === 'ar' ? 'معاينة الموقع' : lang === 'fr' ? 'Accéder' : 'Preview Site'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  ? publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    )
  : undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#86b7f2',
    colorForeground: '#dce6f1',
    colorMutedForeground: '#8391a2',
    colorDanger: '#df929b',
    colorBackground: '#111820',
    colorInput: '#0b1118',
    colorInputForeground: '#e3edf8',
    colorNeutral: '#354353',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '0.65rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#111820] rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/[.1]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#eaf1f8] tracking-[-.04em]',
    headerSubtitle: 'text-[#8998aa]',
    socialButtonsBlockButtonText: 'text-[#dbe7f3]',
    formFieldLabel: 'text-[#aebdcd]',
    footerActionLink: 'text-[#9bc8fa]',
    footerActionText: 'text-[#8492a3]',
    dividerText: 'text-[#728195]',
    identityPreviewEditButton: 'text-[#9bc8fa]',
    formFieldSuccessText: 'text-[#89caa9]',
    alertText: 'text-[#dfa2a9]',
    logoBox: 'w-12 h-12',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-white/[.13] bg-white/[.03] hover:bg-white/[.07]',
    formButtonPrimary: 'bg-[#dcecff] text-[#09101a] hover:bg-[#a8cdf9]',
    formFieldInput: 'border-white/[.14] bg-[#0b1118] text-[#e3edf8]',
    footerAction: 'border-white/[.08]',
    dividerLine: 'bg-white/[.12]',
    alert: 'border-[#df929b]/30 bg-[#df929b]/[.08]',
    otpCodeFieldInput: 'border-white/[.14] bg-[#0b1118] text-[#e3edf8]',
    formFieldRow: 'text-[#dce6f1]',
    main: 'bg-transparent',
  },
};

function ClerkQueryBoundary() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      if (user) queryClient.clear();
    });
    return unsubscribe;
  }, [addListener, queryClient]);
  return null;
}

function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<AdminLang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spectra_admin_lang');
      if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
    }
    return 'en';
  });

  const changeLang = (next: AdminLang) => {
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('spectra_admin_lang', next);
    }
  };

  const isRtl = lang === 'ar';

  const loginCopy = {
    en: {
      kicker: 'Spectra / Operating Room',
      title: 'Studio Admin Access',
      subtitle: 'Authenticate to access pipeline, client video reviews, and capacity.',
      credBadge: 'Admin Credentials',
      fillCreds: 'Fill Credentials',
      emailLabel: 'Work Email',
      passwordLabel: 'Password',
      submitBtn: 'Enter Operating Room',
      authenticating: 'Authenticating...',
      returnFunnel: '← Return to public funnel',
    },
    fr: {
      kicker: 'Spectra / Salle de contrôle',
      title: 'Accès Studio Admin',
      subtitle: 'Authentifiez-vous pour accéder au pipeline, aux retours vidéo et à la capacité.',
      credBadge: 'Identifiants Admin',
      fillCreds: 'Remplir automatiquement',
      emailLabel: 'Email professionnel',
      passwordLabel: 'Mot de passe',
      submitBtn: 'Entrer dans la salle de contrôle',
      authenticating: 'Authentification en cours...',
      returnFunnel: '← Retour au site public',
    },
    ar: {
      kicker: 'سبيكترا / غرفة العمليات',
      title: 'دخول إدارة الاستوديو',
      subtitle: 'سجل الدخول للوصول إلى طلبات العملاء، مراجعات الفيديو، وإدارة الأوقات.',
      credBadge: 'بيانات الدخول الإدارية',
      fillCreds: 'تعبئة تلقائية',
      emailLabel: 'البريد الإلكتروني للعمل',
      passwordLabel: 'كلمة المرور',
      submitBtn: 'دخول غرفة العمليات',
      authenticating: 'جاري التحقق...',
      returnFunnel: 'العودة إلى الصفحة العامة ←',
    },
  }[lang];

  const [email, setEmail] = useState('admin@spectra.agency');
  const [password, setPassword] = useState('spectra2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('spectra_admin_token')) {
      setLocation('/admin');
    }
  }, [setLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password');
      }
      localStorage.setItem('spectra_admin_token', data.token);
      localStorage.setItem('spectra_admin_user', JSON.stringify(data.user));
      setAuthTokenGetter(() => data.token);
      setLocation('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spectra-page noise flex min-h-screen items-center justify-center px-4 py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[#11151a] mb-4 shadow-xl">
            <img src="/assets/spectra-logo.jpeg" alt="Spectra" className="h-full w-full object-cover" />
          </div>
          
          {/* Language selector */}
          <div className="flex justify-center mb-4">
            <div className="admin-lang-picker">
              {(['en', 'fr', 'ar'] as AdminLang[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeLang(item)}
                  className={`admin-lang-btn ${lang === item ? 'is-active' : ''}`}
                  data-testid={`button-login-lang-${item}`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <p className="eyebrow">{loginCopy.kicker}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#e6edf5] sm:text-3xl">{loginCopy.title}</h1>
          <p className="mt-2 text-xs text-[#8796a7]">{loginCopy.subtitle}</p>
        </div>

        {/* Credentials Card */}
        <div className="mb-6 rounded-xl border border-[#74a5e6]/25 bg-[#142236]/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[#95bfe9]">
            <span className="font-semibold flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#7aafe8]" /> {loginCopy.credBadge}</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@spectra.agency');
                setPassword('spectra2025');
              }}
              className="text-[11px] underline underline-offset-2 hover:text-white cursor-pointer text-[#8dbcf3]"
            >
              {loginCopy.fillCreds}
            </button>
          </div>
          <div className="mt-3 space-y-1.5 font-code text-[11px] text-[#c2d9f2]">
            <div className="flex justify-between border-b border-white/[.07] pb-1">
              <span className="text-[#7891aa]">Email:</span>
              <span className="select-all font-medium text-[#d9e7f8]">admin@spectra.agency</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-[#7891aa]">Password:</span>
              <span className="select-all font-medium text-[#d9e7f8]">spectra2025</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#e2a1a7]/30 bg-[#e2a1a7]/10 p-3 text-xs text-[#f2b8bd]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 sm:p-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">{loginCopy.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full min-h-[44px] rounded-lg border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
              placeholder="admin@spectra.agency"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9aa8b8]">{loginCopy.passwordLabel}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full min-h-[44px] rounded-lg border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-sm text-[#e4ebf3] outline-none transition focus:border-[#79a9eb]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#e7edf4] py-3 text-sm font-bold text-[#080a0d] transition hover:bg-[#aacbfa] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? loginCopy.authenticating : loginCopy.submitBtn} <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-[#708298] hover:text-[#c4d6eb] transition">
            {loginCopy.returnFunnel}
          </a>
        </div>
      </div>
    </div>
  );
}

function AdminRoute() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('spectra_admin_token') : null;
  if (!token) return <Redirect to="/admin/login" />;

  return (
    <AdminLangProvider>
      <Switch>
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/portfolio" component={AdminPortfolio} />
        <Route path="/admin/video" component={AdminVideo} />
        <Route path="/admin/availability" component={AdminAvailability} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin" component={AdminOverview} />
        <Route component={() => <Redirect to="/admin" />} />
      </Switch>
    </AdminLangProvider>
  );
}

function ClerkRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={PublicHome} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/sign-in/*?" component={() => <Redirect to="/admin/login" />} />
        <Route path="/sign-up/*?" component={() => <Redirect to="/admin/login" />} />
        <Route path="/admin/*?" component={AdminRoute} />
        <Route component={() => <Redirect to="/" />} />
      </Switch>
    </QueryClientProvider>
  );
}

function App() {
  return <WouterRouter base={basePath}><ClerkRoutes /></WouterRouter>;
}

export default App;