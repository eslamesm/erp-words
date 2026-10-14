import { WORDS } from "@/data/words";
import type { Word } from "@/types";
import { dayKey, weekKey } from "@/lib/dates";

export const DAILY_SIZE = 8;
export const WEEKLY_SIZE = 12;

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// نفس التحدي لكل المستخدمين في نفس اليوم (توليد حتمي حسب التاريخ).
export function dailyWords(): Word[] {
  const rnd = mulberry32(hash(dayKey(0)));
  const arr = [...WORDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, DAILY_SIZE);
}

// كلمة اليوم — واحدة، حتمية حسب التاريخ (تُستدعى على العميل).
export function wordOfTheDay(): Word {
  return WORDS[hash(dayKey(0)) % WORDS.length];
}

// تحدٍّ أسبوعي — مجموعة أكبر تتغيّر كل أسبوع.
export function weeklyWords(count = WEEKLY_SIZE): Word[] {
  const rnd = mulberry32(hash(weekKey(0)));
  const arr = [...WORDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}