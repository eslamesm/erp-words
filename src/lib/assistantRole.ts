export type RoleId =
  | "accountant"
  | "purchasing"
  | "sales"
  | "inventory"
  | "hr"
  | "it"
  | "pm"
  | "support"
  | "general";

export interface RoleDef {
  id: RoleId;
  ar: string;
  en: string;
  module: string;
}

export const ROLES: RoleDef[] = [
  { id: "accountant", ar: "محاسب / مالية", en: "Accountant / Finance", module: "finance" },
  { id: "purchasing", ar: "مشتريات", en: "Purchasing", module: "purchasing" },
  { id: "sales", ar: "مبيعات", en: "Sales", module: "sales" },
  { id: "inventory", ar: "مخازن / جرد", en: "Inventory / Warehouse", module: "inventory" },
  { id: "hr", ar: "موارد بشرية", en: "HR", module: "hr" },
  { id: "it", ar: "تقنية معلومات / دعم فني", en: "IT / Technical Support", module: "it" },
  { id: "pm", ar: "إدارة مشاريع", en: "Project Manager", module: "general" },
  { id: "support", ar: "خدمة عملاء", en: "Customer Service", module: "services" },
  { id: "general", ar: "وظيفة أخرى / عام", en: "Other / General", module: "general" },
];

const ROLE_KEY = "erp-vocab:assistant-role";
const PENDING_KEY = "erp-vocab:assistant-pending";

export function getRole(): RoleId | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(ROLE_KEY) as RoleId | null;
  return v && ROLES.some((r) => r.id === v) ? v : null;
}

export function setRole(id: RoleId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, id);
}

export function clearRole() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROLE_KEY);
}

export function roleLabel(id: RoleId | null, lang: string): string {
  const r = ROLES.find((x) => x.id === id);
  if (!r) return "";
  return lang === "en" ? r.en : r.ar;
}

export function savePending(q: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_KEY, q);
}

export function takePending(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(PENDING_KEY);
  window.localStorage.removeItem(PENDING_KEY);
  return v;
}

export function detectRole(q: string): RoleId | null {
  const s = q.toLowerCase();
  if (/محاسب|محاسبة|مالية|حسابات|\baccount|\bfinance|financial/.test(s)) return "accountant";
  if (/مشتريات|شراء|مورد|\bpurchas|procure|supplier|vendor/.test(s)) return "purchasing";
  if (/مبيعات|\bبيع\b|\bsales\b|selling/.test(s)) return "sales";
  if (/مخازن|مخزون|جرد|\binventory|warehouse|\bstock\b/.test(s)) return "inventory";
  if (/موارد بشرية|رواتب|شؤون الموظفين|\bhr\b|payroll|human resources/.test(s)) return "hr";
  if (/إدارة مشاريع|مدير مشروع|project manager|\bpm\b|project management/.test(s)) return "pm";
  if (/تقنية المعلومات|الدعم التقني|it support|it department|\bit\b/.test(s)) return "it";
  if (/خدمة عملاء|customer service|customer support|support agent/.test(s)) return "support";
  return null;
}
