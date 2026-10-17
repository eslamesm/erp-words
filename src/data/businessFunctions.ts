import type { BusinessFunctionDef, ModuleId } from "@/types";

// الوظائف التجارية (Business Functions) — المستوى الرابع في التسلسل الهرمي.
// مجموعة مبدئية قابلة للتوسّع في المراحل القادمة، مرتبطة بوحدات فرعية قائمة.
export const BUSINESS_FUNCTIONS: BusinessFunctionDef[] = [
  // Finance
  { id: "finance-gl-create-journal", subModuleId: "finance-gl", moduleId: "finance", labelAr: "إنشاء قيد يومية", labelEn: "Create Journal Entry" },
  { id: "finance-gl-post-entry", subModuleId: "finance-gl", moduleId: "finance", labelAr: "ترحيل القيد", labelEn: "Post Entry" },
  { id: "finance-gl-reverse-entry", subModuleId: "finance-gl", moduleId: "finance", labelAr: "عكس القيد", labelEn: "Reverse Entry" },
  { id: "finance-ap-register-bill", subModuleId: "finance-ap", moduleId: "finance", labelAr: "تسجيل فاتورة مورّد", labelEn: "Register Vendor Bill" },
  { id: "finance-ap-pay-vendor", subModuleId: "finance-ap", moduleId: "finance", labelAr: "سداد المورّد", labelEn: "Pay Vendor" },
  { id: "finance-ar-create-invoice", subModuleId: "finance-ar", moduleId: "finance", labelAr: "إصدار فاتورة عميل", labelEn: "Create Customer Invoice" },
  { id: "finance-ar-receive-payment", subModuleId: "finance-ar", moduleId: "finance", labelAr: "استلام دفعة", labelEn: "Receive Payment" },
  { id: "finance-closing-close-period", subModuleId: "finance-closing", moduleId: "finance", labelAr: "إقفال الفترة", labelEn: "Close Period" },
  { id: "finance-reporting-export", subModuleId: "finance-reporting", moduleId: "finance", labelAr: "تصدير التقارير المالية", labelEn: "Export Financial Reports" },

  // Sales
  { id: "sales-quotations-create", subModuleId: "sales-quotations", moduleId: "sales", labelAr: "إنشاء عرض سعر", labelEn: "Create Quotation" },
  { id: "sales-quotations-convert", subModuleId: "sales-quotations", moduleId: "sales", labelAr: "تحويل العرض إلى أمر بيع", labelEn: "Convert Quotation to Order" },
  { id: "sales-orders-create", subModuleId: "sales-orders", moduleId: "sales", labelAr: "إنشاء أمر بيع", labelEn: "Create Sales Order" },
  { id: "sales-orders-confirm", subModuleId: "sales-orders", moduleId: "sales", labelAr: "تأكيد أمر البيع", labelEn: "Confirm Order" },
  { id: "sales-orders-cancel", subModuleId: "sales-orders", moduleId: "sales", labelAr: "إلغاء أمر البيع", labelEn: "Cancel Order" },
  { id: "sales-invoicing-create", subModuleId: "sales-invoicing", moduleId: "sales", labelAr: "إصدار فاتورة بيع", labelEn: "Create Sales Invoice" },
  { id: "sales-returns-process", subModuleId: "sales-returns", moduleId: "sales", labelAr: "معالجة مرتجع", labelEn: "Process Return" },

  // Purchasing
  { id: "purchasing-orders-create", subModuleId: "purchasing-orders", moduleId: "purchasing", labelAr: "إنشاء أمر شراء", labelEn: "Create Purchase Order" },
  { id: "purchasing-orders-approve", subModuleId: "purchasing-orders", moduleId: "purchasing", labelAr: "اعتماد أمر الشراء", labelEn: "Approve Purchase Order" },
  { id: "purchasing-requisition-create", subModuleId: "purchasing-requisition", moduleId: "purchasing", labelAr: "إنشاء طلب شراء", labelEn: "Create Requisition" },
  { id: "purchasing-receipts-receive", subModuleId: "purchasing-receipts", moduleId: "purchasing", labelAr: "استلام بضاعة", labelEn: "Receive Goods" },
  { id: "purchasing-vendor-bills-register", subModuleId: "purchasing-vendor-bills", moduleId: "purchasing", labelAr: "تسجيل فاتورة مورّد", labelEn: "Register Vendor Bill" },

  // Inventory
  { id: "inventory-products-create", subModuleId: "inventory-products", moduleId: "inventory", labelAr: "إنشاء صنف", labelEn: "Create Product" },
  { id: "inventory-adjustments-apply", subModuleId: "inventory-adjustments", moduleId: "inventory", labelAr: "تطبيق تسوية مخزون", labelEn: "Apply Inventory Adjustment" },
  { id: "inventory-transfers-create", subModuleId: "inventory-transfers", moduleId: "inventory", labelAr: "إنشاء تحويل مخزني", labelEn: "Create Stock Transfer" },
  { id: "inventory-cycle-count", subModuleId: "inventory-reporting", moduleId: "inventory", labelAr: "تشغيل جرد دوري", labelEn: "Run Cycle Count" },

  // Manufacturing
  { id: "manufacturing-orders-create", subModuleId: "manufacturing-orders", moduleId: "manufacturing", labelAr: "إنشاء أمر تصنيع", labelEn: "Create Manufacturing Order" },
  { id: "manufacturing-orders-produce", subModuleId: "manufacturing-orders", moduleId: "manufacturing", labelAr: "إتمام الإنتاج", labelEn: "Produce Order" },
  { id: "manufacturing-bom-define", subModuleId: "manufacturing-bom", moduleId: "manufacturing", labelAr: "تعريف قائمة المكوّنات", labelEn: "Define BOM" },

  // Assets
  { id: "assets-depreciation-run", subModuleId: "assets-depreciation", moduleId: "assets", labelAr: "تشغيل الإهلاك", labelEn: "Run Depreciation" },
  { id: "assets-disposal-process", subModuleId: "assets-disposal", moduleId: "assets", labelAr: "معالجة التصرف في الأصل", labelEn: "Process Asset Disposal" },

  // HR
  { id: "hr-leave-request", subModuleId: "hr-leave", moduleId: "hr", labelAr: "طلب إجازة", labelEn: "Request Leave" },
  { id: "hr-leave-approve", subModuleId: "hr-leave", moduleId: "hr", labelAr: "اعتماد إجازة", labelEn: "Approve Leave" },
];

export const BUSINESS_FUNCTION_MAP: Record<string, BusinessFunctionDef> = BUSINESS_FUNCTIONS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {} as Record<string, BusinessFunctionDef>
);

export const BUSINESS_FUNCTION_IDS = BUSINESS_FUNCTIONS.map((f) => f.id);
export const BUSINESS_FUNCTION_ID_SET = new Set(BUSINESS_FUNCTION_IDS);

export function businessFunctionsBySubModule(subModuleId: string): BusinessFunctionDef[] {
  return BUSINESS_FUNCTIONS.filter((f) => f.subModuleId === subModuleId);
}

export function businessFunctionsByModule(moduleId: ModuleId): BusinessFunctionDef[] {
  return BUSINESS_FUNCTIONS.filter((f) => f.moduleId === moduleId);
}
