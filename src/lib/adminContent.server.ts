import { MODULES } from "@/data/modules";
import { SUB_MODULES } from "@/data/subModules";
import { VOCABULARY_CATEGORIES } from "@/data/vocabularyCategories";
import { WORDS } from "@/data/words";
import { reviewCounts } from "@/lib/contentAdmin";
import { validateContent } from "@/lib/contentValidation";
import type { AdminContentData } from "@/lib/adminContentTypes";

/**
 * Builds the admin-only payload on the server. This module is imported by the
 * server page, never by the client component, so content and validation data
 * are only serialized after the authorization gate succeeds.
 */
export function getAdminContentData(): AdminContentData {
  return {
    words: WORDS,
    modules: MODULES.map(({ id, labelAr, icon }) => ({ id, labelAr, icon })),
    subModules: SUB_MODULES.map(({ id, moduleId, labelAr }) => ({
      id,
      moduleId,
      labelAr,
    })),
    categories: VOCABULARY_CATEGORIES.map(({ id, labelAr, icon }) => ({
      id,
      labelAr,
      icon,
    })),
    counts: reviewCounts(WORDS),
    warnings: validateContent().warnings,
  };
}
