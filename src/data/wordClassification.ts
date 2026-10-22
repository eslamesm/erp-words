import type { ModuleId, VocabularyCategory, Word } from "@/types";
import { SUB_MODULE_ID_SET } from "./subModules";

// الوحدة الفرعية الافتراضية لكل وحدة (تُستخدم عند غياب تصنيف أدق).
export const MODULE_DEFAULT_SUBMODULE: Record<ModuleId, string> = {
  finance: "finance-gl",
  sales: "sales-orders",
  purchasing: "purchasing-orders",
  inventory: "inventory-products",
  warehouse: "warehouse-operations",
  manufacturing: "manufacturing-orders",
  quality: "quality-inspection",
  maintenance: "maintenance-work-orders",
  hr: "hr-employees",
  payroll: "payroll-structure",
  crm: "crm-leads",
  projects: "projects-tasks",
  assets: "assets-registration",
  scm: "scm-supply-planning",
  planning: "planning-scheduling",
  plm: "plm-products",
  pos: "pos-transactions",
  ecommerce: "ecommerce-orders",
  services: "services-tickets",
  bi: "bi-reports",
  administration: "administration-system",
  documents: "documents-repository",
  management: "management-strategy",
  communication: "communication-reporting",
  it: "it-databases",
  general: "general-terms",
};

// ربط الوسوم (tags) بأنواع المصطلحات — بأولوية تنازلية.
export const TAG_CATEGORY_PRIORITY: { tag: string; category: VocabularyCategory }[] = [
  { tag: "document", category: "document" },
  { tag: "report", category: "report" },
  { tag: "screen", category: "screen" },
  { tag: "field", category: "field" },
  { tag: "status", category: "status" },
  { tag: "error", category: "error" },
];

// تصنيفات منسّقة يدويًا لمصطلحات قائمة (لتحسين الدقّة).
export const WORD_CLASSIFICATION: Record<
  string,
  { subModuleId?: string; category?: VocabularyCategory }
