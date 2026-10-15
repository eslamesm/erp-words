"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallButton } from "./InstallButton";
import { BrandMark } from "./BrandMark";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

interface NavItem {
  href: string;
  key: string;
  icon: string;
}

// القائمة الرئيسية الجديدة (10 أقسام)
const LINKS: NavItem[] = [
  { href: "/", key: "nav.home", icon: "🏠" },
  { href: "/lesson", key: "nav.lesson", icon: "🎓" },
  { href: "/vocabulary", key: "nav.vocabulary", icon: "📚" },
  { href: "/conversations", key: "nav.conversations", icon: "💬" },
  { href: "/paths", key: "nav.paths", icon: "🧭" },
  { href: "/pronounce", key: "nav.pronounce", icon: "🗣️" },
  { href: "/games", key: "nav.games", icon: "🎮" },
  { href: "/assistant", key: "nav.assistant", icon: "🤖" },
  { href: "/achievements", key: "nav.achievements", icon: "🏆" },
  { href: "/settings", key: "nav.settings", icon: "⚙️" },
];

// الأيقونات الظاهرة في الشريط السفلي على الموبايل (الباقي داخل قائمة «المزيد»)
const PRIMARY = new Set(["/", "/lesson", "/vocabulary", "/conversations"]);

export function Nav() {
  const pathname = usePathname();
  const { t } = useT();
  const { profile } = useProgress();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const primaryLinks = LINKS.filter((l) => PRIMARY.has(l.href));
  const moreLinks = LINKS.filter((l) => !PRIMARY.has(l.href));
  const moreActive = moreLinks.some((l) => isActive(l.href));

  return (
    <>
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-3xl px-3 pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <BrandMark size={26} withBackground />
              <span>{t("common.appName")}</span>
            </Link>
            <div className="flex items-center gap-2">
              <InstallButton compact />
              {profile && (
                <Link href="/settings" aria-label={t("nav.settings")}>
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {profile.name.charAt(0)}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
          <div className="no-scrollbar -mx-1 hidden items-center gap-1 overflow-x-auto pb-2 pt-1.5 text-sm sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors ${
                  isActive(l.href)
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`}
              >
                <span className="ml-1">{l.icon}</span>
                {t(l.key)}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-slate-200 bg-white p-5 pb-8 dark:border-slate-800 dark:bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              {t("nav.more")}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {moreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-semibold transition-colors ${
                    isActive(l.href)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-2xl">{l.icon}</span>
                  {t(l.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          {primaryLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
                isActive(l.href)
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="text-lg">{l.icon}</span>
              {t(l.key)}
            </Link>
          ))}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
              moreOpen || moreActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span className="text-lg">{moreOpen ? "✕" : "⋯"}</span>
            {t("nav.more")}
          </button>
        </div>
      </nav>
    </>
  );
}
