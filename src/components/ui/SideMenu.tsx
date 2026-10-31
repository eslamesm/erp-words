"use client";

import React from "react";
import { Logo } from "./Logo";
import { IconHome, IconChat, IconBook, IconTarget, IconSettings, IconInfo, IconGlobe } from "./icons";
import { useT } from "@/hooks/useT";
import type { Lang } from "@/lib/i18n";

export type MenuId = "home" | "chats" | "terms" | "interviews" | "practice" | "settings" | "about";

type Props = {
  open: boolean;
  lang: Lang;
  active: MenuId;
  onSelect: (id: MenuId) => void;
  onClose: () => void;
  onLangChange: (l: Lang) => void;
};

export function SideMenu({ open, lang, active, onSelect, onClose, onLangChange }: Props) {
  const { t } = useT();
  const items: { id: MenuId; Icon: React.FC<{ size?: number }> }[] = [
    { id: "home", Icon: IconHome },
    { id: "chats", Icon: IconChat },
    { id: "terms", Icon: IconBook },
    { id: "interviews", Icon: IconTarget },
    { id: "practice", Icon: IconTarget },
    { id: "settings", Icon: IconSettings },
    { id: "about", Icon: IconInfo },
  ];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <button type="button" className="drawer-backdrop drawer-backdrop--close" onClick={onClose} aria-label="Close menu" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <Logo variant="compact" />
        <nav>
          {items.map(({ id, Icon }) => (
            <button
              key={id}
              className="drawer__item"
              aria-current={active === id ? "page" : undefined}
              onClick={() => { onSelect(id); onClose(); }}
            >
              <Icon size={22} /> {t(`ui.menu.${id}`)}
            </button>
          ))}
        </nav>
        <label style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <IconGlobe size={20} />
          <select value={lang} onChange={(e) => onLangChange(e.target.value as Lang)} aria-label="Language">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
      </aside>
    </>
  );
}
