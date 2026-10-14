import { careerPathsExtra } from "./careerPathsExtra";

export type InterviewType = "hr" | "technical" | "behavioral";

export interface InterviewQuestion {
  type: InterviewType;
  q: string; // English
  qAr: string; // Arabic translation
  a: string; // English
  aAr: string; // Arabic translation
}

export interface Scenario {
  title: string;
  titleAr: string;
  situation: string;
  situationAr: string;
  steps: string[];
  stepsAr: string[];
}

export interface CareerPath {
  id: string;
  title: string;
  titleAr: string;
  icon: string;
  summary: string;
  summaryAr: string;
  responsibilities: string[];
  responsibilitiesAr: string[];
  skills: string[];
  skillsAr: string[];
  tools: string[];
  toolsAr: string[];
  interview: InterviewQuestion[];
  scenarios: Scenario[];
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "implementer",
    title: "ERP Implementer",
    titleAr: "منفّذ أنظمة ERP",
    icon: "🛠️",
    summary:
      "The primary person who turns client requirements into system configuration and data, trains users, and makes sure the system actually runs before go-live.",
    summaryAr:
      "المسؤول الأول عن تحويل احتياجات العميل إلى إعدادات وبيانات داخل النظام، وتدريب المستخدمين، وضمان تشغيل النظام فعليًا قبل التسليم.",
    responsibilities: [
      "Set up the system environment and configure modules (finance, inventory, sales, purchasing, HR).",
      "Migrate initial data (items, customers, vendors, accounts) and verify its accuracy.",
      "Configure permissions, roles and approval levels according to policies.",
      "Run user acceptance testing (UAT) with users and document feedback.",
      "Train end users and prepare user guides.",
      "Identify gaps and escalate them to the functional consultant or developer.",
    ],
    responsibilitiesAr: [
      "تجهيز بيئة النظام وإعداد الوحدات (المالية، المخزون، المبيعات، الشراء، الموارد البشرية).",
      "ترحيل البيانات الابتدائية (الأصناف، العملاء، الموردين، الحسابات) والتحقق من صحتها.",
      "إعداد الصلاحيات والأدوار ومستويات الموافقات حسب السياسات.",
      "إجراء اختبارات القبول (UAT) مع المستخدمين وتوثيق الملاحظات.",
      "تدريب المستخدمين النهائيين وإعداد أدلة الاستخدام.",
      "الكشف عن الفجوات (Gaps) ورفعها للاستشاري الوظيفي أو المطوّر.",
    ],
    skills: [
      "Understanding of core business cycles (P2P, O2C, R2R).",
      "Module configuration and permissions setup.",
      "Data migration and cleanup.",
      "Writing test scenarios and providing post-go-live support.",
      "Documenting requirements and turning them into configuration.",
      "Good communication with users and non-technical people.",
    ],
    skillsAr: [
      "فهم دورات العمل الأساسية (P2P، O2C، R2R).",
      "إعداد وتهيئة الوحدات (Configuration) والصلاحيات.",
      "ترحيل البيانات وتنظيفها (Data migration).",
      "كتابة سيناريوهات الاختبار والدعم بعد الإطلاق.",
      "توثيق المتطلبات وتحويلها لإعدادات.",
      "تواصل جيد مع المستخدمين وغير التقنيين.",
    ],
    tools: [
      "ERP (SAP/Oracle/Dynamics/Odoo)",
      "Advanced Excel",
      "Basic SQL",
      "Task tools (Jira/Trello)",
      "Data migration tools",
      "Documentation tools",
    ],
    toolsAr: [
      "ERP (SAP/Oracle/Dynamics/Odoo)",
      "Excel متقدّم",
      "SQL أساسي",
      "أدوات إدارة المهام (Jira/Trello)",
      "أدوات ترحيل بيانات",
      "أدوات التوثيق",
    ],
    interview: [
      {
        type: "hr",
        q: "Tell me about yourself and why ERP systems?",
        qAr: "حدّثني عن نفسك ولماذا مجالات أنظمة ERP؟",
        a: "I introduce myself briefly: my background, then connect it to why I chose ERP — it combines business understanding with technology and makes a clear impact on how efficient companies are. I close with why I am interested in the implementer role specifically.",
        aAr: "أقدّم نفسي بإيجاز: خبرتي السابقة، ثم ربطها بسبب اختياري ERP — أنه يجمع بين فهم الأعمال والتقنية، ويصنع أثرًا واضحًا في كفاءة الشركات. أختم بسبب اهتمامي بدور المنفّذ تحديدًا.",
      },
      {
        type: "hr",
        q: "How do you deal with a user who resists change and refuses to use the new system?",
        qAr: "كيف تتعامل مع مستخدم مقاوم للتغيير ويرفض استخدام النظام الجديد؟",
        a: "I listen to their reason first, then explain the direct benefit for them (saving their time / reducing their mistakes), train them step by step in small doses, involve them in the testing phase so they feel ownership, and follow up after go-live to build trust.",
        aAr: "أستمع لسببه أولًا، ثم أشرح الفائدة المباشرة له (توفير وقته/تقليل أخطائه)، وأدرّبه خطوة بخطوة بجرعة صغيرة، وأُشركه في مرحلة الاختبار ليشعر بالملكية، وأتابعه بعد الإطلاق لبناء الثقة.",
      },
      {
        type: "technical",
        q: "What is the difference between customization and configuration?",
        qAr: "ما الفرق بين التخصيص (Customization) والإعداد (Configuration)؟",
        a: "Configuration uses the system's ready-made capabilities (screens, fields, business rules) without code. Customization is writing code or an add-on to change the system's behaviour. The rule: always start with configuration, and resort to customization only when necessary because it is harder to upgrade and maintain.",
        aAr: "الإعداد هو استخدام قدرات النظام الجاهزة (شاشات، حقول، قواعد عمل) بلا كود. التخصيص هو كتابة كود أو تطوير إضافي لتغيير سلوك النظام. القاعدة: نبدأ بالإعداد دائمًا، ونلجأ للتخصيص فقط عند الضرورة لأنه أصعب في الترقية والصيانة.",
      },
      {
        type: "technical",
        q: "What are the steps of a clean data migration?",
        qAr: "ما خطوات ترحيل بيانات نظيفة (Data Migration)؟",
        a: "1) List the data sources. 2) Define the required fields and templates. 3) Extract the data. 4) Clean it and remove duplicates. 5) Trial-load into the test environment. 6) Verify and reconcile balances. 7) Final load before go-live with a backup.",
        aAr: "١) حصر مصادر البيانات. 2) تحديد الحقول المطلوبة والقوالب. 3) استخراج البيانات. 4) التنظيف وإزالة التكرار. 5) التحميل التجريبي في بيئة الاختبار. 6) التحقق ومطابقة الأرصدة. 7) التحميل النهائي قبل الإطلاق مع نسخة احتياطية.",
      },
      {
        type: "technical",
        q: "What is the difference between UAT and SIT?",
        qAr: "ما الفرق بين UAT و SIT؟",
        a: "SIT (System Integration Testing) technically verifies that the system modules work together correctly. UAT (User Acceptance Testing) is done by users to confirm the system really meets business requirements before go-live.",
        aAr: "SIT (اختبار التكامل) يتحقق أن وحدات النظام تعمل معًا بشكل صحيح من الناحية الفنية. UAT (اختبار قبول المستخدم) يقوم به المستخدمون للتأكد أن النظام يلبّي متطلبات العمل فعلًا قبل الإطلاق.",
      },
      {
        type: "behavioral",
        q: "Give an example of an unexpected problem you faced during implementation.",
        qAr: "اذكر موقفًا واجهت فيه مشكلة غير متوقعة أثناء التنفيذ.",
        a: "I use the STAR format: Situation (inventory data migration was delayed), Task (meet the go-live date), Action (I coordinated with the client to prioritise the migration and started with the critical data), Result (go-live succeeded and the rest was completed later without delay).",
        aAr: "أستخدم صيغة STAR: الموقف (تأخر ترحيل بيانات المخزون)، المهمة (الالتزام بموعد الإطلاق)، الإجراء (تواصلت مع العميل لترتيب أولويات الترحيل وبدأت بالبيانات الحرجة)، النتيجة (نجح الإطلاق وتم استكمال الباقي لاحقًا دون تأخير).",
      },
      {
        type: "technical",
        q: "How do you handle a new requirement that appears late before go-live?",
        qAr: "كيف تتعامل مع متطلب جديد يظهر متأخرًا قبل الإطلاق؟",
        a: "I document it, assess its impact on schedule and cost, prioritise it with the stakeholder, and propose alternative solutions (quick configuration now, or an enhancement after go-live) instead of stopping the whole project.",
        aAr: "أوثّقه، أقيّم أثره على الجدول والتكلفة، أرتبه حسب الأولوية مع صاحب المصلحة، وأقترح حلولًا بديلة (تهيئة سريعة الآن، أو تحسين في مرحلة ما بعد الإطلاق) بدل إيقاف المشروع كله.",
      },
      {
        type: "behavioral",
        q: "How do you ensure knowledge transfer to the team after go-live?",
        qAr: "كيف تضمن نقل المعرفة للفريق بعد الإطلاق؟",
        a: "I rely on documenting all configuration and decisions, writing a simple user guide, running training and awareness sessions, defining a support point of contact, and recording short videos for critical operations.",
        aAr: "أعتمد على توثيق كل الإعدادات والقرارات، وكتابة دليل مستخدم مبسّط، وحلقات تدريب، وجلسات توعية، وتحديد نقطة اتصال للدعم، مع تسجيل فيديوهات قصيرة للعمليات الحرجة.",
      },
    ],
    scenarios: [
      {
        title: "Gathering requirements for the procurement cycle (P2P)",
        titleAr: "جمع المتطلبات لدورة الشراء (P2P)",
        situation:
          "A new client wants to implement the procurement cycle from purchase request to payment, and the requirements have not been written clearly yet.",
        situationAr:
          "عميل جديد يريد تنفيذ دورة المشتريات من طلب الشراء حتى الدفع، ولم تُكتب المتطلبات بشكل واضح بعد.",
        steps: [
          "Meet the stakeholders (purchasing, inventory, finance) and map the current process (As-Is).",
          "Document the steps, decisions and approvals required at each stage.",
          "Compare with the standard system solution and identify the gaps.",
          "Present the proposed solution (To-Be) and get written approval.",
          "Prepare test scenarios based on the approved process.",
        ],
        stepsAr: [
          "اجتمع مع أصحاب المصلحة (المشتريات، المخزون، المالية) وحدّد مسار العمل الحالي (As-Is).",
          "وثّق الخطوات والقرارات والموافقات المطلوبة في كل مرحلة.",
          "قارن مع الحل القياسي في النظام وحدّد الفجوات (Gaps).",
          "اعرض الحل المقترح (To-Be) واحصل على موافقة مكتوبة.",
          "جهّز سيناريوهات اختبار بناءً على المسار المعتمد.",
        ],
      },
      {
        title: "Mismatched balances after data migration",
        titleAr: "مشكلة أرصدة غير متطابقة بعد ترحيل البيانات",
        situation:
          "After migrating inventory balances, a difference appeared between the system and reality, and it must be resolved before go-live.",
        situationAr:
          "بعد ترحيل أرصدة المخزون ظهر فرق بين النظام والواقع، ويجب حلّه قبل الإطلاق.",
        steps: [
          "Stop the migration and extract a difference report by item.",
          "Check the data sources (Excel files, legacy system) for duplicate or missing records.",
          "Clean the data and fix the options (units, warehouses, dates).",
          "Reload the trial and reconcile the balances with the client.",
          "Document the root cause and verification steps to avoid recurrence.",
        ],
        stepsAr: [
          "أوقف الترحيل واستخرج تقرير الفروقات حسب الصنف.",
          "تحقق من مصادر البيانات (ملفات الإكسل، النظام القديم) بحثًا عن السجلات المكرّرة أو المفقودة.",
          "نظّف البيانات وصحّح الخيارات (الوحدات، المخازن، التواريخ).",
          "أعد التحميل التجريبي، وطابق الأرصدة مع العميل.",
          "وثّق سبب المشكلة وخطوات التحقق لتفادي التكرار.",
        ],
      },
    ],
  },
];

export const CAREER_PATHS_ALL = [...CAREER_PATHS, ...careerPathsExtra];
