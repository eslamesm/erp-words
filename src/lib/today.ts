"use client";

import { useSyncExternalStore } from "react";
import { dayKey, weekKey } from "@/lib/dates";
import { wordOfTheDay } from "@/lib/daily";
import type { Word } from "@/types";

// متجر "اليوم الحالي" — يُقرأ فقط على العميل، والقيمة على الخادم فارغة
// لتجنّب استخدام الوقت الحالي أثناء التوليد المسبق (prerender).
let cached = "";
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function refresh() {
  const next = dayKey(0);
  if (next !== cached) {
    cached = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    if (!cached) cached = dayKey(0);
    timer = setInterval(refresh, 30000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): string {
  if (!cached) cached = dayKey(0);
  return cached;
}

function getServerSnapshot(): string {
  return "";
}

export function useTodayKey(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// متجر مفتاح الأسبوع — نفس النمط لتجنّب الوقت الحالي أثناء التوليد المسبق.
let cachedWeek = "";
const weekListeners = new Set<() => void>();
let weekTimer: ReturnType<typeof setInterval> | null = null;

function refreshWeek() {
  const next = weekKey(0);
  if (next !== cachedWeek) {
    cachedWeek = next;
    weekListeners.forEach((l) => l());
  }
}

function subscribeWeek(cb: () => void) {
  weekListeners.add(cb);
  if (weekListeners.size === 1) {
    if (!cachedWeek) cachedWeek = weekKey(0);
    weekTimer = setInterval(refreshWeek, 60000);
  }
  return () => {
    weekListeners.delete(cb);
    if (weekListeners.size === 0 && weekTimer) {
      clearInterval(weekTimer);
      weekTimer = null;
    }
  };
}

function getWeekSnapshot(): string {
  if (!cachedWeek) cachedWeek = weekKey(0);
  return cachedWeek;
}

function getWeekServerSnapshot(): string {
  return "";
}

export function useWeekKey(): string {
  return useSyncExternalStore(subscribeWeek, getWeekSnapshot, getWeekServerSnapshot);
}

// كلمة اليوم — تُقرأ على العميل فقط، والقيمة على الخادم null لتجنّب التوليد المسبق.
let cachedWotd: Word | null = null;
let cachedWotdDay = "";

function getWotdSnapshot(): Word | null {
  const k = getSnapshot();
  if (k !== cachedWotdDay) {
    cachedWotdDay = k;
    cachedWotd = k ? wordOfTheDay() : null;
  }
  return cachedWotd;
}

function getWotdServerSnapshot(): Word | null {
  return null;
}

export function useWordOfTheDay(): Word | null {
  return useSyncExternalStore(subscribe, getWotdSnapshot, getWotdServerSnapshot);
}
