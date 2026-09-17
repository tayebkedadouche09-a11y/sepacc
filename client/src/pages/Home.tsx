import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Compass,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Code2,
  Lock,
  CreditCard,
  Package,
  KeyRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import SkyCanvas from "@/components/SkyCanvas";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";

type MarketplaceEntry = {
  product: any;
  category: { name: string; slug: string } | null;
  techStack: Array<{ name: string }>;
};

function ProductCard({ entry, index }: { entry: MarketplaceEntry; index: number }) {
  const { t } = useLocale();
  const product = entry.product;
  const categoryName = entry.category?.name ?? product.category;
  const hasDemo = Boolean(product.demoUrl);

  return (
    <article className="product-card glass group overflow-hidden rounded-[28px]">
      <div className="relative aspect-[1.18] overflow-hidden bg-[#091a2b]">
        <img
          src={product.heroImage}
          alt={`${product.name} website preview`}
          className="card-media h-full w-full object-cover opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040b16] via-transparent to-transparent opacity-80" />
        <div className="absolute left-5 top-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
          <span className="pulse-dot" />
          {String(index + 1).padStart(2, "0")} / digital
        </div>
        {hasDemo && (
          <div className="absolute right-5 top-5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
            {t("live_demo")}
          </div>
        )}
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-[#040b16]/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/75 backdrop-blur">
            {categoryName}
          </span>
          <span className="font-mono text-sm font-medium text-white/85">
            {product.currency} {Number(product.price).toLocaleString("en-US")}
          </span>
        </div>
      </div>
      <div className="space-y-5 p-6 md:p-7">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{product.name}</h3>
          <p className="mt-2 max-w-[28rem] text-sm leading-6 text-white/55">{product.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(entry.techStack ?? []).slice(0, 4).map((stack) => (
            <span key={stack.name} className="rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] text-white/55">
              {stack.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/websites/${product.slug}`}
            className="group/link flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#83c2ff]"
          >
            {t("inspect")}
            <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1 rtl:rotate-180" />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{t("ready_to_own")}</span>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { t, dir } = useLocale();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const marketplace = trpc.marketplace.list.useQuery(
    { search: query || undefined, category: activeCategory || undefined },
    { staleTime: 60_000 },
  );

  const categoriesQuery = trpc.marketplace.categories.useQuery(undefined, { staleTime: 120_000 });

  const entries: MarketplaceEntry[] = marketplace.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filtered = useMemo(() => {
    // Server already filters by search/category when provided; keep client safety net
    return entries;
  }, [entries]);

  return (
    <div className="numi-shell" dir={dir}>
      <SkyCanvas />
      <div className="numi-content">
        <SiteNav />

        {/* HERO */}
        <section className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                <span className="pulse-dot" />
                {t("brand_tag")}
              </div>
              <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white md:text-6xl lg:text-7xl">
                {t("hero_title_1")}
                <br />
                <span className="bg-gradient-to-r from-[#83c2ff] via-[#a8d4ff] to-[#f0a07a] bg-clip-text text-transparent">
                  {t("hero_title_2")}
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">{t("hero_sub")}</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#collection" className="btn-primary">
                  {t("explore_collection")}
                  <ArrowDownRight size={16} />
                </a>
                <a href="#principles" className="btn-ghost">
                  {t("how_it_works")}
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <span className="trust-pill"><Code2 size={13} /> {t("trust_source")}</span>
                <span className="trust-pill"><Lock size={13} /> {t("trust_ownership")}</span>
                <span className="trust-pill"><Globe size={13} /> {t("trust_instance")}</span>
                <span className="trust-pill"><Zap size={13} /> {t("trust_payment")}</span>
              </div>
            </div>

            <div className="relative hidden min-h-[420px] lg:block">
              <div className="arch-glyph absolute -right-6 top-4 h-80 w-72 rounded-t-[160px] border border-[#d99a72]/25 opacity-70" />
              <div className="hero-orb glass-light absolute right-[6%] top-16 h-48 w-48 rounded-full" />
              <div className="hero-orb-2 glass-light absolute bottom-10 left-[8%] h-36 w-36 rounded-full" />
              <div className="glass-strong absolute left-1/2 top-1/2 w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] p-1 hero-glow">
                <div className="overflow-hidden rounded-[24px] bg-[#0a1628]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 font-mono text-[10px] text-white/40">numi · live system</span>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="h-3 w-2/3 rounded-full bg-white/10" />
                    <div className="h-3 w-1/2 rounded-full bg-white/8" />
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a3a5c] to-[#0d2038]" />
                      <div className="h-20 rounded-2xl border border-white/10 bg-gradient-to-br from-[#2a2a4a] to-[#1a1528]" />
                    </div>
                    <div className="h-24 rounded-2xl border border-white/10 bg-gradient-to-r from-[#1e3a5f]/80 to-[#0f2844]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COLLECTION */}
        <section id="collection" className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label mb-3">{t("collection")}</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">{t("curated")}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">{t("curated_sub")}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 rtl:left-auto rtl:right-3.5" size={16} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_placeholder")}
                className="w-56 rounded-full border border-white/15 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#3b8bff]/50 focus:ring-1 focus:ring-[#3b8bff]/30 rtl:pl-4 rtl:pr-10"
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                !activeCategory
                  ? "bg-[#3b8bff] text-white shadow-lg shadow-blue-500/25"
                  : "border border-white/15 bg-white/[0.03] text-white/60 hover:text-white"
              }`}
            >
              {t("all")}
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  activeCategory === cat.slug
                    ? "bg-[#3b8bff] text-white shadow-lg shadow-blue-500/25"
                    : "border border-white/15 bg-white/[0.03] text-white/60 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {marketplace.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass h-[420px] animate-pulse rounded-[28px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-[28px] px-8 py-16 text-center">
              <p className="text-white/50">{t("no_match")}</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory(null);
                }}
                className="mt-4 text-sm text-[#83c2ff] hover:underline"
              >
                {t("clear_filters")}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((entry, index) => (
                <ProductCard key={entry.product.slug ?? index} entry={entry} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* PRINCIPLES */}
        <section id="principles" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <div className="mb-14 text-center">
            <p className="section-label mb-3">{t("approach")}</p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {t("approach_title")}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Layers3, title: t("principle_1_title"), body: t("principle_1_body") },
              { icon: ShieldCheck, title: t("principle_2_title"), body: t("principle_2_body") },
              { icon: Compass, title: t("principle_3_title"), body: t("principle_3_body") },
            ].map((item) => (
              <div key={item.title} className="glass group rounded-[24px] p-7 transition-all hover:border-[#3b8bff]/30">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[0.05] text-[#83c2ff] transition-colors group-hover:border-[#3b8bff]/40 group-hover:text-white">
                  <item.icon size={20} />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DELIVERY PATH */}
        <section id="delivery" className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
          <div className="mb-12 text-center">
            <p className="section-label mb-3">{t("delivery")}</p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              {t("delivery_title")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: t("step_1"), body: t("step_1_body"), n: "01" },
              { icon: CreditCard, title: t("step_2"), body: t("step_2_body"), n: "02" },
              { icon: Package, title: t("step_3"), body: t("step_3_body"), n: "03" },
              { icon: KeyRound, title: t("step_4"), body: t("step_4_body"), n: "04" },
            ].map((s) => (
              <div key={s.n} className="glass relative rounded-[22px] p-6">
                <span className="font-mono text-[11px] text-[#83c2ff]/70">{s.n}</span>
                <div className="mt-4 mb-3 grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/[0.04] text-[#83c2ff]">
                  <s.icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-white/40">{t("guarantee_body")}</p>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
          <div className="glass relative overflow-hidden rounded-[36px] p-8 md:p-16">
            <div className="pattern-star absolute right-8 top-8 h-36 w-36 opacity-25" />
            <div className="relative max-w-3xl">
              <Sparkles className="mb-7 text-[#f0a07a]" size={26} />
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl lg:text-6xl">
                {t("quieter_title")}
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">{t("quieter_body")}</p>
              <div className="mt-10 flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                {[t("trust_source"), t("trust_instance"), t("license")].map((label) => (
                  <span key={label} className="flex items-center gap-2">
                    <Check size={14} className="text-[#83c2ff]" /> {label}
                  </span>
                ))}
              </div>
              <div className="mt-10">
                <a href="#collection" className="btn-primary">
                  {t("browse_systems")}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/25 text-sm font-bold">N</span>
              <span className="font-mono text-sm tracking-[0.3em] text-white/80">NUMI</span>
            </div>
            <p className="max-w-md text-xs leading-5 text-white/35">{t("footer_line")}</p>
            <Link href="/account" className="flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white">
              {t("customer_access")} <ArrowRight size={14} />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
