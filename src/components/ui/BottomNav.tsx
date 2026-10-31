"use client";

import React from "react";
import { IconHome, IconBook, IconTarget, IconUser } from "./icons";
import { useT } from "@/hooks/useT";

export type Tab = "home" | "learn" | "practice" | "profile";

// ربط التبويبات بأقسام التطبيق الحالية:
//  home     → الرئيسية
//  learn    → Career Paths + الدروس + الكلمات
//  practice → Speaking + Games & Challenges + Interview practice
//  profile  → Achievements + Settings
export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const { t } = useT();
  const items: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: "home", label: t("ui.nav.home"), Icon: IconHome },
    { id: "learn", label: t("ui.nav.learn"), Icon: IconBook },
    { id: "practice", label: t("ui.nav.practice"), Icon: IconTarget },
    { id: "profile", label: t("ui.nav.profile"), Icon: IconUser },
  ];
  return (
    <nav className="nav" aria-label="Main">
      {items.map(({ id, label, Icon }) => (
        <button key={id} type="button" className="nav__item" aria-current={tab === id ? "page" : undefined} onClick={() => onChange(id)}>
          <Icon size={24} />
          {label}
        </button>
      ))}
    </nav>
  );
}
