import type { Rating, WordProgress } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

export function newProgress(wordId: string): WordProgress {
  return {
    wordId,
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
    correctCount: 0,
    wrongCount: 0,
  };
}

// نظام التكرار المتباعد مبسط من خوارزمية SM-2
export function applyRating(p: WordProgress, rating: Rating): WordProgress {
  const now = Date.now();
  const base: Record<Rating, { factor: number; intervalInDays: number }> = {
    again: { factor: 0, intervalInDays: 0 },
    hard: { factor: 1.2, intervalInDays: 1 },
    good: { factor: 2.5, intervalInDays: 4 },
    easy: { factor: 3.0, intervalInDays: 8 },
  };
  const b = base[rating];

  let ease = p.ease;
  let interval = p.interval;
  let reps = p.reps + 1;
  let lapses = p.lapses;

  if (rating === "again") {
    // إعادة التعلّم: نبدأ من جديد
    ease = Math.max(1.3, p.ease - 0.2);
    interval = 0;
    reps = 0;
    lapses += 1;
  } else {
    ease = Math.max(1.3, p.ease + (b.factor - 2.5) * 0.1);
    if (reps <= 1) {
      interval = b.intervalInDays;
    } else if (reps === 2) {
      interval = 6;
    } else {
      interval = Math.round((p.interval || 1) * ease);
    }
    if (rating === "hard") {
      interval = Math.max(1, Math.min(interval, p.interval || 0));
    }
  }

  return {
    ...p,
    ease: Number(ease.toFixed(2)),
    interval,
    due: now + interval * DAY,
    reps,
    lapses,
    lastReviewed: now,
    correctCount: rating === "again" ? p.correctCount : p.correctCount + 1,
    wrongCount: rating === "again" ? p.wrongCount + 1 : p.wrongCount,
  };
}

export function daysUntilDue(p: WordProgress): number {
  return Math.ceil((p.due - Date.now()) / DAY);
}

export function isDue(p: WordProgress): boolean {
  return p.due <= Date.now();
}

export function progressLabel(p: WordProgress): string {
  if (p.reps === 0) return "جديد";
  if (p.due > Date.now()) return `بعد ${daysUntilDue(p)} يوم`;
  return "للتعلم اليوم";
}