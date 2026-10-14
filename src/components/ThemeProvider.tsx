"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";

// يطبّق الوضع الليلي/النهاري حسب الإعداد (النظام/فاتح/داكن) بإضافة/إزالة
// صنف "dark" على عنصر html. ملاحظة: النص المضمّن في layout يمنع وميض السمة
// قبل تحميل JavaScript.
export function ThemeProvider() {
  const { settings } = useProgress();
  const theme = settings?.theme ?? "system";

  useEffect(() => {
    const el = document.documentElement;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");

    const apply = (resolved: boolean) => {
      el.classList.toggle("dark", resolved);
      // يحدّث قيمة meta theme-color ليتناسب مع الخلفية
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", resolved ? "#020617" : "#059669");
    };

    if (theme === "dark") {
      apply(true);
      return;
    }
    if (theme === "light") {
      apply(false);
      return;
    }
    const update = () => apply(mq.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, [theme]);

  return null;
}