> = {
  // Finance
  post: { subModuleId: "finance-gl", category: "action" },
  "journal-entry": { subModuleId: "finance-gl", category: "document" },
  "general-ledger": { subModuleId: "finance-gl", category: "term" },
  ledger: { subModuleId: "finance-gl", category: "term" },
  "chart-of-accounts": { subModuleId: "finance-gl", category: "term" },
  "trial-balance": { subModuleId: "finance-reporting", category: "report" },
  "balance-sheet": { subModuleId: "finance-reporting", category: "report" },
  "income-statement": { subModuleId: "finance-reporting", category: "report" },
  "cash-flow": { subModuleId: "finance-reporting", category: "report" },
  aging: { subModuleId: "finance-reporting", category: "report" },
  reconciliation: { subModuleId: "finance-gl", category: "action" },
  accrual: { subModuleId: "finance-gl", category: "term" },
  "accounts-receivable": { subModuleId: "finance-ar", category: "term" },
  "accounts-payable": { subModuleId: "finance-ap", category: "term" },
  "financial-statements": { subModuleId: "finance-reporting", category: "report" },
  "fiscal-year": { subModuleId: "finance-closing", category: "term" },
  prepayment: { subModuleId: "finance-gl", category: "term" },
  "period-closing": { subModuleId: "finance-closing", category: "action" },
  "bank-reconciliation": { subModuleId: "finance-bank", category: "action" },
  "tax-invoice": { subModuleId: "finance-tax", category: "document" },
  vat: { subModuleId: "finance-tax", category: "term" },
  "input-tax": { subModuleId: "finance-tax", category: "term" },
  "output-tax": { subModuleId: "finance-tax", category: "term" },
  "tax-report": { subModuleId: "finance-tax", category: "report" },
  "fixed-asset": { subModuleId: "assets-registration", category: "term" },

  // Sales
  "sales-order": { subModuleId: "sales-orders", category: "document" },
  quotation: { subModuleId: "sales-quotations", category: "document" },
  invoice: { subModuleId: "finance-ar", category: "document" },
  "delivery-note": { subModuleId: "sales-orders", category: "document" },
  "credit-note": { subModuleId: "sales-invoicing", category: "document" },
  "debit-note": { subModuleId: "sales-invoicing", category: "document" },
  "price-list": { subModuleId: "sales-pricing", category: "document" },

  // Purchasing
  "purchase-order": { subModuleId: "purchasing-orders", category: "document" },
  "purchase-request": { subModuleId: "purchasing-requisition", category: "document" },
  requisition: { subModuleId: "purchasing-requisition", category: "document" },
  "goods-receipt": { subModuleId: "purchasing-receipts", category: "document" },
  grn: { subModuleId: "purchasing-receipts", category: "document" },
  rfq: { subModuleId: "purchasing-rfq", category: "document" },
  vendor: { subModuleId: "purchasing-vendors", category: "term" },

  // Inventory
  sku: { subModuleId: "inventory-products", category: "term" },
  "reorder-point": { subModuleId: "inventory-reordering", category: "term" },
  "cycle-count": { subModuleId: "inventory-reporting", category: "action" },
  "stock-transfer": { subModuleId: "inventory-transfers", category: "document" },

  // Manufacturing
  bom: { subModuleId: "manufacturing-bom", category: "document" },
  "bill-of-materials": { subModuleId: "manufacturing-bom", category: "document" },
  mrp: { subModuleId: "manufacturing-mrp", category: "term" },
  routing: { subModuleId: "manufacturing-routing", category: "term" },

  // Services
  "service-level-agreement": { subModuleId: "services-sla", category: "term" },

  // HR / Payroll
  onboarding: { subModuleId: "hr-employees", category: "action" },
  appraisal: { subModuleId: "hr-appraisal", category: "document" },
  payroll: { subModuleId: "payroll-structure", category: "term" },
  payslip: { subModuleId: "payroll-payslips", category: "document" },

  // IT
  downtime: { subModuleId: "it-monitoring", category: "term" },
  uptime: { subModuleId: "it-monitoring", category: "report" },
  "go-live": { subModuleId: "it-deployment", category: "action" },
  rollout: { subModuleId: "it-deployment", category: "action" },
  integration: { subModuleId: "it-apis", category: "term" },
  sla: { subModuleId: "it-monitoring", category: "term" },
  ticket: { subModuleId: "it-monitoring", category: "document" },

  // Documents / Administration
  workflow: { subModuleId: "administration-workflow", category: "term" },
  approval: { subModuleId: "management-strategy", category: "action" },

  // تصحيح تصنيف مؤكد: "draft" حالة (status) وليست مستندًا.
  // الوسم "document" كان يتغلّب على التصنيف الصحيح قبل هذا التصحيح.
  draft: { category: "status" },
};

