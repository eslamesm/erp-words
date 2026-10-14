"use client";

import { useProgress } from "@/hooks/useProgress";
import { normalizeLang, translate, type Lang } from "@/lib/i18n";

// hook للترجمة داخل المكوّنات: يعيد دالة t + اللغة الحالية + الاتجاه.
export function useT() {
  const { settings } = useProgress();
  const lang: Lang = normalizeLang(settings?.language);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  return { t, lang, dir };
}
