"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { normalizeLang } from "@/lib/i18n";

// يضبط لغة واتجاه الصفحة (html lang + dir) حسب إعداد لغة التطبيق.
export function LanguageProvider() {
  const { settings } = useProgress();
  const lang = normalizeLang(settings?.language);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return null;
}
