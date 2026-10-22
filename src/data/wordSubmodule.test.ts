import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { WORDS } from "@/data/words";
import { screenWords } from "@/data/screenWords";
import { SUB_MODULES, SUB_MODULE_MAP } from "@/data/subModules";
import { MODULES } from "@/data/modules";
import { WORD_CLASSIFICATION, WORD_SUBMODULE } from "@/data/wordClassification";

const sub = (id: string) => WORDS.find((w) => w.id === id)?.subModuleId;

const batchASubmoduleMoves = [
  ["petty-cash", "finance-cash"],
  ["cost-center", "finance-cost"],
  ["working-capital", "finance-reporting"],
  ["discount", "sales-pricing"],
  ["commission", "sales-reporting"],
  ["customer", "sales-customers"],
  ["returns", "sales-returns"],
  ["credit-limit", "sales-customers"],
  ["channel", "sales-reporting"],
  ["return-merchandise-auth", "sales-returns"],
  ["upselling", "sales-customers"],
  ["cross-selling", "sales-customers"],
  ["territory", "sales-customers"],
  ["sales-target", "sales-reporting"],
  ["forecast", "sales-reporting"],
  ["three-way-match", "purchasing-vendor-bills"],
  ["contract", "purchasing-agreements"],
  ["blanket-order", "purchasing-agreements"],
  ["standing-offer", "purchasing-agreements"],
  ["supplier-portal", "purchasing-vendors"],
  ["incoterms", "purchasing-agreements"],
  ["open-po", "purchasing-reporting"],
  ["vendor-rating", "purchasing-vendor-comparison"],
  ["price-negotiation", "purchasing-vendors"],
  ["stock", "inventory-on-hand"],
  ["batch", "inventory-lot-serial"],
  ["adjustment", "inventory-adjustments"],
  ["lead-time", "inventory-reordering"],
  ["safety-stock", "inventory-reordering"],
  ["stockout", "inventory-reporting"],
  ["lot-number", "inventory-lot-serial"],
  ["abc-analysis", "inventory-reporting"],
  ["min-max", "inventory-reordering"],
  ["physical-inventory", "inventory-reporting"],
  ["work-order", "manufacturing-work-orders"],
  ["scrap", "manufacturing-scrap"],
  ["capacity", "manufacturing-work-centers"],
  ["operation", "manufacturing-routing"],
  ["production-line", "manufacturing-work-centers"],
  ["bottleneck", "manufacturing-work-centers"],
  ["tooling", "manufacturing-work-centers"],
  ["kanban", "manufacturing-planning"],
  ["jit", "manufacturing-planning"],
  ["batch-size", "manufacturing-planning"],
  ["leave", "hr-leave"],
  ["attendance", "hr-attendance"],
  ["recruitment", "hr-recruitment"],
  ["sick-leave", "hr-leave"],
  ["job-description", "hr-recruitment"],
  ["probation", "hr-contracts"],
  ["performance-review", "hr-performance"],
  ["succession-planning", "hr-performance"],
  ["turnover", "hr-performance"],
  ["deployment", "it-deployment"],
  ["uat", "it-testing"],
  ["migration", "it-deployment"],
  ["cutover", "it-deployment"],
  ["api", "it-apis"],
  ["log-file", "it-debugging"],
  ["sandbox", "it-deployment"],
  ["release", "it-deployment"],
  ["incident", "it-monitoring"],
] as const;

const batchB1Moves = [
  ["sales-pipeline", "crm", "crm-pipeline"],
  ["lead", "crm", "crm-leads"],
  ["landed-cost", "inventory", "inventory-valuation"],
  ["finished-goods", "inventory", "inventory-on-hand"],
  ["unit-of-measure", "inventory", "inventory-products"],
  ["warehouse", "warehouse", "warehouse-operations"],
  ["bin-location", "warehouse", "warehouse-locations"],
  ["put-away", "warehouse", "warehouse-putaway"],
  ["pick-list", "warehouse", "warehouse-picking"],
  ["cross-docking", "warehouse", "warehouse-operations"],
  ["qc", "quality", "quality-qc"],
  ["compensation", "payroll", "payroll-structure"],
  ["bonus", "payroll", "payroll-allowances"],
  ["overtime", "payroll", "payroll-allowances"],
  ["milestone", "projects", "projects-planning"],
  ["scope-creep", "projects", "projects-planning"],
  ["post-mortem", "projects", "projects-planning"],
  ["dashboard", "bi", "bi-dashboards"],
  ["audit-trail", "administration", "administration-audit"],
  ["permission-role", "administration", "administration-roles"],
] as const;

