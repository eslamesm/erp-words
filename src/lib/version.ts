"use client";

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";

export interface ReleaseNotes {
  ar?: string[];
  en?: string[];
}

export interface UpdateInfo {
  version: string;
  buildTime?: string;
  notes?: ReleaseNotes;
}

// يجلب أحدث إصدار منشور من نقطة /api/version الديناميكية (بدون كاش).
// ملاحظة: كان الاعتماد على /version.json (ملف ثابت) يفشل لأن CDN يخزّنه فيقدِّم إصدارًا قديمًا.
export async function fetchLatestVersion(): Promise<UpdateInfo | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`/api/version?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as UpdateInfo;
    if (!data || typeof data.version !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

export function isNewer(latest?: string | null, current: string = APP_VERSION): boolean {
  return Boolean(latest) && latest !== current;
}

// تطبيق التحديث: يمسح الكاش ويلغي الـ service worker القديم ثم يعيد التحميل بعنوان
// جديد (query فريد) لتجاوز أي كاش وسيط، لضمان جلب أحدث نسخة على الأجهزة المثبّتة (PWA).
export async function applyUpdate(): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
  } catch {
    // تجاهل
  }
  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    // تجاهل
  }
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // تجاهل
  }
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("v", Date.now().toString(36));
    window.location.replace(url.toString());
  }
}