// نقل منسّق للمصطلحات إلى وحداتها الفرعية الصحيحة (تصنيف فرعي يدوي فقط).
// لا يمسّ النوع (category) ولا حالة المراجعة — المعرّفات تبقى كما هي.
export const WORD_SUBMODULE: Record<string, string> = {
  // ══ communication ══
  "follow-up": "communication-email",
  acknowledge: "communication-email",
  clarify: "communication-email",
  reminder: "communication-email",
  revert: "communication-email",
  "cc-bcc": "communication-email",
  attach: "communication-email",
  correspondence: "communication-email",
  courtesy: "communication-email",
  regards: "communication-email",
  "per-notation": "communication-email",
  tone: "communication-email",
  agenda: "communication-meetings",
  minutes: "communication-meetings",
  briefing: "communication-meetings",
  concall: "communication-meetings",

  // ══ management ══
  oversight: "management-governance",
  governance: "management-governance",
  accountable: "management-governance",
  delegate: "management-delegation",
  alignment: "management-alignment",
  objective: "management-alignment",
  escalate: "management-escalation",

  // ══ it (كلمات المطوّرين حسب موضوعها) ══
  "dev-primary-key": "it-databases",
  "dev-foreign-key": "it-databases",
  "dev-index": "it-databases",
  "dev-query": "it-databases",
  "dev-join": "it-databases",
  "dev-schema": "it-databases",
  "dev-endpoint": "it-apis",
  "dev-request": "it-apis",
  "dev-response": "it-apis",
  "dev-rate-limit": "it-apis",
  "dev-breakpoint": "it-debugging",
  "dev-stack-trace": "it-debugging",
  "dev-log": "it-debugging",
  "dev-exception": "it-debugging",
  "dev-reproduce": "it-debugging",
  "dev-root-cause": "it-debugging",
  "dev-unit-test": "it-testing",
  "dev-integration-test": "it-testing",
  "dev-regression": "it-testing",
  "dev-assertion": "it-testing",
  "dev-coverage": "it-testing",
  "dev-deployment": "it-deployment",
  "dev-release": "it-deployment",
  "dev-rollback": "it-deployment",
  "dev-staging": "it-deployment",
  "dev-production": "it-deployment",
  "dev-repository": "it-git",
  "dev-commit": "it-git",
  "dev-branch": "it-git",
  "dev-pull-request": "it-git",
  "dev-merge": "it-git",
  "dev-conflict": "it-git",
  "dev-pull-push": "it-git",
  "dev-terminal": "it-linux",
  "dev-command": "it-linux",
  "dev-permission": "it-linux",
  "dev-process": "it-linux",
  "dev-service": "it-linux",
  "dev-sudo": "it-linux",
  "dev-ip-address": "it-networking",
  "dev-dns": "it-networking",
  "dev-port": "it-networking",
  "dev-latency": "it-networking",
  "dev-bandwidth": "it-networking",
  "dev-pipeline": "it-cicd",
  "dev-continuous-integration": "it-cicd",
  "dev-artifact": "it-cicd",
  "dev-build": "it-cicd",
  "dev-monitoring": "it-monitoring",
  "dev-alert": "it-monitoring",
  "dev-metric": "it-monitoring",
  "dev-uptime": "it-monitoring",
  "dev-incident": "it-monitoring",
  "dev-firewall": "it-security",
  "dev-authentication": "it-security",
  "dev-token": "it-security",
  firewall: "it-security",
  patch: "it-security",
  "user-access": "it-security",

  // ══ assets ══
  "depreciation-assets": "assets-depreciation",
  "accumulated-depreciation": "assets-depreciation",
  "depreciation-run": "assets-depreciation",
  "useful-life": "assets-depreciation",
  "salvage-value": "assets-depreciation",
  "net-book-value": "assets-depreciation",
  amortization: "assets-depreciation",
  impairment: "assets-depreciation",
  "capacitation-booking": "assets-acquisition",
  capitalize: "assets-acquisition",
  capex: "assets-acquisition",
  "asset-transfer": "assets-transfer",
  disposal: "assets-disposal",

  // ══ services ══
  "service-call": "services-calls",
  dispatch: "services-calls",
  "field-service": "services-calls",
  "work-order-services": "maintenance-work-orders",
  "maintenance-plan": "maintenance-schedules",
  preventive: "services-work-orders",
  corrective: "maintenance-corrective",
  "sla-services": "services-sla",
  "response-time": "services-sla",
  "resolution-time": "services-sla",
  "first-time-fix": "services-sla",
  satisfaction: "services-sla",
  technician: "services-technicians",
  "spare-part": "maintenance-spare-parts",
  "spare-inventory": "maintenance-spare-parts",

  "petty-cash": "finance-cash",
  "cost-center": "finance-cost",
  "working-capital": "finance-reporting",

  discount: "sales-pricing",
  commission: "sales-reporting",
  customer: "sales-customers",
  returns: "sales-returns",
  "credit-limit": "sales-customers",
  channel: "sales-reporting",
  "return-merchandise-auth": "sales-returns",
  upselling: "sales-customers",
  "cross-selling": "sales-customers",
  territory: "sales-customers",
  "sales-target": "sales-reporting",
  forecast: "sales-reporting",

  "three-way-match": "purchasing-vendor-bills",
  contract: "purchasing-agreements",
  "blanket-order": "purchasing-agreements",
  "standing-offer": "purchasing-agreements",
  "supplier-portal": "purchasing-vendors",
  incoterms: "purchasing-agreements",
  "open-po": "purchasing-reporting",
  "vendor-rating": "purchasing-vendor-comparison",
  "price-negotiation": "purchasing-vendors",

  stock: "inventory-on-hand",
  batch: "inventory-lot-serial",
  adjustment: "inventory-adjustments",
  "lead-time": "inventory-reordering",
  "safety-stock": "inventory-reordering",
  stockout: "inventory-reporting",
  "lot-number": "inventory-lot-serial",
  "abc-analysis": "inventory-reporting",
  "min-max": "inventory-reordering",
  "physical-inventory": "inventory-reporting",

  "work-order": "manufacturing-work-orders",
  scrap: "manufacturing-scrap",
  capacity: "manufacturing-work-centers",
  operation: "manufacturing-routing",
  "production-line": "manufacturing-work-centers",
  bottleneck: "manufacturing-work-centers",
  tooling: "manufacturing-work-centers",
  kanban: "manufacturing-planning",
  jit: "manufacturing-planning",
  "batch-size": "manufacturing-planning",

  leave: "hr-leave",
  attendance: "hr-attendance",
  recruitment: "hr-recruitment",
  "sick-leave": "hr-leave",
  "job-description": "hr-recruitment",
  probation: "hr-contracts",
  "performance-review": "hr-performance",
  "succession-planning": "hr-performance",
  turnover: "hr-performance",

  deployment: "it-deployment",
  uat: "it-testing",
  migration: "it-deployment",
  cutover: "it-deployment",
  api: "it-apis",
  "log-file": "it-debugging",
  sandbox: "it-deployment",
  release: "it-deployment",
  incident: "it-monitoring",
};

