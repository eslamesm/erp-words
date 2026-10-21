import type { Level, ModuleId, VocabularyCategory } from "@/types";

// نموذج Glossary الموسّع (Task 05).
// كل الحقول الجديدة اختيارية للحفاظ على توافق ملفات الـpacks القديمة.
export interface GlossaryTerm {
  id?: string;
  en: string;
  ar: string;
  moduleId?: ModuleId;
  subModuleId?: string;
  category?: VocabularyCategory;
  level?: Level;
  pronunciation?: string;
  definitionEn?: string;
  definitionAr?: string;
  note?: string;
  exampleEn?: string;
  exampleAr?: string;
  relatedTerms?: string[];
}

export interface GlossaryPack {
  id: string;
  icon: string;
  code?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  // وحدة افتراضية اختيارية لكل مصطلحات الـpack (لأغراض التصفية).
  moduleId?: ModuleId;
  // وحدة فرعية افتراضية اختيارية للحزمة.
  // ربط الحزمة لا يمنع أن يكون لكل مصطلح تصنيفه المستقل لاحقًا؛
  // تُستخدم حقول المصطلح (moduleId/subModuleId) إن وُجدت، وإلا يُرثى تصنيف الحزمة.
  subModuleId?: string;
  terms: GlossaryTerm[];
}

// يشتق معرّفًا ثابتًا للمصطلح من نصّه الإنجليزي عند غيابه (توافق خلفي).
export function glossaryTermId(term: GlossaryTerm): string {
  if (term.id) return term.id;
  return term.en
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
