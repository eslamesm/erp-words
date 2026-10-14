import type { ModuleId, ModuleMeta } from "@/types";

export const MODULES: ModuleMeta[] = [
  { id: "finance", labelAr: "المالية والمحاسبة", labelEn: "Finance & Accounting", icon: "💹", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { id: "inventory", labelAr: "المخزون", labelEn: "Inventory", icon: "📦", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { id: "sales", labelAr: "المبيعات", labelEn: "Sales", icon: "🛒", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  { id: "purchasing", labelAr: "المشتريات", labelEn: "Purchasing", icon: "🛍️", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  { id: "manufacturing", labelAr: "التصنيع والإنتاج", labelEn: "Manufacturing", icon: "🏭", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { id: "hr", labelAr: "الموارد البشرية", labelEn: "Human Resources", icon: "👥", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300" },
  { id: "management", labelAr: "الإدارة والقيادة", labelEn: "Management", icon: "🧭", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { id: "communication", labelAr: "التواصل والمراسلات", labelEn: "Communication", icon: "💬", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
  { id: "it", labelAr: "تقنية المعلومات والمشاريع", labelEn: "IT & Projects", icon: "🖥️", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { id: "assets", labelAr: "الأصول الثابتة", labelEn: "Fixed Assets", icon: "🏢", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { id: "services", labelAr: "الخدمات والدعم", labelEn: "Services & Support", icon: "🧰", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300" },
  { id: "general", labelAr: "مصطلحات عامة", labelEn: "General", icon: "🗂️", color: "bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-300" },
];

export const MODULE_MAP: Record<ModuleId, ModuleMeta> = MODULES.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<ModuleId, ModuleMeta>
);

export const MODULE_IDS = MODULES.map((m) => m.id);