const batchB2Moves = [
  ["product-catalog", "ecommerce", "ecommerce-catalog"],
  ["budget", "finance", "finance-budget"],
  ["payroll", "payroll", "payroll-structure"],
  ["workflow", "administration", "administration-workflow"],
  ["work-order-services", "maintenance", "maintenance-work-orders"],
  ["corrective", "maintenance", "maintenance-corrective"],
  ["maintenance-plan", "maintenance", "maintenance-schedules"],
  ["spare-part", "maintenance", "maintenance-spare-parts"],
  ["spare-inventory", "maintenance", "maintenance-spare-parts"],
  ["roadmap", "projects", "projects-planning"],
  ["template", "documents", "documents-templates"],
] as const;

const batchBMapUpdates = [
  ["work-order-services", "maintenance-work-orders"],
  ["corrective", "maintenance-corrective"],
  ["maintenance-plan", "maintenance-schedules"],
  ["spare-part", "maintenance-spare-parts"],
  ["spare-inventory", "maintenance-spare-parts"],
] as const;

const batchBOverrides = [
  ["payroll", "payroll-structure"],
  ["workflow", "administration-workflow"],
] as const;

const batchBDeferred = [
  ["preventive", "services", "services-work-orders"],
  ["depreciation", "finance", "finance-gl"],
] as const;

// Pre-Phase-13.2A baseline hash from HEAD ee917ca (before any mapping edit).
// approvedBy/approvedAt are undefined for all 62, so the digest is unchanged.
const batchAContentHash =
  "9221a42aff2e80af120792b9c677bdc24c63932f45b6edcb4d1afcc45b898f15";

// Global WORDS order from HEAD ee917ca; its order sources are unchanged by 13.2A.
const wordsOrderHash =
  "9a641af5ffc1d0be3285ce02d0c57b556f2d21326f6d1327d25fcad9c44a7f4e";

const pickContent = (word: (typeof WORDS)[number]) => ({
  id: word.id,
  english: word.english,
  arabic: word.arabic,
  pronunciation: word.pronunciation,
  partOfSpeech: word.partOfSpeech,
  definitionEn: word.definitionEn,
  definitionAr: word.definitionAr,
  note: word.note,
  module: word.module,
  businessFunctionId: word.businessFunctionId,
  category: word.category,
  level: word.level,
  examples: word.examples,
  examplesAr: word.examplesAr,
  synonyms: word.synonyms,
  antonyms: word.antonyms,
  tags: word.tags,
  relatedTermIds: word.relatedTermIds,
  relatedDocumentIds: word.relatedDocumentIds,
  relatedModuleIds: word.relatedModuleIds,
  status: word.status,
  reviewStatus: word.reviewStatus,
  source: word.source,
  lastReviewedAt: word.lastReviewedAt,
  reviewedBy: word.reviewedBy,
  approvedBy: word.approvedBy,
  approvedAt: word.approvedAt,
});

