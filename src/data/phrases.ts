export interface ProcessStep {
  en: string;
  ar: string;
}

export interface ProcessPack {
  id: string;
  code: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  steps: ProcessStep[];
}

export const PROCESS_PACKS: ProcessPack[] = [
  {
    id: "p2p",
    code: "P2P",
    icon: "📥",
    titleEn: "Procure to Pay",
    titleAr: "من الطلب إلى الدفع",
    descEn: "The full cycle from requesting goods to paying the supplier.",
    descAr: "الدورة الكاملة من طلب البضاعة حتى دفع المورّد.",
    steps: [
      { en: "Raise a purchase requisition", ar: "ارفع طلب شراء داخلي" },
      { en: "Issue a purchase order to the vendor", ar: "أصدر أمر شراء للمورّد" },
      { en: "Receive the goods and record the GRN", ar: "استلم البضاعة وسجّل سند الاستلام" },
      { en: "Perform a three-way match", ar: "أجرِ المطابقة الثلاثية" },
      { en: "Approve the supplier invoice", ar: "اعتمد فاتورة المورّد" },
      { en: "Pay the vendor and clear the liability", ar: "ادفع للمورّد وقاصّ الالتزام" },
    ],
  },
  {
    id: "o2c",
    code: "O2C",
    icon: "📤",
    titleEn: "Order to Cash",
    titleAr: "من الطلب إلى التحصيل",
    descEn: "From a customer order through delivery to collecting payment.",
    descAr: "من طلب العميل عبر التسليم حتى تحصيل الدفع.",
    steps: [
      { en: "Send a quotation to the customer", ar: "أرسل عرض سعر للعميل" },
      { en: "Confirm the sales order", ar: "أكّد أمر البيع" },
      { en: "Pick, pack, and ship the goods", ar: "انتقِ وغلّف واشحن البضاعة" },
      { en: "Issue a delivery note", ar: "أصدر إشعار تسليم" },
      { en: "Raise the customer invoice", ar: "أصدر فاتورة العميل" },
      { en: "Collect payment and clear the receivable", ar: "حصّل الدفع وقاصّ الذمة" },
    ],
  },
  {
    id: "r2r",
    code: "R2R",
    icon: "📊",
    titleEn: "Record to Report",
    titleAr: "من التسجيل إلى التقرير",
    descEn: "Recording transactions and producing financial statements.",
    descAr: "تسجيل المعاملات وإصدار القوائم المالية.",
    steps: [
      { en: "Post journal entries", ar: "رحّل قيود اليومية" },
      { en: "Reconcile the general ledger accounts", ar: "طابق حسابات دفتر الأستاذ" },
      { en: "Record accruals and adjustments", ar: "سجّل الاستحقاقات والتسويات" },
      { en: "Close the accounting period", ar: "أقفل الفترة المحاسبية" },
      { en: "Prepare the trial balance", ar: "أعدّ ميزان المراجعة" },
      { en: "Produce the financial statements", ar: "أصدر القوائم المالية" },
    ],
  },
  {
    id: "close",
    code: "CLOSE",
    icon: "🔒",
    titleEn: "Month-End Close",
    titleAr: "الإقفال الشهري",
    descEn: "The checklist to finalize and lock a monthly period.",
    descAr: "قائمة الخطوات لإنهاء الشهر وإقفال الفترة.",
    steps: [
      { en: "Cut off all transactions for the period", ar: "أوقف كل معاملات الفترة" },
      { en: "Close the sub-ledgers", ar: "أقفل الدفاتر الفرعية" },
      { en: "Post accruals and depreciation run", ar: "رحّل الاستحقاقات ومهمة الإهلاك" },
      { en: "Complete bank and account reconciliations", ar: "أكمل مطابقات البنك والحسابات" },
      { en: "Review the numbers with management", ar: "راجع الأرقام مع الإدارة" },
      { en: "Lock the period to prevent changes", ar: "أقفل الفترة لمنع التعديلات" },
    ],
  },
];

export interface Abbreviation {
  abbr: string;
  en: string;
  ar: string;
}

