import type { ModuleId, VocabularyCategory, Word } from "@/types";
import type { ReviewCounts } from "@/lib/contentAdmin";
import type { ValidationIssue } from "@/lib/contentValidation";

export interface AdminModuleOption {
  id: ModuleId;
  labelAr: string;
  icon: string;
}

export interface AdminSubModuleOption {
  id: string;
  moduleId: ModuleId;
  labelAr: string;
}

export interface AdminCategoryOption {
  id: VocabularyCategory;
  labelAr: string;
  icon: string;
}

/**
 * DTO delivered to the admin UI only after the server gate has authorized the
 * request. The client component must never import content data directly.
 */
export interface AdminContentData {
  words: Word[];
  modules: AdminModuleOption[];
  subModules: AdminSubModuleOption[];
  categories: AdminCategoryOption[];
  counts: ReviewCounts;
  warnings: ValidationIssue[];
}
