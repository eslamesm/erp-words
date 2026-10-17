import { MODULES, MODULE_IDS, MODULE_MAP, ERP_MODULES, CATEGORY_MODULES } from "@/data/modules";
import { SUB_MODULES, SUB_MODULE_MAP } from "@/data/subModules";
import { BUSINESS_FUNCTIONS } from "@/data/businessFunctions";
import { CATEGORY_ID_SET } from "@/data/vocabularyCategories";
import { WORDS } from "@/data/words";
import { WORD_CLASSIFICATION } from "@/data/wordClassification";
import { GLOSSARY_PACKS, type GlossaryPack } from "@/data/glossaries";
import { glossaryTermId } from "@/data/glossary/types";
import type { Level } from "@/types";

export interface ValidationIssue {
  code: string;
  message: string;
  id?: string;
}

export interface ValidationStats {
  modules: number;
  erpModules: number;
  categoryModules: number;
  subModules: number;
  businessFunctions: number;
  categories: number;
  words: number;
  wordsByModule: Record<string, number>;
  wordsByCategory: Record<string, number>;
  // تمييز التصنيف المُراجَع يدويًا عن الآلي.
  wordsReviewed: number;
  wordsAuto: number;
  unusedOverrides: number;
  glossaryPacks: number;
  glossaryTerms: number;
}

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: ValidationStats;
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export interface ValidationInput {
  modules?: typeof MODULES;
  subModules?: typeof SUB_MODULES;
  businessFunctions?: typeof BUSINESS_FUNCTIONS;
  words?: typeof WORDS;
  glossaryPacks?: GlossaryPack[];
}

