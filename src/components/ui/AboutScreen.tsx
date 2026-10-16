"use client";

import React from "react";
import { Logo } from "./Logo";
import { IconBack } from "./icons";
import { DICTS } from "@/lib/i18n";
import { useT } from "@/hooks/useT";

export function AboutScreen({ version, onBack }: { version: string; onBack: () => void }) {
  const { t } = useT();
  const ar = DICTS.ar["brand.blurb"];
  const en = DICTS.en["brand.blurb"];

  return (
    <div className="erp-app erp-app--embed">
      <header className="topbar" style={{ padding: "8px 8px 0" }}>
        <button className="icon-btn" aria-label={t("about.back")} onClick={onBack}><IconBack /></button>
        <b>{t("about.title")}</b>
        <span style={{ width: 44 }} />
      </header>

      <div className="erp-screen about erp-screen--flush">
        <Logo variant="full" tagline={t("ui.appTagline")} />
        <section className="about__card">
          <h3>{t("about.blurbTitle")}</h3>
          {ar && <p style={{ margin: 0 }} lang="ar" dir="rtl">{ar}</p>}
          {ar && en && <hr />}
          {en && <p className="about__en" style={{ margin: 0 }} lang="en" dir="ltr">{en}</p>}
        </section>
        <p className="about__ver">{t("about.versionLabel")} {version}</p>
      </div>
    </div>
  );
}
