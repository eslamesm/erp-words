"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeStandalone(onChange: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getStandalone() {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function subscribeNoop() {
  return () => {};
}

function getIsIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function InstallButton({ compact = false }: { compact?: boolean }) {
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    getStandalone,
    () => false
  );
  const isIOS = useSyncExternalStore(subscribeNoop, getIsIOS, () => false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) return null;
  if (!deferred && !isIOS) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return;
    }
    setShowIosHelp((v) => !v);
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={
          compact
            ? "rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 whitespace-nowrap"
            : "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 whitespace-nowrap"
        }
      >
        📲 تثبيت
      </button>
      {showIosHelp && (
        <div className="absolute left-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          على الآيفون: اضغط زر المشاركة ⬆️ ثم اختر «إضافة إلى الشاشة
          الرئيسية» ➕
        </div>
      )}
    </div>
  );
}