// يفحص سلامة مخطط المحتوى (Modules → SubModules → Business Functions → Vocabulary).
export function validateContent(input: ValidationInput = {}): ValidationReport {
  const modules = input.modules ?? MODULES;
  const subModules = input.subModules ?? SUB_MODULES;
  const businessFunctions = input.businessFunctions ?? BUSINESS_FUNCTIONS;
  const words = input.words ?? WORDS;
  const packs = input.glossaryPacks ?? GLOSSARY_PACKS;

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // الوحدات
  for (const id of findDuplicates(modules.map((m) => m.id))) {
    errors.push({ code: "duplicate-module", id, message: `معرّف وحدة مكرر: ${id}` });
  }
  for (const m of modules) {
    if (!nonEmpty(m.labelAr)) errors.push({ code: "module-label-ar", id: m.id, message: `وحدة بلا عنوان عربي: ${m.id}` });
    if (!nonEmpty(m.labelEn)) errors.push({ code: "module-label-en", id: m.id, message: `وحدة بلا عنوان إنجليزي: ${m.id}` });
  }

  const moduleIdSet = new Set<string>(modules.map((m) => m.id));
  const subModuleMap = new Map(subModules.map((s) => [s.id, s]));

  // الوحدات الفرعية
  for (const id of findDuplicates(subModules.map((s) => s.id))) {
    errors.push({ code: "duplicate-submodule", id, message: `معرّف وحدة فرعية مكرر: ${id}` });
  }
  for (const s of subModules) {
    if (!moduleIdSet.has(s.moduleId)) {
      errors.push({ code: "submodule-bad-module", id: s.id, message: `وحدة فرعية ${s.id} مرتبطة بوحدة غير موجودة: ${s.moduleId}` });
    }
    if (!nonEmpty(s.labelAr) || !nonEmpty(s.labelEn)) {
      errors.push({ code: "submodule-label", id: s.id, message: `وحدة فرعية بلا عنوان: ${s.id}` });
    }
  }

  // الوظائف التجارية
  const functionIdSet = new Set<string>();
  for (const id of findDuplicates(businessFunctions.map((f) => f.id))) {
    errors.push({ code: "duplicate-function", id, message: `معرّف وظيفة مكرر: ${id}` });
  }
  for (const f of businessFunctions) {
    functionIdSet.add(f.id);
    const parent = subModuleMap.get(f.subModuleId);
    if (!parent) {
      errors.push({ code: "function-bad-submodule", id: f.id, message: `وظيفة ${f.id} مرتبطة بوحدة فرعية غير موجودة: ${f.subModuleId}` });
    } else if (parent.moduleId !== f.moduleId) {
      errors.push({ code: "function-module-mismatch", id: f.id, message: `وحدة الوظيفة ${f.id} (${f.moduleId}) لا تطابق وحدة الوحدة الفرعية (${parent.moduleId})` });
    }
  }

  // المفردات
  for (const id of findDuplicates(words.map((w) => w.id))) {
    errors.push({ code: "duplicate-word", id, message: `معرّف مصطلح مكرر: ${id}` });
  }
  const wordsByModule: Record<string, number> = {};
  const wordsByCategory: Record<string, number> = {};
  let wordsReviewed = 0;
  let wordsAuto = 0;
  for (const w of words) {
    wordsByModule[w.module] = (wordsByModule[w.module] ?? 0) + 1;
    wordsByCategory[w.category ?? "?"] = (wordsByCategory[w.category ?? "?"] ?? 0) + 1;
    if (w.reviewStatus === "reviewed") wordsReviewed += 1;
    else wordsAuto += 1;

    if (!moduleIdSet.has(w.module)) {
      errors.push({ code: "word-bad-module", id: w.id, message: `مصطلح ${w.id} بوحدة غير موجودة: ${w.module}` });
    }
    if (!nonEmpty(w.english)) errors.push({ code: "word-english", id: w.id, message: `مصطلح بلا نص إنجليزي: ${w.id}` });
    if (!LEVELS.includes(w.level)) {
      errors.push({ code: "word-level", id: w.id, message: `مستوى غير صالح للمصطلح ${w.id}: ${w.level}` });
    }
    if (w.status === "published" && !nonEmpty(w.arabic)) {
      errors.push({ code: "word-arabic", id: w.id, message: `مصطلح منشور بلا ترجمة عربية: ${w.id}` });
    }
    if (w.category && !CATEGORY_ID_SET.has(w.category)) {
      errors.push({ code: "word-category", id: w.id, message: `نوع مصطلح غير صالح: ${w.id} → ${w.category}` });
    }
    if (w.subModuleId) {
      const parent = subModuleMap.get(w.subModuleId);
      if (!parent) {
        errors.push({ code: "word-bad-submodule", id: w.id, message: `مصطلح ${w.id} بوحدة فرعية غير موجودة: ${w.subModuleId}` });
      } else if (parent.moduleId !== w.module) {
        errors.push({ code: "word-submodule-mismatch", id: w.id, message: `وحدة الفرعية للمصطلح ${w.id} (${parent.moduleId}) لا تطابق وحدته (${w.module})` });
      }
    }
    if (w.businessFunctionId && !functionIdSet.has(w.businessFunctionId)) {
      errors.push({ code: "word-bad-function", id: w.id, message: `مصطلح ${w.id} بوظيفة غير موجودة: ${w.businessFunctionId}` });
    }
    if (!nonEmpty(w.definitionAr) && !nonEmpty(w.definitionEn)) {
      warnings.push({ code: "word-no-definition", id: w.id, message: `مصطلح بلا تعريف: ${w.id}` });
    }
  }

  // تحذيرات مستقلة: تصنيفات يدوية (WORD_CLASSIFICATION) لا تطابق أي مصطلح حالي.
  // لا حذف — تُرصد فقط للمراجعة المستقبلية (قد تكون مصطلحات مخطّطة).
  const wordIdSet = new Set(words.map((w) => w.id));
  const unusedOverrides = Object.keys(WORD_CLASSIFICATION).filter((id) => !wordIdSet.has(id));
  for (const id of unusedOverrides) {
    warnings.push({ code: "unused-override", id, message: `تصنيف يدوي بلا مصطلح مطابق (غير مستخدم): ${id}` });
  }

  // مسرد المصطلحات (Glossary)
  let glossaryTerms = 0;
  for (const pack of packs) {
    if (!pack.id) errors.push({ code: "pack-id", message: "حزمة مسرد بلا معرّف" });
    if (pack.moduleId && !moduleIdSet.has(pack.moduleId)) {
      errors.push({ code: "pack-bad-module", id: pack.id, message: `حزمة مسرد ${pack.id} بوحدة غير موجودة: ${pack.moduleId}` });
    }
    if (pack.subModuleId) {
      const parent = subModuleMap.get(pack.subModuleId);
      if (!parent) {
        errors.push({ code: "pack-bad-submodule", id: pack.id, message: `حزمة مسرد ${pack.id} بوحدة فرعية غير موجودة: ${pack.subModuleId}` });
      } else if (pack.moduleId && parent.moduleId !== pack.moduleId) {
        errors.push({ code: "pack-submodule-mismatch", id: pack.id, message: `الوحدة الفرعية لحزمة ${pack.id} (${parent.moduleId}) لا تطابق وحدتها (${pack.moduleId})` });
      }
    }
    for (const id of findDuplicates(pack.terms.map((t) => glossaryTermId(t)))) {
      errors.push({ code: "duplicate-glossary-term", id, message: `معرّف مصطلح مسرد مكرر داخل الحزمة ${pack.id}: ${id}` });
    }
    for (const t of pack.terms) {
      glossaryTerms += 1;
      const tid = glossaryTermId(t);
      if (!nonEmpty(t.en)) errors.push({ code: "glossary-term-en", id: tid, message: `مصطلح مسرد بلا نص إنجليزي في ${pack.id}` });
      if (t.moduleId && !moduleIdSet.has(t.moduleId)) {
        errors.push({ code: "glossary-bad-module", id: tid, message: `مصطلح مسرد ${tid} بوحدة غير موجودة: ${t.moduleId}` });
      }
      if (t.subModuleId && !subModuleMap.has(t.subModuleId)) {
        errors.push({ code: "glossary-bad-submodule", id: tid, message: `مصطلح مسرد ${tid} بوحدة فرعية غير موجودة: ${t.subModuleId}` });
      }
      if (t.category && !CATEGORY_ID_SET.has(t.category)) {
        errors.push({ code: "glossary-bad-category", id: tid, message: `نوع مصطلح مسرد غير صالح: ${tid}` });
      }
    }
  }

  return {
    errors,
    warnings,
    stats: {
      modules: modules.length,
      erpModules: ERP_MODULES.length,
      categoryModules: CATEGORY_MODULES.length,
      subModules: subModules.length,
      businessFunctions: businessFunctions.length,
      categories: CATEGORY_ID_SET.size,
      words: words.length,
      wordsByModule,
      wordsByCategory,
      wordsReviewed,
      wordsAuto,
      unusedOverrides: unusedOverrides.length,
      glossaryPacks: packs.length,
      glossaryTerms,
    },
  };
}

export function formatReport(report: ValidationReport): string {
  const { stats, errors, warnings } = report;
  const lines: string[] = [];
  lines.push(`Modules: ${stats.modules} (erp=${stats.erpModules}, category=${stats.categoryModules})`);
  lines.push(`SubModules: ${stats.subModules}`);
  lines.push(`BusinessFunctions: ${stats.businessFunctions}`);
  lines.push(`Categories: ${stats.categories}`);
  lines.push(`Words: ${stats.words}`);
  lines.push(`Classification: reviewed=${stats.wordsReviewed}, auto=${stats.wordsAuto}`);
  lines.push(`Unused overrides: ${stats.unusedOverrides}`);
  lines.push(`Glossary: ${stats.glossaryPacks} packs / ${stats.glossaryTerms} terms`);
  lines.push(`Errors: ${errors.length}`);
  lines.push(`Warnings: ${warnings.length}`);
  return lines.join("\n");
}

export const __internals = { findDuplicates, moduleIdSet: MODULE_IDS, moduleMap: MODULE_MAP, subModuleMap: SUB_MODULE_MAP };
