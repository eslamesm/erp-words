import type { Level, Word, WordProgress, LessonRecord } from "@/types";
import { WORDS } from "@/data/words";

export const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export const LESSON_WORDS = 2;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// كلمتان جديدتان حتميتان لكل يوم حسب مستوى المتعلم (تفضّل الكلمات غير المدروسة)
export function pickLessonWords(
  day: string,
  level: Level,
  progress: Record<string, WordProgress>,
  count = LESSON_WORDS
): Word[] {
  const ui = Math.max(0, LEVEL_ORDER.indexOf(level));
  const atLevel = WORDS.filter((w) => LEVEL_ORDER.indexOf(w.level) <= ui);
  const pool = atLevel.length >= count ? atLevel : WORDS;
  const fresh = pool.filter((w) => !progress[w.id] || progress[w.id].reps === 0);
  const base = fresh.length >= count ? fresh : pool;
  const sorted = [...base].sort((a, b) => (a.id < b.id ? -1 : 1));
  if (sorted.length === 0) return [];
  const seed = hash(day + level) % sorted.length;
  const picked: Word[] = [];
  for (let i = 0; i < count && i < sorted.length; i++) {
    picked.push(sorted[(seed + i) % sorted.length]);
  }
  return picked;
}

export interface QuizQuestion {
  wordId: string;
  prompt: string;
  options: string[];
  answer: string;
}

// اختبار قصير: اختر المعنى العربي الصحيح لكل كلمة
export function buildLessonQuiz(words: Word[], day: string): QuizQuestion[] {
  return words.map((w, idx) => {
    const others = WORDS.filter((x) => x.id !== w.id && x.arabic !== w.arabic);
    const seed = hash(day + w.id + idx);
    const options = new Set<string>([w.arabic]);
    let i = seed;
    while (options.size < 4 && i < seed + others.length * 2 + 8) {
      options.add(others[i % others.length].arabic);
      i++;
    }
    const arr = Array.from(options);
    // ترتيب حتمي للخيارات
    arr.sort((a, b) => (hash(day + a) % 997) - (hash(day + b) % 997));
    return { wordId: w.id, prompt: w.english, options: arr, answer: w.arabic };
  });
}

export function lessonKey(day: string): string {
  return day;
}

export function isLessonDone(rec: LessonRecord | undefined): boolean {
  return !!rec?.done;
}