describe("curated submodule moves", () => {
  it("moves communication terms to email / meetings", () => {
    expect(sub("follow-up")).toBe("communication-email");
    expect(sub("regards")).toBe("communication-email");
    expect(sub("agenda")).toBe("communication-meetings");
    expect(sub("concall")).toBe("communication-meetings");
  });

  it("moves management terms to governance / delegation / alignment / escalation", () => {
    expect(sub("governance")).toBe("management-governance");
    expect(sub("delegate")).toBe("management-delegation");
    expect(sub("alignment")).toBe("management-alignment");
    expect(sub("escalate")).toBe("management-escalation");
  });

  it("moves it terms by topic, including the security terms and the new it-security submodule", () => {
    expect(sub("dev-commit")).toBe("it-git");
    expect(sub("dev-unit-test")).toBe("it-testing");
    expect(sub("dev-breakpoint")).toBe("it-debugging");
    expect(sub("dev-pipeline")).toBe("it-cicd");
    expect(sub("dev-endpoint")).toBe("it-apis");
    expect(sub("dev-ip-address")).toBe("it-networking");
    expect(sub("firewall")).toBe("it-security");
    expect(sub("dev-authentication")).toBe("it-security");
    expect(sub("dev-token")).toBe("it-security");
  });

  it("moves assets terms to depreciation / acquisition / transfer / disposal", () => {
    expect(sub("useful-life")).toBe("assets-depreciation");
    expect(sub("capacitation-booking")).toBe("assets-acquisition");
    expect(sub("asset-transfer")).toBe("assets-transfer");
    expect(sub("disposal")).toBe("assets-disposal");
  });

  it("moves service terms to calls / sla / technicians and maintenance terms to maintenance", () => {
    expect(sub("service-call")).toBe("services-calls");
    expect(sub("work-order-services")).toBe("maintenance-work-orders");
    expect(sub("sla-services")).toBe("services-sla");
    expect(sub("technician")).toBe("services-technicians");
    expect(sub("spare-part")).toBe("maintenance-spare-parts");
  });

  it("keeps every assigned submodule valid and belonging to the word's module", () => {
    for (const word of WORDS) {
      if (!word.subModuleId) continue;
      const parent = SUB_MODULE_MAP[word.subModuleId];
      expect(parent, `missing submodule ${word.subModuleId} for ${word.id}`).toBeTruthy();
      expect(parent.moduleId, `mismatch for ${word.id}`).toBe(word.module);
    }
  });

  it("only references existing submodules in the move map", () => {
    for (const [id, subId] of Object.entries(WORD_SUBMODULE)) {
      expect(SUB_MODULE_MAP[subId], `${id} → ${subId}`).toBeTruthy();
    }
  });
});

describe("phase 13.2a batch a submodule moves", () => {
  it("contains exactly 62 unique approved mappings", () => {
    expect(batchASubmoduleMoves).toHaveLength(62);
    expect(new Set(batchASubmoduleMoves.map(([id]) => id)).size).toBe(62);
  });

  it("keeps the WORD_SUBMODULE count at the baseline plus 62", () => {
    expect(Object.keys(WORD_SUBMODULE)).toHaveLength(172);
    expect(new Set(batchASubmoduleMoves.map(([id]) => id)).size).toBe(62);

    for (const [id, target] of batchASubmoduleMoves) {
      expect(WORD_SUBMODULE[id]).toBe(target);
    }
  });

  it("preserves the global WORDS ordering", () => {
    const order = WORDS.map((word) => word.id).join("\n");
    expect(createHash("sha256").update(order).digest("hex")).toBe(wordsOrderHash);
  });

  it.each(batchASubmoduleMoves)(
    "maps %s to %s without changing identity, content, or review status",
    (id, target) => {
      const word = WORDS.find((entry) => entry.id === id);
      if (!word) throw new Error(`missing word ${id}`);

      expect(WORDS.filter((entry) => entry.id === id)).toHaveLength(1);
      expect(WORD_SUBMODULE[id]).toBe(target);
      expect(sub(id)).toBe(target);
      expect(WORD_CLASSIFICATION[id]?.subModuleId).toBeUndefined();
      expect(SUB_MODULE_MAP[target], `missing submodule ${target}`).toBeTruthy();
      expect(SUB_MODULE_MAP[target]?.moduleId).toBe(word.module);
      expect(word.reviewStatus).toBe("auto");
    }
  );

  it("preserves aggregate domain and review invariants", () => {
    const screenIds = new Set(screenWords.map((word) => word.id));
    const domainWords = WORDS.filter((word) => !screenIds.has(word.id));

    expect(screenWords).toHaveLength(113);
    expect(WORDS).toHaveLength(433);
    expect(domainWords).toHaveLength(320);
    expect(domainWords.filter((word) => word.reviewStatus === "reviewed")).toHaveLength(56);
    expect(domainWords.filter((word) => word.reviewStatus === "auto")).toHaveLength(264);
  });

  it("preserves all batch a content and metadata", () => {
    const rows = batchASubmoduleMoves.map(([id]) => {
      const word = WORDS.find((entry) => entry.id === id);
      if (!word) throw new Error(`missing word ${id}`);
      return pickContent(word);
    });

    expect(createHash("sha256").update(JSON.stringify(rows)).digest("hex")).toBe(
      batchAContentHash
    );
  });
});

