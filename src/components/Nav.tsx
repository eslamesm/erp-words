"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InstallButton } from "./InstallButton";
import { Logo } from "./ui/Logo";
import { BottomNav, type Tab } from "./ui/BottomNav";
import { SideMenu, type MenuId } from "./ui/SideMenu";
import { IconMenu } from "./ui/icons";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";
import type { Lang } from "@/lib/i18n";

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

const TAB_HREF: Record<Tab, string> = {
  home: "/",
  learn: "/lesson",
  practice: "/games",
  profile: "/achievements",
};

const MENU_HREF: Record<MenuId, string> = {
  home: "/",
  chats: "/conversations",
  terms: "/vocabulary",
  interviews: "/paths",
  practice: "/games",
  settings: "/settings",
  about: "/about",
};

function tabFor(pathname: string): Tab {
  if (pathname.startsWith("/lesson") || pathname.startsWith("/vocabulary") || pathname.startsWith("/words") || pathname.startsWith("/paths")) return "learn";
  if (pathname.startsWith("/games") || pathname.startsWith("/pronounce") || pathname.startsWith("/quiz") || pathname.startsWith("/daily")) return "practice";
  if (pathname.startsWith("/achievements") || pathname.startsWith("/settings") || pathname.startsWith("/progress")) return "profile";
  return "home";
}

function menuFor(pathname: string): MenuId {
  if (pathname.startsWith("/conversations")) return "chats";
  if (pathname.startsWith("/vocabulary")) return "terms";
  if (pathname.startsWith("/paths")) return "interviews";
  if (pathname.startsWith("/games")) return "practice";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/about")) return "about";
  return "home";
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useT();
  const { profile, settings, updateSettings } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      <nav className="topnav sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-3xl px-3 pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label={t("nav.more")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <IconMenu size={22} />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <Logo variant="compact" tagline={t("ui.appTagline")} />
              </Link>
            </div>
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
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`flex items-center rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors ${
                  isActive(l.href)
                    ? "bg-[var(--navy)] text-white dark:bg-[var(--blue)] dark:text-white"
                    : "text-[var(--muted)] hover:bg-[var(--tint)] dark:text-[var(--muted)] dark:hover:bg-[var(--tint-2)]"
                }`}
              >
                <span className="ml-1">{l.icon}</span>
                {t(l.key)}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <SideMenu
        open={menuOpen}
        lang={lang as Lang}
        active={menuFor(pathname)}
        onSelect={(id) => router.push(MENU_HREF[id])}
        onClose={() => setMenuOpen(false)}
        onLangChange={(l) => updateSettings({ ...settings, language: l })}
      />

      <BottomNav tab={tabFor(pathname)} onChange={(tab) => router.push(TAB_HREF[tab])} />
    </>
  );
}