export const ABBREVIATIONS: Abbreviation[] = [
  { abbr: "ERP", en: "Enterprise Resource Planning", ar: "تخطيط موارد المؤسسات" },
  { abbr: "PO", en: "Purchase Order", ar: "أمر الشراء" },
  { abbr: "SO", en: "Sales Order", ar: "أمر البيع" },
  { abbr: "PR", en: "Purchase Requisition", ar: "طلب الشراء الداخلي" },
  { abbr: "GRN", en: "Goods Received Note", ar: "سند استلام البضاعة" },
  { abbr: "RFQ", en: "Request for Quotation", ar: "طلب عرض السعر" },
  { abbr: "BOM", en: "Bill of Materials", ar: "قائمة المكوّنات" },
  { abbr: "MRP", en: "Material Requirements Planning", ar: "تخطيط احتياجات المواد" },
  { abbr: "SKU", en: "Stock Keeping Unit", ar: "معرّف وحدة التخزين" },
  { abbr: "UoM", en: "Unit of Measure", ar: "وحدة القياس" },
  { abbr: "GL", en: "General Ledger", ar: "دفتر الأستاذ العام" },
  { abbr: "AP", en: "Accounts Payable", ar: "الذمم الدائنة" },
  { abbr: "AR", en: "Accounts Receivable", ar: "الذمم المدينة" },
  { abbr: "COA", en: "Chart of Accounts", ar: "دليل الحسابات" },
  { abbr: "NBV", en: "Net Book Value", ar: "القيمة الدفترية الصافية" },
  { abbr: "WIP", en: "Work in Progress", ar: "أعمال تحت التنفيذ" },
  { abbr: "KPI", en: "Key Performance Indicator", ar: "مؤشر الأداء الرئيسي" },
  { abbr: "SLA", en: "Service Level Agreement", ar: "اتفاقية مستوى الخدمة" },
  { abbr: "UAT", en: "User Acceptance Testing", ar: "اختبار قبول المستخدم" },
  { abbr: "RMA", en: "Return Merchandise Authorization", ar: "إذن إرجاع البضاعة" },
  { abbr: "RACI", en: "Responsible, Accountable, Consulted, Informed", ar: "مصفوفة المسؤوليات" },
  { abbr: "OEE", en: "Overall Equipment Effectiveness", ar: "الفعالية الكلية للمعدات" },
  { abbr: "JIT", en: "Just-In-Time", ar: "في الوقت المناسب" },
  { abbr: "FTE", en: "Full-Time Equivalent", ar: "ما يعادل الدوام الكامل" },
];

export interface Collocation {
  en: string;
  ar: string;
  module?: string;
}

export const COLLOCATIONS: Collocation[] = [
  { en: "raise a purchase order", ar: "يُصدر أمر شراء", module: "purchasing" },
  { en: "issue an invoice", ar: "يُصدر فاتورة", module: "finance" },
  { en: "reconcile the ledger", ar: "يطابق دفتر الأستاذ", module: "finance" },
  { en: "approve a request", ar: "يعتمد طلبًا", module: "management" },
  { en: "close the books", ar: "يُقفل الدفاتر", module: "finance" },
  { en: "run payroll", ar: "يصرف الرواتب", module: "hr" },
  { en: "post a journal entry", ar: "يرحّل قيد يومية", module: "finance" },
  { en: "match the invoice to the PO", ar: "يطابق الفاتورة مع أمر الشراء", module: "purchasing" },
  { en: "clear a payment", ar: "يقاصّ دفعة", module: "finance" },
  { en: "process a return", ar: "يعالج عملية إرجاع", module: "sales" },
  { en: "book an asset", ar: "يسجّل أصلًا", module: "assets" },
  { en: "take a physical count", ar: "يُجري جردًا فعليًا", module: "inventory" },
  { en: "escalate a ticket", ar: "يصعّد تذكرة", module: "it" },
  { en: "grant user access", ar: "يمنح صلاحية للمستخدم", module: "it" },
  { en: "set a sales target", ar: "يحدّد هدف مبيعات", module: "sales" },
  { en: "meet a deadline", ar: "يلتزم بموعد نهائي", module: "communication" },
  { en: "schedule a performance review", ar: "يجدول مراجعة أداء", module: "hr" },
  { en: "submit a report", ar: "يقدّم تقريرًا", module: "general" },
  { en: "update master data", ar: "يحدّث البيانات الأساسية", module: "general" },
  { en: "release a new version", ar: "يُصدر نسخة جديدة", module: "it" },
];

