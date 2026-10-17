import type { VocabularyCategory, Word } from "@/types";

// حالة المراجعة المعروضة في أدوات الإدارة (منفصلة عن حالة النشر status).
// "needs-review" محجوزة لحالة مستقبلية — تُرجع صفرًا حاليًا ولا تغيّر النموذج.
export type ReviewFilter = "all" | "reviewed" | "auto" | "needs-review";

export const REVIEW_FILTERS: { id: ReviewFilter; labelAr: string }[] = [
  { id: "all", labelAr: "الكل" },
  { id: "reviewed", labelAr: "مُراجَع" },
  { id: "auto", labelAr: "آلي" },
  { id: "needs-review", labelAr: "يحتاج مراجعة (قادم)" },
];

export interface ContentFilter {
  module?: string;
  subModule?: string;
  category?: VocabularyCategory | "all";
  review?: ReviewFilter;
  query?: string;
}

export function matchesReview(word: Word, filter: ReviewFilter): boolean {
  if (filter === "all") return true;
  if (filter === "needs-review") return (word.reviewStatus as string | undefined) === "needs-review";
  return word.reviewStatus === filter;
}

export function filterWords(words: Word[], f: ContentFilter): Word[] {
  const q = (f.query ?? "").trim().toLowerCase();
  return words.filter((w) => {
    if (f.module && f.module !== "all" && w.module !== f.module) return false;
    if (f.subModule && f.subModule !== "all" && w.subModuleId !== f.subModule) return false;
    if (f.category && f.category !== "all" && w.category !== f.category) return false;
    if (!matchesReview(w, f.review ?? "all")) return false;
    if (q) {
      const text = `${w.id} ${w.english} ${w.arabic} ${w.definitionEn ?? ""} ${w.definitionAr ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

export interface ReviewCounts {
  total: number;
  reviewed: number;
  auto: number;
  needsReview: number;
}

export function reviewCounts(words: Word[]): ReviewCounts {
  let reviewed = 0;
  let auto = 0;
  let needsReview = 0;
  for (const w of words) {
    if (w.reviewStatus === "reviewed") reviewed += 1;
    else if (w.reviewStatus === "auto") auto += 1;
    else needsReview += 1;
  }
  return { total: words.length, reviewed, auto, needsReview };
}
