import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "ar" | "fr";

type Dict = Record<string, string>;

const dictionaries: Record<Locale, Dict> = {
  en: {
    brand_tag: "Premium website systems",
    hero_title_1: "Websites built",
    hero_title_2: "to be launched.",
    hero_sub:
      "NUMI is a cinematic showroom for finished website systems. Inspect the work, buy with confidence, and receive an independent instance with source and clear ownership.",
    explore_collection: "Explore the collection",
    how_it_works: "How it works",
    trust_source: "Source included",
    trust_ownership: "Full ownership",
    trust_instance: "Independent instance",
    trust_payment: "One-time payment",
    collection: "The collection",
    curated: "Curated systems ready to own",
    curated_sub: "Each product is a complete website system with source, documentation and a clear license.",
    search_placeholder: "Search systems…",
    all: "All",
    no_match: "No systems match your filters yet.",
    clear_filters: "Clear filters",
    inspect: "Inspect system",
    ready_to_own: "ready to own",
    live_demo: "Live demo",
    approach: "The approach",
    approach_title: "Built for clarity, not clutter",
    principle_1_title: "Finished systems",
    principle_1_body:
      "Not empty templates. Each product ships as a complete website system with structure, motion language and documentation.",
    principle_2_title: "Independent ownership",
    principle_2_body:
      "You receive a private instance and source. Your site does not depend on NUMI’s accounts for day-to-day operation.",
    principle_3_title: "Clear path to launch",
    principle_3_body:
      "From inspect → purchase → delivery. No hidden license traps. One-time payment. One independent customer instance.",
    delivery: "Delivery path",
    delivery_title: "From payment to your own site",
    step_1: "Choose a system",
    step_1_body: "Inspect demos, features, license and tech stack.",
    step_2: "Secure checkout",
    step_2_body: "Pay once with Stripe, Chargily (DZD) or PayPal.",
    step_3: "Private instance",
    step_3_body: "We provision your independent repository and hosting when configured.",
    step_4: "You own it",
    step_4_body: "Access unlocks only when delivery is ready. Source and docs included.",
    quieter_title: "A quieter way to buy digital work.",
    quieter_body:
      "No endless template scroll. No hidden license language. NUMI keeps the catalog intentional, the details visible, and the path from “this feels right” to “it is mine” unambiguous.",
    browse_systems: "Browse the systems",
    footer_line: "A cinematic digital showroom for websites built to be launched.",
    customer_access: "Customer access",
    nav_collection: "Collection",
    nav_approach: "The approach",
    nav_handover: "Handover",
    sign_in: "Sign in",
    explore: "Explore",
    owner_space: "Owner space",
    my_space: "My space",
    guarantee: "Launch support",
    guarantee_body: "Clear license · Source handover · Delivery only when ready",
    buy_now: "Get this system",
    open_demo: "Open live demo",
    features: "What you get",
    tech: "Tech stack",
    faq: "FAQ",
    license: "License",
    included: "Included",
    requirements: "Requirements",
    reviews: "Reviews",
    back: "Back to collection",
    loading: "Loading…",
    not_found: "Product not found.",
    return_home: "Return home",
    pay_stripe: "Pay with card (Stripe)",
    pay_chargily: "Pay in DZD (Chargily)",
    pay_paypal: "Pay with PayPal",
    sign_in_to_buy: "Sign in to purchase",
    gallery: "Gallery",
    why_numi: "Why NUMI",
  },
  ar: {
    brand_tag: "أنظمة مواقع ويب جاهزة",
    hero_title_1: "مواقع مبنية",
    hero_title_2: "لتُطلق مباشرة.",
    hero_sub:
      "NUMI معرض سينمائي لأنظمة مواقع جاهزة. تفحّص العمل، اشترِ بثقة، واحصل على نسخة مستقلة مع الكود المصدري وملكية واضحة.",
    explore_collection: "استكشف المجموعة",
    how_it_works: "كيف يعمل",
    trust_source: "الكود المصدري مشمول",
    trust_ownership: "ملكية كاملة",
    trust_instance: "نسخة مستقلة",
    trust_payment: "دفع لمرة واحدة",
    collection: "المجموعة",
    curated: "أنظمة مختارة جاهزة للتملك",
    curated_sub: "كل منتج نظام موقع كامل مع المصدر والوثائق وترخيص واضح.",
    search_placeholder: "ابحث عن نظام…",
    all: "الكل",
    no_match: "لا توجد نتائج تطابق الفلاتر.",
    clear_filters: "مسح الفلاتر",
    inspect: "تفحّص النظام",
    ready_to_own: "جاهز للتملك",
    live_demo: "عرض حي",
    approach: "المنهج",
    approach_title: "مصمم للوضوح لا للازدحام",
    principle_1_title: "أنظمة مكتملة",
    principle_1_body: "ليست قوالب فارغة. كل منتج يخرج كنظام موقع كامل بهيكل وحركة ووثائق.",
    principle_2_title: "ملكية مستقلة",
    principle_2_body: "تحصل على نسخة خاصة ومصدر. موقعك لا يعتمد على حسابات NUMI في التشغيل اليومي.",
    principle_3_title: "مسار واضح للإطلاق",
    principle_3_body: "من التفحّص → الشراء → التسليم. بدون تراخيص مخفية. دفع مرة واحدة. نسخة مستقلة واحدة.",
    delivery: "مسار التسليم",
    delivery_title: "من الدفع إلى موقعك الخاص",
    step_1: "اختر نظاماً",
    step_1_body: "تفحّص العروض والميزات والترخيص والتقنيات.",
    step_2: "دفع آمن",
    step_2_body: "ادفع مرة واحدة عبر Stripe أو Chargily (دج) أو PayPal.",
    step_3: "نسخة خاصة",
    step_3_body: "نجهّز مستودعاً واستضافة مستقلة عند التفعيل.",
    step_4: "تصبح ملكك",
    step_4_body: "الوصول يُفتح فقط عند جاهزية التسليم. المصدر والوثائق مشمولة.",
    quieter_title: "طريقة أهدأ لشراء العمل الرقمي.",
    quieter_body:
      "لا تمرير لا نهائي للقوالب. لا لغة ترخيص مخفية. NUMI يبقي الكتالوج مقصوداً والتفاصيل ظاهرة والمسار واضحاً.",
    browse_systems: "تصفّح الأنظمة",
    footer_line: "معرض رقمي سينمائي لمواقع مبنية لتُطلق.",
    customer_access: "وصول الزبون",
    nav_collection: "المجموعة",
    nav_approach: "المنهج",
    nav_handover: "التسليم",
    sign_in: "تسجيل الدخول",
    explore: "استكشف",
    owner_space: "مساحة المالك",
    my_space: "مساحتي",
    guarantee: "دعم الإطلاق",
    guarantee_body: "ترخيص واضح · تسليم المصدر · الوصول بعد الجاهزية فقط",
    buy_now: "احصل على هذا النظام",
    open_demo: "فتح العرض الحي",
    features: "ماذا تحصل",
    tech: "التقنيات",
    faq: "أسئلة شائعة",
    license: "الترخيص",
    included: "المشمول",
    requirements: "المتطلبات",
    reviews: "التقييمات",
    back: "العودة للمجموعة",
    loading: "جاري التحميل…",
    not_found: "المنتج غير موجود.",
    return_home: "العودة للرئيسية",
    pay_stripe: "الدفع بالبطاقة (Stripe)",
    pay_chargily: "الدفع بالدينار (Chargily)",
    pay_paypal: "الدفع عبر PayPal",
    sign_in_to_buy: "سجّل الدخول للشراء",
    gallery: "المعرض",
    why_numi: "لماذا NUMI",
  },
  fr: {
    brand_tag: "Systèmes de sites premium",
    hero_title_1: "Des sites conçus",
    hero_title_2: "pour être lancés.",
    hero_sub:
      "NUMI est une vitrine cinématographique de systèmes de sites terminés. Inspectez, achetez en confiance, et recevez une instance indépendante avec le code source et une propriété claire.",
    explore_collection: "Explorer la collection",
    how_it_works: "Comment ça marche",
    trust_source: "Code source inclus",
    trust_ownership: "Propriété totale",
    trust_instance: "Instance indépendante",
    trust_payment: "Paiement unique",
    collection: "La collection",
    curated: "Systèmes prêts à posséder",
    curated_sub: "Chaque produit est un système complet avec source, documentation et licence claire.",
    search_placeholder: "Rechercher un système…",
    all: "Tous",
    no_match: "Aucun système ne correspond aux filtres.",
    clear_filters: "Effacer les filtres",
    inspect: "Inspecter le système",
    ready_to_own: "prêt à posséder",
    live_demo: "Démo live",
    approach: "L’approche",
    approach_title: "Conçu pour la clarté, pas le bruit",
    principle_1_title: "Systèmes terminés",
    principle_1_body:
      "Pas de templates vides. Chaque produit est un système complet avec structure, motion et documentation.",
    principle_2_title: "Propriété indépendante",
    principle_2_body:
      "Vous recevez une instance privée et le source. Votre site ne dépend pas des comptes NUMI au quotidien.",
    principle_3_title: "Chemin clair vers le lancement",
    principle_3_body:
      "Inspecter → acheter → livrer. Pas de licence cachée. Paiement unique. Une instance client.",
    delivery: "Parcours de livraison",
    delivery_title: "Du paiement à votre propre site",
    step_1: "Choisir un système",
    step_1_body: "Inspectez démos, fonctionnalités, licence et stack.",
    step_2: "Paiement sécurisé",
    step_2_body: "Payez une fois via Stripe, Chargily (DZD) ou PayPal.",
    step_3: "Instance privée",
    step_3_body: "Nous provisionnons dépôt et hébergement indépendants quand configuré.",
    step_4: "C’est à vous",
    step_4_body: "L’accès s’ouvre seulement quand la livraison est prête. Source et docs inclus.",
    quieter_title: "Une façon plus calme d’acheter du digital.",
    quieter_body:
      "Pas de scroll infini de templates. Pas de langage de licence caché. NUMI garde le catalogue intentionnel et le chemin clair.",
    browse_systems: "Parcourir les systèmes",
    footer_line: "Une vitrine cinématographique pour des sites prêts à être lancés.",
    customer_access: "Espace client",
    nav_collection: "Collection",
    nav_approach: "Approche",
    nav_handover: "Livraison",
    sign_in: "Connexion",
    explore: "Explorer",
    owner_space: "Espace propriétaire",
    my_space: "Mon espace",
    guarantee: "Support lancement",
    guarantee_body: "Licence claire · Remise du source · Accès seulement quand prêt",
    buy_now: "Obtenir ce système",
    open_demo: "Ouvrir la démo live",
    features: "Ce que vous obtenez",
    tech: "Stack technique",
    faq: "FAQ",
    license: "Licence",
    included: "Inclus",
    requirements: "Prérequis",
    reviews: "Avis",
    back: "Retour à la collection",
    loading: "Chargement…",
    not_found: "Produit introuvable.",
    return_home: "Retour à l’accueil",
    pay_stripe: "Payer par carte (Stripe)",
    pay_chargily: "Payer en DZD (Chargily)",
    pay_paypal: "Payer avec PayPal",
    sign_in_to_buy: "Connectez-vous pour acheter",
    gallery: "Galerie",
    why_numi: "Pourquoi NUMI",
  },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("numi_locale") as Locale | null;
    return saved === "ar" || saved === "fr" || saved === "en" ? saved : "en";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("numi_locale", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
      dir: locale === "ar" ? "rtl" : "ltr",
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