export interface EmailTemplate {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  subjectEn: string;
  subjectAr: string;
  bodyEn: string;
  bodyAr: string;
  tipsEn: string[];
  tipsAr: string[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "request-info",
    icon: "❓",
    titleEn: "Request for information",
    titleAr: "طلب معلومات",
    subjectEn: "Request for details – [topic]",
    subjectAr: "طلب تفاصيل – [الموضوع]",
    bodyEn:
      "Dear [Name],\n\nI hope you are well. Could you please share the details of [topic]?\nSpecifically, I need [item 1] and [item 2] by [date].\n\nThank you in advance.\n\nBest regards,\n[Your name]",
    bodyAr:
      "عزيزي [الاسم]،\n\nأتمنى أن تكون بخير. هل يمكنك مشاركة تفاصيل [الموضوع]؟\nأحتاج تحديدًا [البند 1] و[البند 2] بحلول [التاريخ].\n\nشكرًا مقدمًا.\n\nمع التحية،\n[اسمك]",
    tipsEn: ["Keep the request specific and short.", "Always give a clear deadline."],
    tipsAr: ["اجعل الطلب محددًا ومختصرًا.", "حدّد دائمًا موعدًا نهائيًا واضحًا."],
  },
  {
    id: "follow-up",
    icon: "🔁",
    titleEn: "Follow-up on a request",
    titleAr: "متابعة طلب",
    subjectEn: "Following up: [subject]",
    subjectAr: "متابعة: [الموضوع]",
    bodyEn:
      "Dear [Name],\n\nI am following up on my previous message about [subject] sent on [date].\nCould you please confirm the status?\n\nLet me know if you need anything from my side.\n\nKind regards,\n[Your name]",
    bodyAr:
      "عزيزي [الاسم]،\n\nأتابع رسالتي السابقة بشأن [الموضوع] المرسلة بتاريخ [التاريخ].\nهل يمكنك تأكيد الحالة؟\n\nأخبرني إن كنت بحاجة إلى أي شيء من جانبي.\n\nمع التحية،\n[اسمك]",
    tipsEn: ["Reference the original date.", "Stay polite, not pressing."],
    tipsAr: ["أشر إلى تاريخ الرسالة الأصلية.", "ابقَ مهذبًا دون إلحاح."],
  },
  {
    id: "approval",
    icon: "✅",
    titleEn: "Approval request",
    titleAr: "طلب اعتماد",
    subjectEn: "Approval needed – [request]",
    subjectAr: "مطلوب اعتماد – [الطلب]",
    bodyEn:
      "Dear [Name],\n\nPlease find attached [document] for your approval.\nThe request is for [amount / scope] and is needed by [date].\n\nDo let me know if any clarification is required.\n\nBest regards,\n[Your name]",
    bodyAr:
      "عزيزي [الاسم]،\n\nتجد مرفقًا [المستند] لاعتمادك.\nالطلب بمقدار [المبلغ / النطاق] ومطلوب بحلول [التاريخ].\n\nأبلغني إن لزم أي توضيح.\n\nمع التحية،\n[اسمك]",
    tipsEn: ["State the amount and deadline up front.", "Attach the supporting document."],
    tipsAr: ["اذكر المبلغ والموعد في البداية.", "أرفق المستند الداعم."],
  },
  {
    id: "escalation",
    icon: "🚨",
    titleEn: "Escalation of an overdue item",
    titleAr: "تصعيد بند متأخر",
    subjectEn: "Escalation: [issue] still open",
    subjectAr: "تصعيد: [المشكلة] ما زالت مفتوحة",
    bodyEn:
      "Dear [Name],\n\nThis issue has been open since [date] and is now affecting [impact].\nAs it passed the agreed deadline, I am escalating it for your attention.\n\nPlease advise on the next step.\n\nRegards,\n[Your name]",
    bodyAr:
      "عزيزي [الاسم]،\n\nالمشكلة مفتوحة منذ [التاريخ] وتؤثر الآن على [الأثر].\nوبما أنها تجاوزت الموعد المتفق عليه، أصعّدها لاهتمامك.\n\nأرشدني بشأن الخطوة التالية.\n\nمع التحية،\n[اسمك]",
    tipsEn: ["State the impact, not just the delay.", "Escalate after the deadline, not before."],
    tipsAr: ["اذكر الأثر لا مجرد التأخير.", "صعّد بعد انقضاء الموعد لا قبله."],
  },
  {
    id: "meeting",
    icon: "📅",
    titleEn: "Meeting invitation",
    titleAr: "دعوة اجتماع",
    subjectEn: "Meeting invitation: [topic]",
    subjectAr: "دعوة اجتماع: [الموضوع]",
    bodyEn:
      "Dear all,\n\nI would like to schedule a meeting on [topic].\nDate: [date]\nTime: [time]\nAgenda: [point 1], [point 2].\n\nPlease confirm your attendance.\n\nBest regards,\n[Your name]",
    bodyAr:
      "تحية طيبة للجميع،\n\nأود تحديد اجتماع بشأن [الموضوع].\nالتاريخ: [التاريخ]\nالوقت: [الوقت]\nجدول الأعمال: [البند 1]، [البند 2].\n\nيرجى تأكيد الحضور.\n\nمع التحية،\n[اسمك]",
    tipsEn: ["Always include an agenda.", "Ask for attendance confirmation."],
    tipsAr: ["أدرج جدول الأعمال دائمًا.", "اطلب تأكيد الحضور."],
  },
];

