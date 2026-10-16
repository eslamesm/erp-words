"use client";

import React from "react";
import { Logo, LogoMark } from "./Logo";
import { IconBell, IconChat, IconBook, IconTarget, IconTranslate, IconMic } from "./icons";
import { DICTS } from "@/lib/i18n";
import { useT } from "@/hooks/useT";

type FeatureId = "smart" | "erp" | "interview" | "lang" | "voice";

const FEATURES: { id: FeatureId; cls: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "smart", cls: "bg-blue", Icon: IconChat },
  { id: "erp", cls: "bg-green", Icon: IconBook },
  { id: "interview", cls: "bg-purple", Icon: IconTarget },
  { id: "lang", cls: "bg-blue", Icon: IconTranslate },
  { id: "voice", cls: "bg-purple", Icon: IconMic },
];

export function HomeScreen({
  onStartChat,
  onFeature,
  showHeader = true,
  children,
}: {
  onStartChat: () => void;
  onFeature?: (id: FeatureId) => void;
  showHeader?: boolean;
  children?: React.ReactNode;
}) {
  const { t, lang } = useT();
  const primary = (id: FeatureId) => t(`ui.feature.${id}`);
  const secondary = (id: FeatureId) => (lang === "ar" ? DICTS.en[`ui.feature.${id}`] : "");

  return (
    <div className="erp-app erp-app--embed">
      <div className="erp-screen erp-screen--flush">
        {showHeader && (
          <header className="topbar">
            <Logo variant="compact" tagline={t("ui.appTagline")} />
            <button className="icon-btn" aria-label="Notifications"><IconBell /></button>
          </header>
        )}

        <section className="card welcome">
          <div>
            <h2>{t("ui.welcomeTitle")}</h2>
            <p>{t("ui.welcomeBody")}</p>
          </div>
          <LogoMark size={96} />
        </section>

        <section className="card quote" aria-label="Quote">
          <q>{`\u201C${t("ui.quoteEn")}\u201D`}</q>
          {t("ui.quoteAr") && <small>{t("ui.quoteAr")}</small>}
        </section>

        <button className="btn btn--primary" onClick={onStartChat}>
          {t("brand.startChat")} <IconChat size={20} />
        </button>

        <section className="features" aria-label="Features">
          {FEATURES.map(({ id, cls, Icon }) => (
            <button
              key={id}
              className="feature"
              onClick={() => onFeature?.(id)}
              style={{ font: "inherit", cursor: "pointer", textAlign: "inherit" }}
            >
              <span className={`feature__icon ${cls}`}><Icon size={24} /></span>
              <span>
                <span className="feature__ar" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>{primary(id)}</span>
                {secondary(id) && <span className="feature__en">{secondary(id)}</span>}
              </span>
            </button>
          ))}
        </section>

        {children}
      </div>
    </div>
  );
}