// مصدر التصنيف المطبّق على نوع المصطلح — بأولوية صريحة.
// override > explicit (word.category) > tag > default. لا تتغلّب الوسوم أبدًا
// على تصنيف صريح أو override يدوي صحيح.
export type CategorySource = "override" | "explicit" | "tag" | "default";

export function categorySource(word: Word): CategorySource {
  if (WORD_CLASSIFICATION[word.id]?.category) return "override";
  if (word.category) return "explicit";
  const tags = word.tags ?? [];
  for (const entry of TAG_CATEGORY_PRIORITY) {
    if (tags.includes(entry.tag)) return "tag";
  }
  return "default";
}

export function deriveCategory(word: Word): VocabularyCategory {
  switch (categorySource(word)) {
    case "override":
      return WORD_CLASSIFICATION[word.id]!.category!;
    case "explicit":
      return word.category!;
    case "tag": {
      const tags = word.tags ?? [];
      for (const entry of TAG_CATEGORY_PRIORITY) {
        if (tags.includes(entry.tag)) return entry.category;
      }
      return "term";
    }
    default:
      return "term";
  }
}

export function deriveSubModuleId(word: Word): string | undefined {
  const override = WORD_CLASSIFICATION[word.id];
  if (override?.subModuleId) return override.subModuleId;
  if (word.subModuleId) return word.subModuleId;
  if (WORD_SUBMODULE[word.id]) return WORD_SUBMODULE[word.id];
  return MODULE_DEFAULT_SUBMODULE[word.module];
}

// يثري المصطلح بحقول التصنيف الجديدة دون المساس بحقوله الأصلية.
export function classifyWord(word: Word): Word {
  const derivedSub = deriveSubModuleId(word);
  const subModuleId = derivedSub && SUB_MODULE_ID_SET.has(derivedSub) ? derivedSub : undefined;

  const source = categorySource(word);

  return {
    ...word,
    category: deriveCategory(word),
    subModuleId,
    status: word.status ?? "published",
    reviewStatus: source === "override" || source === "explicit" ? "reviewed" : "auto",
  };
}
