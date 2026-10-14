export interface ReadingParagraph {
  en: string;
  ar: string;
}

export interface ReadingTerm {
  term: string;
  ar: string;
}

export interface ReadingArticle {
  id: string;
  level: string;
  icon: string;
  minutes: number;
  titleEn: string;
  titleAr: string;
  paragraphs: ReadingParagraph[];
  glossary: ReadingTerm[];
}

export const READING: ReadingArticle[] = [
  {
    id: "what-is-erp",
    level: "A2",
    icon: "🧠",
    minutes: 4,
    titleEn: "What is an ERP system?",
    titleAr: "ما هو نظام ERP؟",
    paragraphs: [
      {
        en: "An ERP system brings the main business functions into one place. Finance, inventory, sales, and procurement all share the same data.",
        ar: "يجمع نظام ERP الوظائف الرئيسية للأعمال في مكان واحد. تشترك المالية والمخزون والمبيعات والمشتريات في البيانات نفسها.",
      },
      {
        en: "Instead of many separate programs, one system records each transaction once. This reduces errors and saves time.",
        ar: "بدلًا من برامج منفصلة كثيرة، يسجّل نظام واحد كل معاملة مرة واحدة. هذا يقلّل الأخطاء ويوفّر الوقت.",
      },
      {
        en: "When a sale is confirmed, the system updates the stock and creates an invoice automatically.",
        ar: "عند تأكيد عملية بيع، يحدّث النظام المخزون ويُنشئ فاتورة تلقائيًا.",
      },
    ],
    glossary: [
      { term: "ERP", ar: "تخطيط موارد المؤسسات" },
      { term: "transaction", ar: "معاملة" },
      { term: "invoice", ar: "فاتورة" },
    ],
  },
  {
    id: "inventory-valuation",
    level: "B2",
    icon: "📦",
    minutes: 5,
    titleEn: "Inventory valuation methods",
    titleAr: "طرق تقييم المخزون",
    paragraphs: [
      {
        en: "Inventory valuation decides the cost of goods sold and the value of stock on hand.",
        ar: "يحدّد تقييم المخزون تكلفة البضاعة المباعة وقيمة المخزون المتبقي.",
      },
      {
        en: "Under FIFO, the oldest items are sold first. Under weighted average, every unit carries the same average cost.",
        ar: "في طريقة FIFO تُباع الأصناف الأقدم أولًا. وفي المتوسط المرجّح يحمل كل صنف التكلفة المتوسطة نفسها.",
      },
      {
        en: "The chosen method must be applied consistently, because it affects profit and tax reports.",
        ar: "يجب تطبيق الطريقة المختارة باستمرار لأنها تؤثر على الأرباح والتقارير الضريبية.",
      },
    ],
    glossary: [
      { term: "FIFO", ar: "الوارد أولًا صادر أولًا" },
      { term: "weighted average", ar: "المتوسط المرجّح" },
      { term: "cost of goods sold", ar: "تكلفة البضاعة المباعة" },
    ],
  },
  {
    id: "understanding-sla",
    level: "B1",
    icon: "⏱️",
    minutes: 4,
    titleEn: "Understanding an SLA",
    titleAr: "فهم اتفاقية مستوى الخدمة",
    paragraphs: [
      {
        en: "An SLA is a contract that defines the level of service a provider must deliver.",
        ar: "اتفاقية مستوى الخدمة عقد يحدّد مستوى الخدمة الذي يجب أن يقدّمه المزوّد.",
      },
      {
        en: "It usually sets targets for response time, resolution time, and uptime.",
        ar: "تحدّد عادةً مستهدفات لزمن الاستجابة وزمن الحل ونسبة التوفّر.",
      },
      {
        en: "If the provider misses a target, the agreement may include penalties or service credits.",
        ar: "إذا لم يحقّق المزوّد المستهدف، فقد تتضمن الاتفاقية غرامات أو أرصدة خدمة.",
      },
    ],
    glossary: [
      { term: "SLA", ar: "اتفاقية مستوى الخدمة" },
      { term: "uptime", ar: "نسبة التوفّر" },
      { term: "response time", ar: "زمن الاستجابة" },
    ],
  },
  {
    id: "data-governance",
    level: "C1",
    icon: "🗄️",
    minutes: 6,
    titleEn: "Data governance basics",
    titleAr: "أساسيات حوكمة البيانات",
    paragraphs: [
      {
        en: "Data governance defines who can create, change, and approve master data across the organization.",
        ar: "تحدّد حوكمة البيانات من يحقّ له إنشاء البيانات الأساسية وتعديلها واعتمادها في المنشأة.",
      },
      {
        en: "Strong governance relies on clear ownership, an audit trail, and regular reviews.",
        ar: "تستند الحوكمة القوية إلى ملكية واضحة ومسار تدقيق ومراجعات دورية.",
      },
      {
        en: "Without it, teams create duplicate records and reports become unreliable.",
        ar: "بدونها يُنشئ الفريق سجلات مكررة وتصبح التقارير غير موثوقة.",
      },
    ],
    glossary: [
      { term: "master data", ar: "البيانات الأساسية" },
      { term: "audit trail", ar: "مسار التدقيق" },
      { term: "duplicate records", ar: "سجلات مكرّرة" },
    ],
  },
];
