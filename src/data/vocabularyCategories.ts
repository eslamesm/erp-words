import type { VocabularyCategory } from "@/types";

export interface CategoryMeta {
  id: VocabularyCategory;
  labelAr: string;
  labelEn: string;
  icon: string;
  descAr: string;
  descEn: string;
}

// أنواع المصطلحات (Vocabulary Categories) — Task 04.
export const VOCABULARY_CATEGORIES: CategoryMeta[] = [
  { id: "term", labelAr: "مصطلح عام", labelEn: "Term", icon: "📘", descAr: "مصطلح أعمال أو تقني عام.", descEn: "A general business or technical term." },
  { id: "screen", labelAr: "شاشة", labelEn: "Screen", icon: "🖥️", descAr: "اسم شاشة أو نافذة داخل النظام.", descEn: "A screen or window name in the system." },
  { id: "field", labelAr: "حقل", labelEn: "Field", icon: "🔤", descAr: "اسم حقل إدخال أو بيان.", descEn: "An input or data field name." },
  { id: "button", labelAr: "زر / إجراء", labelEn: "Button", icon: "🔘", descAr: "زر أو أمر تنفيذي في الواجهة.", descEn: "A button or command in the UI." },
  { id: "menu", labelAr: "عنصر قائمة", labelEn: "Menu", icon: "📑", descAr: "عنصر في قائمة أو شريط تنقّل.", descEn: "An item in a menu or navigation bar." },
  { id: "document", labelAr: "مستند", labelEn: "Document", icon: "📄", descAr: "مستند أو سجل رسمي في النظام.", descEn: "A formal document or record in the system." },
  { id: "status", labelAr: "حالة", labelEn: "Status", icon: "🚦", descAr: "حالة مستند أو عملية (مسودة، معتمد…).", descEn: "A document or process status (draft, approved…)." },
  { id: "action", labelAr: "إجراء", labelEn: "Action", icon: "⚡", descAr: "إجراء أو عملية ينفّذها المستخدم.", descEn: "An action or operation a user performs." },
  { id: "report", labelAr: "تقرير", labelEn: "Report", icon: "📊", descAr: "تقرير أو مخرَج تحليلي.", descEn: "A report or analytical output." },
  { id: "error", labelAr: "رسالة خطأ", labelEn: "Error", icon: "⚠️", descAr: "رسالة خطأ أو تحذير في النظام.", descEn: "A system error or warning message." },
  { id: "abbreviation", labelAr: "اختصار", labelEn: "Abbreviation", icon: "🔡", descAr: "اختصار شائع في أنظمة ERP.", descEn: "A common ERP abbreviation." },
];

export const CATEGORY_MAP: Record<VocabularyCategory, CategoryMeta> = VOCABULARY_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<VocabularyCategory, CategoryMeta>
);

export const CATEGORY_IDS = VOCABULARY_CATEGORIES.map((c) => c.id);
export const CATEGORY_ID_SET = new Set<string>(CATEGORY_IDS);

export function categoryMeta(id: VocabularyCategory | undefined): CategoryMeta | undefined {
  return id ? CATEGORY_MAP[id] : undefined;
}

export function categoryLabel(id: VocabularyCategory | undefined, lang: "ar" | "en"): string {
  const c = categoryMeta(id);
  if (!c) return "";
  return lang === "en" ? c.labelEn : c.labelAr;
}
