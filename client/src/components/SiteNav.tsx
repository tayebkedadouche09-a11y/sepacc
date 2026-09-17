import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useLocale, type Locale } from "@/contexts/LocaleContext";
import SkyToggle from "@/components/SkyToggle";
import WeatherToggle from "@/components/WeatherToggle";
import AmbientToggle from "@/components/AmbientToggle";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
  { id: "ar", label: "ع" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-50 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
      <div className="absolute inset-0 -z-10 border-b border-white/8 bg-[#040b16]/75 backdrop-blur-xl" />
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/[0.04] text-sm font-bold transition-transform group-hover:rotate-12">
          N
        </span>
        <span className="font-mono text-sm tracking-[0.3em]">NUMI</span>
      </Link>

      <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 md:flex">
        <a href="/#collection" className="transition-colors hover:text-white">{t("nav_collection")}</a>
        <a href="/#principles" className="transition-colors hover:text-white">{t("nav_approach")}</a>
        <a href="/#delivery" className="transition-colors hover:text-white">{t("nav_handover")}</a>
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <SkyToggle />
        <WeatherToggle />
        <AmbientToggle />
        <div className="flex items-center rounded-full border border-white/12 bg-white/[0.03] p-0.5">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocale(l.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide transition ${
                locale === l.id ? "bg-white/15 text-white" : "text-white/45 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {isAuthenticated ? (
          <Link
            href={user?.role === "admin" ? "/admin" : "/account"}
            className="flex items-center gap-2 text-xs text-white/65 transition-colors hover:text-white"
          >
            <UserRound size={15} />
            {user?.role === "admin" ? t("owner_space") : t("my_space")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => startLogin()}
            className="flex items-center gap-2 text-xs text-white/65 transition-colors hover:text-white"
          >
            <UserRound size={15} /> {t("sign_in")}
          </button>
        )}
        <a
          href="/#collection"
          className="group flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold transition-all hover:border-white/50 hover:bg-white/10"
        >
          {t("explore")}
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      <button
        type="button"
        aria-label="Toggle navigation"
        className="rounded-full border border-white/15 p-2 md:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-[72px] rounded-2xl border border-white/15 bg-[#0a1628]/95 p-5 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="mb-4 flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLocale(l.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  locale === l.id ? "bg-white/15 text-white" : "text-white/50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-sm text-white/75">
            <a href="/#collection" onClick={() => setOpen(false)}>{t("nav_collection")}</a>
            <a href="/#principles" onClick={() => setOpen(false)}>{t("nav_approach")}</a>
            <a href="/#delivery" onClick={() => setOpen(false)}>{t("nav_handover")}</a>
            {isAuthenticated ? (
              <Link href={user?.role === "admin" ? "/admin" : "/account"} onClick={() => setOpen(false)}>
                {user?.role === "admin" ? t("owner_space") : t("my_space")}
              </Link>
            ) : (
              <button type="button" className="text-left" onClick={() => startLogin()}>
                {t("sign_in")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
