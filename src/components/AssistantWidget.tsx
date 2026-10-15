"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AssistantChat } from "./AssistantChat";
import { useT } from "@/hooks/useT";

// أيقونة المساعد العائمة: زر متحرك يفتح لوحة المحادثة، مناسبة للهاتف والحاسوب.
export function AssistantWidget() {
  const pathname = usePathname();
  const { t } = useT();
  const [open, setOpen] = useState(false);

  // إغلاق تلقائي عند تغيير الصفحة، وعدم الظهور في صفحة المساعد المخصّصة.
  useEffect(() => {
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  if (pathname === "/assistant") return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t("nav.assistant")}
          title={t("nav.assistant")}
          className="assistant-fab fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-xl ring-4 ring-emerald-500/20 transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
        >
          <span aria-hidden>🤖</span>
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 animate-ping rounded-full bg-emerald-400" />
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="assistant-pop relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 shadow-2xl dark:bg-slate-950 sm:h-[80vh] sm:max-h-[720px] sm:w-[400px] sm:rounded-3xl sm:border sm:border-slate-200 sm:dark:border-slate-800">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 font-bold">
                <span aria-hidden>🤖</span>
                {t("nav.assistant")}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("common.cancel")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </header>
            <div className="flex-1 min-h-0 overflow-hidden p-3">
              <AssistantChat variant="widget" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
