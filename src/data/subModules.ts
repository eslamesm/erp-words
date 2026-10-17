import type { ModuleId, SubModuleMeta } from "@/types";

// الوحدات الفرعية (Sub Modules) لكل وحدة ERP + الفئات العابرة.
// المعرّف = "{moduleId}-{slug}" لضمان التفرّد عالميًا.
export const SUB_MODULES: SubModuleMeta[] = [
  // ══ Finance & Accounting ══
  { id: "finance-gl", moduleId: "finance", labelAr: "دفتر الأستاذ العام", labelEn: "General Ledger (GL)" },
  { id: "finance-ap", moduleId: "finance", labelAr: "الحسابات الدائنة", labelEn: "Accounts Payable (AP)" },
  { id: "finance-ar", moduleId: "finance", labelAr: "الحسابات المدينة", labelEn: "Accounts Receivable (AR)" },
  { id: "finance-cash", moduleId: "finance", labelAr: "إدارة النقد", labelEn: "Cash Management" },
  { id: "finance-bank", moduleId: "finance", labelAr: "إدارة البنوك", labelEn: "Bank Management" },
  { id: "finance-cost", moduleId: "finance", labelAr: "محاسبة التكاليف", labelEn: "Cost Accounting" },
  { id: "finance-budget", moduleId: "finance", labelAr: "الموازنات", labelEn: "Budgeting" },
  { id: "finance-fixed-assets", moduleId: "finance", labelAr: "محاسبة الأصول الثابتة", labelEn: "Fixed Assets Accounting" },
  { id: "finance-tax", moduleId: "finance", labelAr: "إدارة الضرائب", labelEn: "Tax Management" },
  { id: "finance-reporting", moduleId: "finance", labelAr: "التقارير المالية", labelEn: "Financial Reporting" },
  { id: "finance-closing", moduleId: "finance", labelAr: "الإقفال الدوري", labelEn: "Period Closing" },

  // ══ Sales ══
  { id: "sales-customers", moduleId: "sales", labelAr: "إدارة العملاء", labelEn: "Customer Management" },
  { id: "sales-quotations", moduleId: "sales", labelAr: "عروض الأسعار", labelEn: "Sales Quotation" },
  { id: "sales-orders", moduleId: "sales", labelAr: "أوامر البيع", labelEn: "Sales Orders" },
  { id: "sales-pricing", moduleId: "sales", labelAr: "إدارة التسعير", labelEn: "Pricing Management" },
  { id: "sales-invoicing", moduleId: "sales", labelAr: "الفوترة", labelEn: "Sales Invoicing" },
  { id: "sales-returns", moduleId: "sales", labelAr: "المرتجعات", labelEn: "Sales Returns" },
  { id: "sales-reporting", moduleId: "sales", labelAr: "تقارير المبيعات", labelEn: "Sales Reporting" },

  // ══ Purchasing ══
  { id: "purchasing-vendors", moduleId: "purchasing", labelAr: "إدارة المورّدين", labelEn: "Vendor Management" },
  { id: "purchasing-requisition", moduleId: "purchasing", labelAr: "طلب الشراء", labelEn: "Purchase Requisition" },
  { id: "purchasing-rfq", moduleId: "purchasing", labelAr: "طلب عرض الأسعار", labelEn: "Request for Quotation" },
  { id: "purchasing-vendor-comparison", moduleId: "purchasing", labelAr: "مقارنة المورّدين", labelEn: "Vendor Comparison" },
  { id: "purchasing-orders", moduleId: "purchasing", labelAr: "أوامر الشراء", labelEn: "Purchase Orders" },
  { id: "purchasing-agreements", moduleId: "purchasing", labelAr: "اتفاقيات الشراء", labelEn: "Purchase Agreements" },
  { id: "purchasing-receipts", moduleId: "purchasing", labelAr: "استلام المشتريات", labelEn: "Purchase Receipts" },
  { id: "purchasing-vendor-bills", moduleId: "purchasing", labelAr: "فواتير المورّدين", labelEn: "Vendor Bills" },
  { id: "purchasing-reporting", moduleId: "purchasing", labelAr: "تقارير التوريد", labelEn: "Procurement Reporting" },

  // ══ Inventory ══
  { id: "inventory-products", moduleId: "inventory", labelAr: "إدارة الأصناف", labelEn: "Product Management" },
  { id: "inventory-on-hand", moduleId: "inventory", labelAr: "المخزون الحالي", labelEn: "Stock On Hand" },
  { id: "inventory-adjustments", moduleId: "inventory", labelAr: "تسويات المخزون", labelEn: "Inventory Adjustment" },
  { id: "inventory-transfers", moduleId: "inventory", labelAr: "التحويلات المخزنية", labelEn: "Stock Transfers" },
  { id: "inventory-lot-serial", moduleId: "inventory", labelAr: "تتبّع الدفعات والأرقام التسلسلية", labelEn: "Lot & Serial Tracking" },
  { id: "inventory-expiration", moduleId: "inventory", labelAr: "إدارة تواريخ الصلاحية", labelEn: "Expiration Date Management" },
  { id: "inventory-valuation", moduleId: "inventory", labelAr: "تقييم المخزون", labelEn: "Stock Valuation" },
  { id: "inventory-reordering", moduleId: "inventory", labelAr: "قواعد إعادة الطلب", labelEn: "Reordering Rules" },
  { id: "inventory-reporting", moduleId: "inventory", labelAr: "تقارير المخزون", labelEn: "Inventory Reporting" },

  // ══ Warehouse ══
  { id: "warehouse-receiving", moduleId: "warehouse", labelAr: "الاستلام", labelEn: "Receiving" },
  { id: "warehouse-putaway", moduleId: "warehouse", labelAr: "التخزين", labelEn: "Putaway" },
  { id: "warehouse-locations", moduleId: "warehouse", labelAr: "مواقع التخزين", labelEn: "Storage Locations" },
  { id: "warehouse-picking", moduleId: "warehouse", labelAr: "الانتقاء", labelEn: "Picking" },
  { id: "warehouse-packing", moduleId: "warehouse", labelAr: "التعبئة", labelEn: "Packing" },
  { id: "warehouse-shipping", moduleId: "warehouse", labelAr: "الشحن", labelEn: "Shipping" },
  { id: "warehouse-cycle-counting", moduleId: "warehouse", labelAr: "الجرد الدوري", labelEn: "Cycle Counting" },
  { id: "warehouse-operations", moduleId: "warehouse", labelAr: "عمليات المستودع", labelEn: "Warehouse Operations" },

  // ══ Manufacturing ══
  { id: "manufacturing-product-structure", moduleId: "manufacturing", labelAr: "هيكل المنتج", labelEn: "Product Structure" },
  { id: "manufacturing-bom", moduleId: "manufacturing", labelAr: "قائمة المكوّنات", labelEn: "Bill of Materials (BOM)" },
  { id: "manufacturing-orders", moduleId: "manufacturing", labelAr: "أوامر التصنيع", labelEn: "Manufacturing Orders" },
  { id: "manufacturing-work-orders", moduleId: "manufacturing", labelAr: "أوامر العمل", labelEn: "Work Orders" },
  { id: "manufacturing-work-centers", moduleId: "manufacturing", labelAr: "مراكز العمل", labelEn: "Work Centers" },
  { id: "manufacturing-routing", moduleId: "manufacturing", labelAr: "مسار التشغيل", labelEn: "Routing" },
  { id: "manufacturing-planning", moduleId: "manufacturing", labelAr: "تخطيط الإنتاج", labelEn: "Production Planning" },
  { id: "manufacturing-mrp", moduleId: "manufacturing", labelAr: "تخطيط احتياجات المواد", labelEn: "Material Requirements Planning (MRP)" },
  { id: "manufacturing-costing", moduleId: "manufacturing", labelAr: "تكاليف الإنتاج", labelEn: "Production Costing" },
  { id: "manufacturing-scrap", moduleId: "manufacturing", labelAr: "إدارة الهالك", labelEn: "Scrap Management" },

  // ══ Quality ══
  { id: "quality-qc", moduleId: "quality", labelAr: "ضبط الجودة", labelEn: "Quality Control (QC)" },
  { id: "quality-qa", moduleId: "quality", labelAr: "ضمان الجودة", labelEn: "Quality Assurance (QA)" },
  { id: "quality-inspection", moduleId: "quality", labelAr: "فحص الجودة", labelEn: "Quality Inspection" },
  { id: "quality-alerts", moduleId: "quality", labelAr: "تنبيهات الجودة", labelEn: "Quality Alerts" },
  { id: "quality-non-conformance", moduleId: "quality", labelAr: "عدم المطابقة", labelEn: "Non-Conformance" },
  { id: "quality-capa", moduleId: "quality", labelAr: "الإجراءات التصحيحية والوقائية", labelEn: "Corrective & Preventive Actions (CAPA)" },
  { id: "quality-reporting", moduleId: "quality", labelAr: "تقارير الجودة", labelEn: "Quality Reporting" },

  // ══ Maintenance ══
  { id: "maintenance-preventive", moduleId: "maintenance", labelAr: "الصيانة الوقائية", labelEn: "Preventive Maintenance" },
  { id: "maintenance-corrective", moduleId: "maintenance", labelAr: "الصيانة التصحيحية", labelEn: "Corrective Maintenance" },
  { id: "maintenance-work-orders", moduleId: "maintenance", labelAr: "أوامر عمل الصيانة", labelEn: "Maintenance Work Orders" },
  { id: "maintenance-assets", moduleId: "maintenance", labelAr: "صيانة الأصول", labelEn: "Asset Maintenance" },
  { id: "maintenance-schedules", moduleId: "maintenance", labelAr: "جداول الصيانة", labelEn: "Maintenance Schedules" },
  { id: "maintenance-spare-parts", moduleId: "maintenance", labelAr: "قطع الغيار", labelEn: "Spare Parts" },
  { id: "maintenance-reporting", moduleId: "maintenance", labelAr: "تقارير الصيانة", labelEn: "Maintenance Reporting" },

  // ══ Human Resources ══
  { id: "hr-employees", moduleId: "hr", labelAr: "إدارة الموظفين", labelEn: "Employee Management" },
  { id: "hr-recruitment", moduleId: "hr", labelAr: "التوظيف", labelEn: "Recruitment" },
  { id: "hr-attendance", moduleId: "hr", labelAr: "الحضور", labelEn: "Attendance" },
  { id: "hr-leave", moduleId: "hr", labelAr: "إدارة الإجازات", labelEn: "Leave Management" },
  { id: "hr-contracts", moduleId: "hr", labelAr: "عقود الموظفين", labelEn: "Employee Contracts" },
  { id: "hr-performance", moduleId: "hr", labelAr: "إدارة الأداء", labelEn: "Performance Management" },
  { id: "hr-training", moduleId: "hr", labelAr: "التدريب والتطوير", labelEn: "Training & Development" },
  { id: "hr-appraisal", moduleId: "hr", labelAr: "تقييم الأداء", labelEn: "Employee Appraisal" },

  // ══ Payroll ══
  { id: "payroll-structure", moduleId: "payroll", labelAr: "هيكل الراتب", labelEn: "Salary Structure" },
  { id: "payroll-rules", moduleId: "payroll", labelAr: "قواعد الراتب", labelEn: "Salary Rules" },
  { id: "payroll-payslips", moduleId: "payroll", labelAr: "قسائم الرواتب", labelEn: "Payslips" },
  { id: "payroll-accounting", moduleId: "payroll", labelAr: "محاسبة الرواتب", labelEn: "Payroll Accounting" },
  { id: "payroll-deductions", moduleId: "payroll", labelAr: "الاستقطاعات", labelEn: "Deductions" },
  { id: "payroll-allowances", moduleId: "payroll", labelAr: "البدلات", labelEn: "Allowances" },
  { id: "payroll-reporting", moduleId: "payroll", labelAr: "تقارير الرواتب", labelEn: "Payroll Reporting" },

  // ══ CRM ══
  { id: "crm-leads", moduleId: "crm", labelAr: "العملاء المحتملون", labelEn: "Leads Management" },
  { id: "crm-opportunities", moduleId: "crm", labelAr: "الفرص البيعية", labelEn: "Opportunities" },
  { id: "crm-pipeline", moduleId: "crm", labelAr: "خط الفرص", labelEn: "Customer Pipeline" },
  { id: "crm-activities", moduleId: "crm", labelAr: "أنشطة العملاء", labelEn: "Customer Activities" },
  { id: "crm-follow-up", moduleId: "crm", labelAr: "متابعة العملاء", labelEn: "Customer Follow-up" },
  { id: "crm-segmentation", moduleId: "crm", labelAr: "تصنيف العملاء", labelEn: "Customer Segmentation" },

  // ══ Projects ══
  { id: "projects-planning", moduleId: "projects", labelAr: "تخطيط المشروع", labelEn: "Project Planning" },
  { id: "projects-tasks", moduleId: "projects", labelAr: "إدارة المهام", labelEn: "Task Management" },
  { id: "projects-timesheets", moduleId: "projects", labelAr: "كشوف الوقت", labelEn: "Timesheets" },
  { id: "projects-costing", moduleId: "projects", labelAr: "تكاليف المشروع", labelEn: "Project Costing" },
  { id: "projects-budgeting", moduleId: "projects", labelAr: "موازنة المشروع", labelEn: "Project Budgeting" },
  { id: "projects-reporting", moduleId: "projects", labelAr: "تقارير المشروع", labelEn: "Project Reporting" },

  // ══ Assets ══
  { id: "assets-registration", moduleId: "assets", labelAr: "تسجيل الأصول", labelEn: "Asset Registration" },
  { id: "assets-acquisition", moduleId: "assets", labelAr: "حيازة الأصول", labelEn: "Asset Acquisition" },
  { id: "assets-depreciation", moduleId: "assets", labelAr: "إهلاك الأصول", labelEn: "Asset Depreciation" },
  { id: "assets-transfer", moduleId: "assets", labelAr: "نقل الأصول", labelEn: "Asset Transfer" },
  { id: "assets-disposal", moduleId: "assets", labelAr: "التصرف في الأصول", labelEn: "Asset Disposal" },
  { id: "assets-reporting", moduleId: "assets", labelAr: "تقارير الأصول", labelEn: "Asset Reporting" },

  // ══ Supply Chain ══
  { id: "scm-demand-planning", moduleId: "scm", labelAr: "تخطيط الطلب", labelEn: "Demand Planning" },
  { id: "scm-supply-planning", moduleId: "scm", labelAr: "تخطيط التوريد", labelEn: "Supply Planning" },
  { id: "scm-suppliers", moduleId: "scm", labelAr: "إدارة المورّدين", labelEn: "Supplier Management" },
  { id: "scm-distribution", moduleId: "scm", labelAr: "تخطيط التوزيع", labelEn: "Distribution Planning" },
  { id: "scm-logistics", moduleId: "scm", labelAr: "إدارة اللوجستيات", labelEn: "Logistics Management" },
  { id: "scm-transportation", moduleId: "scm", labelAr: "إدارة النقل", labelEn: "Transportation Management" },

  // ══ Planning ══
  { id: "planning-demand-planning", moduleId: "planning", labelAr: "تخطيط الطلب", labelEn: "Demand Planning" },
  { id: "planning-supply-planning", moduleId: "planning", labelAr: "تخطيط التوريد", labelEn: "Supply Planning" },
  { id: "planning-master-schedule", moduleId: "planning", labelAr: "الجدول الرئيسي للإنتاج", labelEn: "Master Production Schedule" },
  { id: "planning-scheduling", moduleId: "planning", labelAr: "الجدولة", labelEn: "Scheduling" },
  { id: "planning-capacity", moduleId: "planning", labelAr: "تخطيط الطاقة", labelEn: "Capacity Planning" },
  { id: "planning-forecasting", moduleId: "planning", labelAr: "التنبؤ", labelEn: "Forecasting" },

  // ══ PLM ══
  { id: "plm-products", moduleId: "plm", labelAr: "إدارة المنتجات", labelEn: "Product Management" },
  { id: "plm-versions", moduleId: "plm", labelAr: "إدارة الإصدارات", labelEn: "Version Management" },
  { id: "plm-engineering-changes", moduleId: "plm", labelAr: "التغييرات الهندسية", labelEn: "Engineering Changes" },
  { id: "plm-lifecycles", moduleId: "plm", labelAr: "إدارة دورة الحياة", labelEn: "Lifecycle Management" },
  { id: "plm-documents", moduleId: "plm", labelAr: "مستندات المنتج", labelEn: "Product Documents" },

  // ══ POS ══
  { id: "pos-terminals", moduleId: "pos", labelAr: "الأجهزة", labelEn: "Terminals" },
  { id: "pos-sessions", moduleId: "pos", labelAr: "الجلسات", labelEn: "Sessions" },
  { id: "pos-transactions", moduleId: "pos", labelAr: "الحركات", labelEn: "Transactions" },
  { id: "pos-payments", moduleId: "pos", labelAr: "المدفوعات", labelEn: "Payments" },
  { id: "pos-receipts", moduleId: "pos", labelAr: "الإيصالات", labelEn: "Receipts" },
  { id: "pos-returns", moduleId: "pos", labelAr: "المرتجعات", labelEn: "Returns" },

  // ══ E-commerce ══
  { id: "ecommerce-catalog", moduleId: "ecommerce", labelAr: "الكتالوج", labelEn: "Catalog" },
  { id: "ecommerce-cart", moduleId: "ecommerce", labelAr: "السلة", labelEn: "Cart" },
  { id: "ecommerce-checkout", moduleId: "ecommerce", labelAr: "إتمام الشراء", labelEn: "Checkout" },
  { id: "ecommerce-orders", moduleId: "ecommerce", labelAr: "الطلبات", labelEn: "Orders" },
  { id: "ecommerce-payments", moduleId: "ecommerce", labelAr: "المدفوعات", labelEn: "Payments" },
  { id: "ecommerce-shipping", moduleId: "ecommerce", labelAr: "الشحن", labelEn: "Shipping" },

  // ══ Services ══
  { id: "services-tickets", moduleId: "services", labelAr: "تذاكر الخدمة", labelEn: "Service Tickets" },
  { id: "services-calls", moduleId: "services", labelAr: "زيارات الخدمة", labelEn: "Service Calls" },
  { id: "services-work-orders", moduleId: "services", labelAr: "أوامر عمل الخدمة", labelEn: "Service Work Orders" },
  { id: "services-sla", moduleId: "services", labelAr: "اتفاقيات مستوى الخدمة", labelEn: "Service Level Agreements" },
  { id: "services-technicians", moduleId: "services", labelAr: "الفنيون", labelEn: "Technicians" },
  { id: "services-parts", moduleId: "services", labelAr: "قطع الغيار", labelEn: "Spare Parts" },

  // ══ Business Intelligence ══
  { id: "bi-dashboards", moduleId: "bi", labelAr: "لوحات المعلومات", labelEn: "Dashboards" },
  { id: "bi-reports", moduleId: "bi", labelAr: "التقارير", labelEn: "Reports" },
  { id: "bi-kpis", moduleId: "bi", labelAr: "مؤشرات الأداء", labelEn: "KPIs" },
  { id: "bi-data-sources", moduleId: "bi", labelAr: "مصادر البيانات", labelEn: "Data Sources" },
  { id: "bi-analytics", moduleId: "bi", labelAr: "التحليلات", labelEn: "Analytics" },

  // ══ Administration ══
  { id: "administration-users", moduleId: "administration", labelAr: "إدارة المستخدمين", labelEn: "User Management" },
  { id: "administration-roles", moduleId: "administration", labelAr: "الأدوار والصلاحيات", labelEn: "Roles & Permissions" },
  { id: "administration-access-control", moduleId: "administration", labelAr: "ضبط الوصول", labelEn: "Access Control" },
  { id: "administration-workflow", moduleId: "administration", labelAr: "إعداد سير العمل", labelEn: "Workflow Configuration" },
  { id: "administration-approvals", moduleId: "administration", labelAr: "إدارة الاعتمادات", labelEn: "Approval Management" },
  { id: "administration-system", moduleId: "administration", labelAr: "إعداد النظام", labelEn: "System Configuration" },
  { id: "administration-multi-company", moduleId: "administration", labelAr: "إدارة الشركات المتعددة", labelEn: "Multi-Company Management" },
  { id: "administration-multi-currency", moduleId: "administration", labelAr: "إدارة العملات المتعددة", labelEn: "Multi-Currency Management" },
  { id: "administration-import-export", moduleId: "administration", labelAr: "استيراد وتصدير البيانات", labelEn: "Data Import & Export" },
  { id: "administration-audit", moduleId: "administration", labelAr: "سجل التدقيق", labelEn: "Audit Trail" },

  // ══ Documents ══
  { id: "documents-repository", moduleId: "documents", labelAr: "المستودع", labelEn: "Repository" },
  { id: "documents-types", moduleId: "documents", labelAr: "أنواع المستندات", labelEn: "Document Types" },
  { id: "documents-templates", moduleId: "documents", labelAr: "القوالب", labelEn: "Templates" },
  { id: "documents-versioning", moduleId: "documents", labelAr: "الإصدارات", labelEn: "Versioning" },
  { id: "documents-retention", moduleId: "documents", labelAr: "الاحتفاظ", labelEn: "Retention" },
  { id: "documents-approvals", moduleId: "documents", labelAr: "اعتماد المستندات", labelEn: "Document Approvals" },

  // ══ Cross-functional: Management ══
  { id: "management-strategy", moduleId: "management", labelAr: "الاستراتيجية", labelEn: "Strategy" },
  { id: "management-governance", moduleId: "management", labelAr: "الحوكمة", labelEn: "Governance" },
  { id: "management-delegation", moduleId: "management", labelAr: "التفويض", labelEn: "Delegation" },
  { id: "management-alignment", moduleId: "management", labelAr: "المواءمة", labelEn: "Alignment" },
  { id: "management-escalation", moduleId: "management", labelAr: "التصعيد", labelEn: "Escalation" },

  // ══ Cross-functional: Communication ══
  { id: "communication-email", moduleId: "communication", labelAr: "البريد", labelEn: "Email" },
  { id: "communication-meetings", moduleId: "communication", labelAr: "الاجتماعات", labelEn: "Meetings" },
  { id: "communication-reporting", moduleId: "communication", labelAr: "التقارير الإدارية", labelEn: "Management Reporting" },
  { id: "communication-escalation", moduleId: "communication", labelAr: "التصعيد", labelEn: "Escalation" },

  // ══ Cross-functional: IT ══
  { id: "it-databases", moduleId: "it", labelAr: "قواعد البيانات", labelEn: "Databases" },
  { id: "it-apis", moduleId: "it", labelAr: "واجهات البرمجة", labelEn: "APIs" },
  { id: "it-debugging", moduleId: "it", labelAr: "تتبّع الأخطاء", labelEn: "Debugging" },
  { id: "it-testing", moduleId: "it", labelAr: "الاختبار", labelEn: "Testing" },
  { id: "it-deployment", moduleId: "it", labelAr: "النشر", labelEn: "Deployment" },
  { id: "it-git", moduleId: "it", labelAr: "Git والتحكم بالإصدارات", labelEn: "Git & Version Control" },
  { id: "it-linux", moduleId: "it", labelAr: "Linux والأوامر", labelEn: "Linux & Shell" },
  { id: "it-networking", moduleId: "it", labelAr: "الشبكات", labelEn: "Networking" },
  { id: "it-cicd", moduleId: "it", labelAr: "CI/CD والأتمتة", labelEn: "CI/CD & Automation" },
  { id: "it-monitoring", moduleId: "it", labelAr: "المراقبة والتنبيهات", labelEn: "Monitoring & Alerting" },
  { id: "it-security", moduleId: "it", labelAr: "أمن المعلومات", labelEn: "Security" },

  // ══ Cross-functional: General ══
  { id: "general-terms", moduleId: "general", labelAr: "مصطلحات عامة", labelEn: "General Terms" },
  { id: "general-business", moduleId: "general", labelAr: "أساسيات الأعمال", labelEn: "Business Basics" },
  { id: "general-numbers", moduleId: "general", labelAr: "الأرقام والمبالغ", labelEn: "Numbers & Amounts" },
  { id: "general-time", moduleId: "general", labelAr: "الوقت والتواريخ", labelEn: "Time & Dates" },
];

export const SUB_MODULE_MAP: Record<string, SubModuleMeta> = SUB_MODULES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<string, SubModuleMeta>
);

export const SUB_MODULE_IDS = SUB_MODULES.map((s) => s.id);
export const SUB_MODULE_ID_SET = new Set(SUB_MODULE_IDS);

export function subModulesByModule(moduleId: ModuleId): SubModuleMeta[] {
  return SUB_MODULES.filter((s) => s.moduleId === moduleId);
}

export function subModuleLabel(id: string | undefined, lang: "ar" | "en"): string {
  if (!id) return "";
  const s = SUB_MODULE_MAP[id];
  if (!s) return id;
  return lang === "en" ? s.labelEn : s.labelAr;
}