describe("phase 13.2b batch b submodule moves", () => {
  it("contains exactly 20 unique B1 and 11 unique B2 mappings", () => {
    expect(batchB1Moves).toHaveLength(20);
    expect(new Set(batchB1Moves.map(([id]) => id)).size).toBe(20);
    expect(batchB2Moves).toHaveLength(11);
    expect(new Set(batchB2Moves.map(([id]) => id)).size).toBe(11);
    expect(new Set([...batchB1Moves, ...batchB2Moves].map(([id]) => id)).size).toBe(31);
  });

  it.each(batchB1Moves)(
    "maps B1 %s to %s/%s without changing identity or review status",
    (id, moduleId, target) => {
      const word = WORDS.find((entry) => entry.id === id);
      if (!word) throw new Error(`missing word ${id}`);

      expect(WORDS.filter((entry) => entry.id === id)).toHaveLength(1);
      expect(word.module).toBe(moduleId);
      expect(word.subModuleId).toBe(target);
      expect(sub(id)).toBe(target);
      expect(SUB_MODULE_MAP[target], `missing submodule ${target}`).toBeTruthy();
      expect(SUB_MODULE_MAP[target]?.moduleId).toBe(moduleId);
      expect(word.reviewStatus).toBe("auto");
    }
  );

  it.each(batchB2Moves)(
    "maps B2 %s to %s/%s without changing identity or review status",
    (id, moduleId, target) => {
      const word = WORDS.find((entry) => entry.id === id);
      if (!word) throw new Error(`missing word ${id}`);

      expect(WORDS.filter((entry) => entry.id === id)).toHaveLength(1);
      expect(word.module).toBe(moduleId);
      expect(word.subModuleId).toBe(target);
      expect(sub(id)).toBe(target);
      expect(SUB_MODULE_MAP[target], `missing submodule ${target}`).toBeTruthy();
      expect(SUB_MODULE_MAP[target]?.moduleId).toBe(moduleId);
      expect(word.reviewStatus).toBe(
        id === "payroll" || id === "workflow" ? "reviewed" : "auto"
      );
    }
  );

  it("updates exactly five existing WORD_SUBMODULE values", () => {
    expect(batchBMapUpdates).toHaveLength(5);
    for (const [id, target] of batchBMapUpdates) {
      expect(WORD_SUBMODULE[id]).toBe(target);
    }
  });

  it("updates exactly two existing override submodules and preserves categories", () => {
    expect(batchBOverrides).toHaveLength(2);
    for (const [id, target] of batchBOverrides) {
      expect(WORD_CLASSIFICATION[id]?.subModuleId).toBe(target);
      expect(WORD_CLASSIFICATION[id]?.category).toBe("term");
      expect(sub(id)).toBe(target);
      expect(WORDS.find((entry) => entry.id === id)?.reviewStatus).toBe("reviewed");
    }
  });

  it("keeps the deferred Batch C terms unchanged", () => {
    for (const [id, moduleId, target] of batchBDeferred) {
      const word = WORDS.find((entry) => entry.id === id);
      if (!word) throw new Error(`missing word ${id}`);
      expect(word.module).toBe(moduleId);
      expect(word.subModuleId).toBe(target);
      expect(sub(id)).toBe(target);
    }

    expect(WORD_SUBMODULE.preventive).toBe("services-work-orders");
    expect(WORD_CLASSIFICATION.preventive).toBeUndefined();
    expect(WORD_SUBMODULE.depreciation).toBeUndefined();
    expect(WORD_CLASSIFICATION.depreciation).toBeUndefined();
  });

  it("preserves IDs, mapping count, aggregate counts, and projected coverage", () => {
    expect(WORDS).toHaveLength(433);
    expect(new Set(WORDS.map((word) => word.id)).size).toBe(433);
    expect(Object.keys(WORD_SUBMODULE)).toHaveLength(172);

    const screenIds = new Set(screenWords.map((word) => word.id));
    const domainWords = WORDS.filter((word) => !screenIds.has(word.id));

    expect(screenWords).toHaveLength(113);
    expect(domainWords).toHaveLength(320);
    expect(domainWords.filter((word) => word.reviewStatus === "reviewed")).toHaveLength(56);
    expect(domainWords.filter((word) => word.reviewStatus === "auto")).toHaveLength(264);

    const usedSubModules = new Set(
      domainWords.map((word) => word.subModuleId).filter(Boolean)
    );
    expect(SUB_MODULES.filter((subModule) => !usedSubModules.has(subModule.id))).toHaveLength(83);

    const populatedModules = new Set(domainWords.map((word) => word.module));
    expect(
      MODULES.filter((module) => !populatedModules.has(module.id))
        .map((module) => module.id)
        .sort()
    ).toEqual(["planning", "plm", "pos", "scm"]);
  });
});
