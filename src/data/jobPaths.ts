import type {
  Level,
  MeetingMcq,
  MeetingOrderItem,
  MeetingResponse,
  ProcessQuizQuestion,
  SpeakingPhrase,
} from "@/types";
import { erpAccountantPath } from "./jobPathsAccountant";
import { procurementSpecialistPath } from "./jobPathsProcurement";

// ═══════════════ Phase 05: التعلّم حسب الوظيفة (Job-Based Learning) ═══════════════
// كل مسار وظيفي يجمع دروسًا مبنية على مهام العمل الحقيقية، ويربطها بمحتوى
// المراحل السابقة عبر المعرّفات فقط (عمليات، مصطلحات، دروس بريد، دروس اجتماعات).
// لا ينسخ هذا الملف أي محتوى من Phase 01–04، ولا يضيف مصطلحات جديدة ولا أي منطق
// تقدّم/SRS — الربط بالمعرّف فقط.

// حالة المسار الوظيفي: "ready" متاح، "planned" قيد الإعداد.
export type JobPathStatus = "ready" | "planned";

// روابط الدرس بمحتوى المراحل السابقة — معرّفات فقط (تُحلّ عند العرض).
export interface JobLessonRefs {
  // معرّفات عمليات Phase 02 (p2p/o2c/r2r/p2produce/h2r).
  processIds?: string[];
  // معرّفات وحدات فرعية Phase 01.
  subModuleIds?: string[];
  // معرّفات وظائف تجارية Phase 01.
  businessFunctionIds?: string[];
  // معرّفات مصطلحات (term) من WORDS.
  wordIds?: string[];
  // معرّفات مصطلحات واجهات (شاشة/قائمة/حالة/حقل) من WORDS.
  screenIds?: string[];
  // روابط دروس البريد (Phase 03) — بالـ slug.
  emailLessonSlugs?: string[];
  // روابط دروس الاجتماعات (Phase 04) — بالـ slug.
  meetingLessonSlugs?: string[];
}

// تمرين «اختيار من متعدد» داخل الدرس — يوسّع MeetingMcq بربط اختياري بمصطلح.
export type JobMcq = MeetingMcq & { wordId?: string };

// تمارين الدرس (نفس بنى Phase 03/04 القابلة لإعادة الاستخدام).
export interface JobLessonPractice {
  mcqs?: JobMcq[];
  responses?: MeetingResponse[];
  order?: MeetingOrderItem[];
  phrases?: SpeakingPhrase[];
}

// درس واحد داخل المسار الوظيفي.
export interface JobLesson {
  id: string;
  slug: string;
  order: number;
  icon: string;
  titleAr: string;
  titleEn: string;
  level: Level;
  scenarioAr: string;
  scenarioEn: string;
  objectivesAr: string[];
  objectivesEn: string[];
  refs: JobLessonRefs;
  practice: JobLessonPractice;
  // نفس بنية أسئلة العمليات (تُعرض عبر ProcessQuiz).
  quiz: ProcessQuizQuestion[];
}

// المسار الوظيفي الكامل.
export interface JobPath {
  id: string;
  slug: string;
  icon: string;
  status: JobPathStatus;
  level: Level;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  descAr: string;
  descEn: string;
  // ربط اختياري بمسار مهني من Phase 01 (بدون نسخ مسؤولياته/مهاراته).
  careerPathId?: string;
  learningObjectivesAr: string[];
  learningObjectivesEn: string[];
  lessons: JobLesson[];
  // تقييم المسار الوظيفي (اختيار من متعدد + ردود + عبارات نطق).
  assessment: {
    quiz: ProcessQuizQuestion[];
    responses?: MeetingResponse[];
    speaking?: SpeakingPhrase[];
  };
}

const pilotPaths: JobPath[] = [
  {
    id: "job-erp-functional-consultant",
    slug: "erp-functional-consultant",
    icon: "🧠",
    status: "ready",
    level: "B2",
    titleAr: "استشاري ERP الوظيفي",
    titleEn: "ERP Functional Consultant",
    summaryAr:
      "مسار عملي لمهام الاستشاري الوظيفي: يفهم عمل العميل، يجمع المتطلبات، يحلّل العمليات ويرسم الحل داخل النظام، ثم يدير التدريب والاختبار والانتقال إلى التشغيل.",
    summaryEn:
      "A practical path through the functional consultant's day-to-day tasks: understanding the client's business, gathering requirements, analysing processes and designing the solution in the system, then running training, testing and go-live.",
    descAr:
      "اثنا عشر درسًا تغطي دورة حياة مشروع ERP من منظور اللغة الإنجليزية المهنية: من أول ورشة مع العميل إلى لحظة الانطلاق (Go-Live). كل درس مبني على مواقف واقعية ويربطك بخطوات العمليات ودروس البريد والاجتماعات والمصطلحات الموجودة أصلًا في التطبيق.",
    descEn:
      "Twelve lessons covering the ERP project lifecycle from a professional-English angle: from the first client workshop to Go-Live. Each lesson is built on realistic situations and links you to the existing process steps, email lessons, meeting lessons and vocabulary already in the app.",
    careerPathId: "functional-consultant",
    learningObjectivesAr: [
      "وصف عمل العميل ودورة عمله بلغة مهنية واضحة.",
      "جمع المتطلبات وإدارتها وربطها بالحلول القياسية.",
      "تحليل العمليات الحالية وتحديد الفجوات واقتراح الحل.",
      "شرح الإعدادات والقرارات الوظيفية لأصحاب المصلحة.",
      "إدارة التدريب والاختبار والانتقال إلى التشغيل بثقة.",
      "استخدام مفردات ERP المهنية الصحيحة في السياق.",
    ],
    learningObjectivesEn: [
      "Describe the client's business and its cycle in clear professional English.",
      "Gather, manage and map requirements to standard solutions.",
      "Analyse current processes, identify gaps and propose solutions.",
      "Explain configuration and functional decisions to stakeholders.",
      "Run training, acceptance testing and go-live with confidence.",
      "Use correct professional ERP vocabulary in context.",
    ],
    lessons: [
      // ───────────────── 1) فهم عمل العميل ─────────────────
      {
        id: "job-fc-01-understanding-client-business",
        slug: "understanding-client-business",
        order: 1,
        icon: "🔍",
        titleAr: "فهم عمل العميل",
        titleEn: "Understanding the Client's Business",
        level: "B1",
        scenarioAr:
          "أنت استشاري وظيفي في مشروع ERP لشركة تصنيع. قبل أي إعداد في النظام، تجلس مع مدير المالية ومدير المشتريات لفهم كيف يعمل العمل فعلًا: من يطلب، ومن يوافق، وأين تتوقف الخطوات.",
        scenarioEn:
          "You are a functional consultant on an ERP project for a manufacturing company. Before any system setup, you sit with the finance and procurement managers to understand how the business actually works: who requests, who approves, and where the steps stall.",
        objectivesAr: [
          "طرح أسئلة مفتوحة لفهم دورة العمل لدى العميل.",
          "تحديد الأطراف والمسؤوليات وأصحاب القرار.",
          "توضيح البيانات الرئيسية المستخدمة في العمل.",
          "تلخيص ما فهمته وإعادة صياغته للتأكيد.",
        ],
        objectivesEn: [
          "Ask open questions to understand the client's business cycle.",
          "Identify the parties, responsibilities and decision owners.",
          "Clarify the master data used across the business.",
          "Summarise what you understood and play it back for confirmation.",
        ],
        refs: {
          processIds: ["p2p", "o2c"],
          subModuleIds: ["finance-gl", "purchasing-vendors", "sales-customers"],
          wordIds: [
            "stakeholder",
            "owner",
            "master-data",
            "module",
            "workflow",
            "roadmap",
            "accountable",
            "alignment",
          ],
          screenIds: ["scr-customer-master", "scr-vendor-master", "scr-item-master", "mnu-master-data"],
        },
        practice: {
          mcqs: [
            {
              id: "jf1-mcq1",
              promptAr: "ما أفضل سؤال لبدء ورشة فهم العمل مع العميل؟",
              promptEn: "Which is the best question to open a business-understanding workshop?",
              optionsAr: [
                "هل يمكنك أن تشرح لي كيف تسير العملية من البداية إلى النهاية؟",
                "من المسؤول عن إدخال البيانات في النظام؟",
                "ما إصدار النظام الذي تستخدمونه؟",
                "متى سنوقّع العقد النهائي؟",
              ],
              optionsEn: [
                "Could you walk me through how the process works end to end?",
                "Who is responsible for data entry in the system?",
                "Which system version are you using?",
                "When will we sign the final contract?",
              ],
              answerIndex: 0,
              explainAr: "السؤال المفتوح عن سير العمل يفتح السياق كاملًا قبل التفاصيل التقنية.",
              explainEn: "An open end-to-end question opens up the whole context before technical details.",
            },
            {
              id: "jf1-mcq2",
              promptAr: "طلب العميل موافقة إضافية لم تكن في الاجتماع. ما الرد المهني؟",
              promptEn: "The client asks for an extra approval that was not in the meeting. What is the professional reply?",
              optionsAr: [
                "هذه ليست مسؤوليتي.",
                "من يوافق حاليًا على هذا الطلب، وما أثره على بقية الخطوات؟",
                "غير ممكن، النظام لا يدعم ذلك.",
                "سأرسل لك عرض سعر لاحقًا.",
              ],
              optionsEn: [
                "That's not my responsibility.",
                "Who approves this request today, and how does it affect the following steps?",
                "Not possible — the system doesn't support that.",
                "I'll send you a quote later.",
              ],
              answerIndex: 1,
              explainAr: "فهم المسار الحالي للاعتماد يسبق الحكم على إمكانيته؛ سؤال «من يوافق» و«ما الأثر» مهني وبنّاء.",
              explainEn: "Understanding the current approval path comes before judging it; asking who approves and what the impact is stays professional and constructive.",
            },
          ],
          responses: [
            {
              id: "jf1-rs1",
              situationAr: "أثناء الورشة، يقاطعك موظف ويقول: «هذه تفاصيل، لننتقل للأهم». كيف تتعامل؟",
              situationEn: "During the workshop, an employee interrupts: “This is detail — let's move to what matters.” How do you handle it?",
              optionsAr: [
                "أطلب من مديره إسكاته.",
                "أتفهّم سبب الاعتقاد، ثم أوضّح أن هذه التفاصيل تحدّد الحل لاحقًا.",
                "أوافقه فورًا وأغيّر الموضوع.",
                "أخبره أن هذه طريقة عملي.",
              ],
              optionsEn: [
                "I ask their manager to silence them.",
                "I acknowledge the concern, then explain that these details shape the solution later.",
                "I agree immediately and change the topic.",
                "I tell them this is simply how I work.",
              ],
              answerIndex: 1,
              explainAr: "الاعتراف بالقلق ثم تبرير أهمية التفاصيل يبقي الورشة تعاونية دون فرض سلطة.",
              explainEn: "Acknowledging the concern and justifying why the detail matters keeps the workshop collaborative.",
            },
          ],
          order: [
            { id: "jf1-o1", labelAr: "ترحيب وتحديد هدف الورشة", labelEn: "Welcome the team and state the workshop goal" },
            { id: "jf1-o2", labelAr: "عدّ الأطراف وتحديد مسؤولياتهم", labelEn: "List the parties and their responsibilities" },
            { id: "jf1-o3", labelAr: "تتبّع العملية من البداية إلى النهاية", labelEn: "Walk through the process end to end" },
            { id: "jf1-o4", labelAr: "تحديد نقاط التوقف والاستثناءات", labelEn: "Identify the stalls and exceptions" },
            { id: "jf1-o5", labelAr: "تلخيص الفهم وإعادة تأكيده", labelEn: "Summarise the understanding and confirm it" },
          ],
          phrases: [
            {
              id: "jf1-p1",
              en: "Could you walk me through how this works end to end?",
              ar: "هل يمكنك أن تشرح لي كيف تسير هذه العملية من البداية إلى النهاية؟",
              tipAr: "انطق «walk me through» متصلة، بنبرة هادئة فضولية.",
              tipEn: "Say “walk me through” as one smooth phrase, with a calm, curious tone.",
            },
            {
              id: "jf1-p2",
              en: "So, to confirm my understanding, you raise a request and the finance manager approves it.",
              ar: "إذن، لأتأكد من فهمي: أنت ترفع الطلب ومدير المالية يوافق عليه.",
              tipAr: "ابدأ بـ «So, to confirm…» ثم أعد صياغة ما سمعته ببطء.",
              tipEn: "Start with “So, to confirm…” and then restate what you heard slowly.",
            },
          ],
        },
        quiz: [
          {
            id: "jf1-q1",
            promptAr: "ما معنى master data في مشروع ERP؟",
            promptEn: "What does master data mean in an ERP project?",
            optionsAr: [
              "سجل الحركات اليومية.",
              "ملف يُحذف بعد المشروع.",
              "بيانات أساسية ثابتة نسبيًا يستخدمها النظام في كل العمليات.",
              "البيانات التي يُدخلها المدير فقط.",
            ],
            optionsEn: [
              "A log of daily transactions.",
              "A file deleted after the project.",
              "Relatively stable core data the system uses across all processes.",
              "Data that only the manager enters.",
            ],
            answerIndex: 2,
            explainAr: "مثل بيانات العملاء والموردين والأصناف: تُعرّف مرة وتُستخدم في كل عملية.",
            explainEn: "Like customers, vendors and items: defined once and reused by every process.",
            wordId: "master-data",
          },
          {
            id: "jf1-q2",
            promptAr: "ما الهدف من تكرار سؤال «من يوافق؟» في ورشة الفهم؟",
            promptEn: "Why do you keep asking “who approves?” in a discovery workshop?",
            optionsAr: [
              "لإطالة الاجتماع.",
              "للكشف عن الأخطاء الشخصية.",
              "لمقارنة النظام القديم بالجديد.",
              "لتوثيق مسار القرار ومعرفة أصحاب الصلاحية.",
            ],
            optionsEn: [
              "To make the meeting longer.",
              "To expose people's personal mistakes.",
              "To compare the old system with the new one.",
              "To document the decision path and identify the authorised owners.",
            ],
            answerIndex: 3,
            explainAr: "مسار الموافقة جزء جوهري من العملية يُصمَّم عليه لاحقًا في النظام.",
            explainEn: "The approval path is a core part of the process that you later design in the system.",
            wordId: "approval",
          },
          {
            id: "jf1-q3",
            promptAr: "أي عبارة مناسبة لتلخيص الفهم في نهاية الورشة؟",
            promptEn: "Which phrase best summarises your understanding at the end of a workshop?",
            optionsAr: [
              "Let me summarise what I understood so we can confirm it.",
              "That's all, thank you.",
              "I will decide the solution later.",
              "You will see it in the system.",
            ],
            optionsEn: [
              "Let me summarise what I understood so we can confirm it.",
              "That's all, thank you.",
              "I will decide the solution later.",
              "You will see it in the system.",
            ],
            answerIndex: 0,
            explainAr: "إعادة الصياغة والتأكيد تمنع سوء الفهم مبكرًا.",
            explainEn: "Playing it back and confirming prevents misunderstandings early.",
          },
          {
            id: "jf1-q4",
            promptAr: "لماذا نربط الخطوة بمسؤول (owner) واضح؟",
            promptEn: "Why do we link each step to a clear owner?",
            optionsAr: [
              "لا سبب مهم.",
              "لتحديد المسؤولية عند التأخير أو القرار.",
              "لتقليل رواتب الفريق.",
              "لتغيير هيكل الشركة.",
            ],
            optionsEn: [
              "There is no real reason.",
              "To fix accountability when there is a delay or a decision.",
              "To reduce the team's salaries.",
              "To change the company structure.",
            ],
            answerIndex: 1,
            explainAr: "المسؤول الواضح يمنع ضياع الخطوات بين الأقسام.",
            explainEn: "A clear owner stops steps from falling between departments.",
            wordId: "owner",
          },
          {
            id: "jf1-q5",
            promptAr: "ما المخرج المتوقع من ورشة فهم العمل؟",
            promptEn: "What is the expected output of a business-understanding workshop?",
            optionsAr: [
              "عقد جديد.",
              "تدريب المستخدمين.",
              "فهم موثّق للعملية والأطراف والاستثناءات.",
              "نظام مُعدّ بالكامل.",
            ],
            optionsEn: [
              "A new contract.",
              "End-user training.",
              "A documented understanding of the process, parties and exceptions.",
              "A fully configured system.",
            ],
            answerIndex: 2,
            explainAr: "الفهم الموثّق هو أساس كل خطوات التصميم التالية.",
            explainEn: "The documented understanding is the basis of every design step that follows.",
          },
        ],
      },

      // ───────────────── 2) تقديم نفسك كاستشاري ─────────────────
      {
        id: "job-fc-02-introducing-yourself-consultant",
        slug: "introducing-yourself-consultant",
        order: 2,
        icon: "🙋",
        titleAr: "تقديم نفسك كاستشاري",
        titleEn: "Introducing Yourself as a Consultant",
        level: "B1",
        scenarioAr:
          "في أول اجتماع لفريق المشروع، يُطلب منك تقديم نفسك وشرح دورك بوضوح أمام إدارة العميل: ما الذي تديره، وكيف تتعاون مع الفريق الفني، وما الذي يمكن للعميل أن يتوقعه منك.",
        scenarioEn:
          "At the project kick-off, you are asked to introduce yourself and explain your role clearly to the client's management: what you own, how you work with the technical team, and what the client can expect from you.",
        objectivesAr: [
          "تقديم نفسك ودورك في جملة أو جملتين.",
          "توضيح حدود مسؤوليتك وتعاونك مع الفريق الفني.",
          "طمأنة العميل بشأن منهجية العمل والمتابعة.",
          "الرد بثقة على سؤال «ما الفرق بينك وبين المنفّذ؟»",
        ],
        objectivesEn: [
          "Introduce yourself and your role in one or two sentences.",
          "Clarify the boundary of your responsibility and your work with the technical team.",
          "Reassure the client about the working method and follow-up.",
          "Answer “how are you different from an implementer?” with confidence.",
        ],
        refs: {
          processIds: ["h2r"],
          subModuleIds: ["management-governance", "communication-meetings"],
          wordIds: ["stakeholder", "owner", "module", "oversight", "accountable", "matrix"],
          meetingLessonSlugs: ["introducing-yourself-role"],
        },
        practice: {
          mcqs: [
            {
              id: "jf2-mcq1",
              promptAr: "أي جملة تقدّم دورك بشكل مهني ومختصر؟",
              promptEn: "Which sentence introduces your role professionally and briefly?",
              optionsAr: [
                "I only fix the technical issues.",
                "I'll tell you what to do.",
                "I'm the functional consultant — I design how your processes run in the system.",
                "I do everything in the project.",
              ],
              optionsEn: [
                "I only fix the technical issues.",
                "I'll tell you what to do.",
                "I'm the functional consultant — I design how your processes run in the system.",
                "I do everything in the project.",
              ],
              answerIndex: 2,
              explainAr: "تعريف الدور بجملة واحدة واضحة يمنع التوقعات الخاطئة لاحقًا.",
              explainEn: "A one-line, clear role definition prevents wrong expectations later.",
            },
            {
              id: "jf2-mcq2",
              promptAr: "كيف تصف تعاونك مع الفريق الفني؟",
              promptEn: "How do you describe working with the technical team?",
              optionsAr: [
                "They report to me on everything.",
                "I avoid them until the end.",
                "They decide what the client gets.",
                "I define the functional design, and we assess the technical build together.",
              ],
              optionsEn: [
                "They report to me on everything.",
                "I avoid them until the end.",
                "They decide what the client gets.",
                "I define the functional design, and we assess the technical build together.",
              ],
              answerIndex: 3,
              explainAr: "وصف التعاون بوضوح يُظهر احترام الأدوار دون مبالغة.",
              explainEn: "Describing the collaboration clearly shows respect for roles without exaggeration.",
            },
          ],
          responses: [
            {
              id: "jf2-rs1",
              situationAr: "يسألك مدير العميل: «ما الفرق بينك وبين المنفّذ؟» ما أفضل رد؟",
              situationEn: "The client's manager asks: “How are you different from an implementer?” What is the best reply?",
              optionsAr: [
                "I'm more expensive, that's the main difference.",
                "The implementer is more senior than me.",
                "The implementer configures; I design the solution and challenge it against best practice.",
                "There is almost no difference.",
              ],
              optionsEn: [
                "I'm more expensive, that's the main difference.",
                "The implementer is more senior than me.",
                "The implementer configures; I design the solution and challenge it against best practice.",
                "There is almost no difference.",
              ],
              answerIndex: 2,
              explainAr: "التمييز بين التنفيذ والتصميم يعبّر عن القيمة الفعلية للدور بثقة.",
              explainEn: "Distinguishing configuration from design expresses the role's real value with confidence.",
            },
          ],
          order: [
            { id: "jf2-o1", labelAr: "التحية وتعريف الاسم والدور", labelEn: "Greet the team and state your name and role" },
            { id: "jf2-o2", labelAr: "وصف نطاق مسؤوليتك", labelEn: "Describe the scope of your responsibility" },
            { id: "jf2-o3", labelAr: "توضيح التعاون مع الفريق الفني", labelEn: "Explain the collaboration with the technical team" },
            { id: "jf2-o4", labelAr: "ذكر منهجية العمل والمتابعة", labelEn: "State the working method and follow-up" },
            { id: "jf2-o5", labelAr: "دعوة العميل لطرح الأسئلة", labelEn: "Invite the client to ask questions" },
          ],
          phrases: [
            {
              id: "jf2-p1",
              en: "I'm the functional consultant on the project — my role is to design how your processes work in the system.",
              ar: "أنا الاستشاري الوظيفي في المشروع — ودوري تصميم طريقة سير عملياتكم داخل النظام.",
              tipAr: "قسّم الجملة عند الشرطة، وخُذ نَفَسًا قبل «my role».",
              tipEn: "Split the sentence at the dash and take a breath before “my role”.",
            },
            {
              id: "jf2-p2",
              en: "I'll be your main contact for functional questions, and our technical team handles the build.",
              ar: "سأكون جهة الاتصال الرئيسية للأسئلة الوظيفية، وفريقنا الفني يتولّى التنفيذ التقني.",
              tipAr: "شدّد على «functional questions» لتمييز نطاقك.",
              tipEn: "Stress “functional questions” to mark your scope.",
            },
          ],
        },
        quiz: [
          {
            id: "jf2-q1",
            promptAr: "أي وصف يعبّر بدقة عن دور الاستشاري الوظيفي؟",
            promptEn: "Which description accurately reflects the functional consultant's role?",
            optionsAr: [
              "يكتب أكواد البرمجة.",
              "يدير ميزانية الشركة.",
              "يوافق على الميزانية النهائية.",
              "يصمّم الحل الوظيفي ويربط العمليات بأفضل الممارسات.",
            ],
            optionsEn: [
              "Writes the programming code.",
              "Manages the company's budget.",
              "Approves the final budget.",
              "Designs the functional solution and aligns processes with best practice.",
            ],
            answerIndex: 3,
            explainAr: "التصميم الوظيفي وربط العمليات هو جوهر الدور.",
            explainEn: "Functional design and connecting processes is the core of the role.",
          },
          {
            id: "jf2-q2",
            promptAr: "لماذا نوضّح حدود مسؤوليتنا للعميل مبكرًا؟",
            promptEn: "Why do we clarify the boundary of our responsibility early?",
            optionsAr: [
              "لمنع التوقعات الخاطئة وتسهيل التعاون.",
              "لتقليل عدد الاجتماعات.",
              "لرفع السعر.",
              "لا فائدة، العميل يعرف كل شيء.",
            ],
            optionsEn: [
              "To prevent wrong expectations and make collaboration easier.",
              "To reduce the number of meetings.",
              "To raise the price.",
              "No benefit — the client knows everything.",
            ],
            answerIndex: 0,
            explainAr: "الحدود الواضحة تحمي العلاقة وتوزّع المسؤوليات.",
            explainEn: "Clear boundaries protect the relationship and distribute responsibility.",
          },
          {
            id: "jf2-q3",
            promptAr: "ما معنى accountable في سياق المشروع؟",
            promptEn: "What does accountable mean in a project context?",
            optionsAr: [
              "غير رسمي.",
              "مسؤول ومحاسَب على نتيجة معيّنة.",
              "منفّذ للمهمة فقط.",
              "مستشار خارجي.",
            ],
            optionsEn: [
              "Informal.",
              "Responsible and answerable for a specific result.",
              "Only a task executor.",
              "An external advisor.",
            ],
            answerIndex: 1,
            explainAr: "المسؤولية (accountability) تختلف عن مجرد التنفيذ.",
            explainEn: "Accountability is different from simply doing the task.",
            wordId: "accountable",
          },
          {
            id: "jf2-q4",
            promptAr: "أي عبارة تعرض التعاون مع الفريق الفني بشكل صحيح؟",
            promptEn: "Which phrase correctly describes working with the technical team?",
            optionsAr: [
              "I never talk to them",
              "they own the functional design",
              "we assess the technical build together",
              "they work for me",
            ],
            optionsEn: [
              "I never talk to them",
              "they own the functional design",
              "we assess the technical build together",
              "they work for me",
            ],
            answerIndex: 2,
            explainAr: "التقييم المشترك يعكس التعاون دون تجاوز الأدوار.",
            explainEn: "Assessing together reflects collaboration without overstepping roles.",
          },
          {
            id: "jf2-q5",
            promptAr: "ما اسم الوثيقة التي تُوزَّع عادة لتوضيح الأدوار (RACI)؟",
            promptEn: "What do we call the matrix used to clarify roles (RACI)?",
            optionsAr: [
              "balance sheet",
              "price list",
              "pick list",
              "responsibility matrix",
            ],
            optionsEn: [
              "balance sheet",
              "price list",
              "pick list",
              "responsibility matrix",
            ],
            answerIndex: 3,
            explainAr: "مصفوفة المسؤوليات (RACI) توضّح من ينفّذ ومن يوافق ومن يُستشار.",
            explainEn: "A responsibility matrix (RACI) shows who does, approves and is consulted.",
            wordId: "matrix",
          },
        ],
      },

      // ───────────────── 3) جمع المتطلبات ─────────────────
      {
        id: "job-fc-03-gathering-requirements",
        slug: "gathering-requirements",
        order: 3,
        icon: "📝",
        titleAr: "جمع المتطلبات",
        titleEn: "Gathering Business Requirements",
        level: "B2",
        scenarioAr:
          "تعقد ورشة متطلبات مع المشتريات والمالية. عليك تنظيم أسئلتك، وتفريق ما هو متطلب فعلي عن الرغبة، وتوثيق كل طلب بمصدره وأثره، ثم الاتفاق على خطوة تالية واضحة.",
        scenarioEn:
          "You run a requirements workshop with procurement and finance. You need to organise your questions, separate a real requirement from a wish, document each request with its source and impact, and agree on a clear next step.",
        objectivesAr: [
          "طرح أسئلة متطلبات منظّمة حسب العملية.",
          "التمييز بين المتطلب والرغبة والقيد.",
          "توثيق مصدر الطلب وأثره على النطاق.",
          "الاتفاق على خطوة تالية وتوثيقها.",
        ],
        objectivesEn: [
          "Ask structured requirements questions by process.",
          "Distinguish a requirement from a wish and a constraint.",
          "Document the source of the request and its impact on scope.",
          "Agree on, and document, a clear next step.",
        ],
        refs: {
          processIds: ["p2p"],
          subModuleIds: ["purchasing-requisition", "projects-planning", "management-alignment"],
          businessFunctionIds: ["purchasing-requisition-create"],
          wordIds: ["stakeholder", "approval", "change-request", "scope-creep", "objective", "milestone", "risk"],
          emailLessonSlugs: ["meeting-invitation-follow-up"],
        },
        practice: {
          mcqs: [
            {
              id: "jf3-mcq1",
              promptAr: "ما أفضل طريقة لتوثيق متطلب جديد؟",
              promptEn: "What is the best way to document a new requirement?",
              optionsAr: [
                "الوصف + مصدر الطلب + الأثر + الأولوية.",
                "اسم الشخص فقط.",
                "رسالة صوتية.",
                "تركه للمرحلة القادمة.",
              ],
              optionsEn: [
                "Description + source + impact + priority.",
                "Just the person's name.",
                "A voice message.",
                "Leave it for the next phase.",
              ],
              answerIndex: 0,
              explainAr: "التوثيق الكامل يمنع النسيان ويحمي النطاق من التوسّع غير المقصود.",
              explainEn: "Full documentation prevents loss and protects scope from unintended creep.",
            },
            {
              id: "jf3-mcq2",
              promptAr: "ما الفرق بين المتطلب والرغبة؟",
              promptEn: "What is the difference between a requirement and a wish?",
              optionsAr: [
                "المتطلب رأي المدير.",
                "المتطلب ضروري لتحقيق هدف العمل، والرغبة تحسين اختياري.",
                "لا فرق بينهما.",
                "الرغبة أهم دائمًا.",
              ],
              optionsEn: [
                "The requirement is the manager's opinion.",
                "A requirement is necessary for a business goal; a wish is an optional improvement.",
                "There is no difference.",
                "The wish is always more important.",
              ],
              answerIndex: 1,
              explainAr: "التمييز يوجّه الأولوية والقرار ويحمي الجدول الزمني.",
              explainEn: "The distinction guides priority and decisions and protects the timeline.",
            },
          ],
          responses: [
            {
              id: "jf3-rs1",
              situationAr: "يطلب العميل ميزة إضافية خارج النطاق. ما أفضل رد؟",
              situationEn: "The client asks for an extra feature outside the scope. What is the best reply?",
              optionsAr: [
                "We'll add it now, no problem.",
                "Maybe in a future version, let's skip it.",
                "That's out of scope — we can't discuss it.",
                "Let's document it as a change request and assess the impact on scope and time.",
              ],
              optionsEn: [
                "We'll add it now, no problem.",
                "Maybe in a future version, let's skip it.",
                "That's out of scope — we can't discuss it.",
                "Let's document it as a change request and assess the impact on scope and time.",
              ],
              answerIndex: 3,
              explainAr: "توثيق التغيير وتقييم الأثر يحمي المشروع ويحترم طلب العميل.",
              explainEn: "Documenting the change and assessing the impact protects the project and respects the client.",
            },
          ],
          order: [
            { id: "jf3-o1", labelAr: "تحديد هدف الورشة والنطاق", labelEn: "State the workshop goal and scope" },
            { id: "jf3-o2", labelAr: "طرح أسئلة المتطلبات حسب العملية", labelEn: "Ask requirements questions by process" },
            { id: "jf3-o3", labelAr: "تصنيف المتطلبات والأولويات", labelEn: "Classify requirements and priorities" },
            { id: "jf3-o4", labelAr: "توثيق المصدر والأثر", labelEn: "Document the source and the impact" },
            { id: "jf3-o5", labelAr: "الاتفاق على الخطوة التالية", labelEn: "Agree the next step" },
          ],
          phrases: [
            {
              id: "jf3-p1",
              en: "Could you clarify what the goal behind this request is?",
              ar: "هل يمكنك توضيح الهدف الذي يقف خلف هذا الطلب؟",
              tipAr: "ركّز على كلمة «goal» لإظهار أنك تبحث عن السبب لا الشكل.",
              tipEn: "Stress the word “goal” to show you are after the reason, not the format.",
            },
            {
              id: "jf3-p2",
              en: "I'll document this as a change request and bring the impact back to you.",
              ar: "سأوثّق هذا كطلب تغيير وأعيد إليك الأثر.",
              tipAr: "أكّد على «change request» و«impact» لأن العميل يجب أن يسمعهما.",
              tipEn: "Emphasise “change request” and “impact” so the client clearly hears both.",
            },
          ],
        },
        quiz: [
          {
            id: "jf3-q1",
            promptAr: "ما هو change request؟",
            promptEn: "What is a change request?",
            optionsAr: [
              "طلب تعديل موثّق يُقيَّم أثره على النطاق والجدول.",
              "شكوى من العميل.",
              "خطأ في النظام.",
              "بند في العقد فقط.",
            ],
            optionsEn: [
              "A documented change whose impact on scope and schedule is assessed.",
              "A client complaint.",
              "A system error.",
              "Just a contract clause.",
            ],
            answerIndex: 0,
            explainAr: "طلب التغيير رسمي ومُقاس، لا مجرد طلب شفهي.",
            explainEn: "A change request is formal and measured, not just a verbal ask.",
            wordId: "change-request",
          },
          {
            id: "jf3-q2",
            promptAr: "ما معنى scope creep؟",
            promptEn: "What does scope creep mean?",
            optionsAr: [
              "تقليص الميزانية.",
              "توسّع النطاق تدريجيًا دون ضبط أو توثيق.",
              "إغلاق المشروع مبكرًا.",
              "تغيير مدير المشروع.",
            ],
            optionsEn: [
              "Reducing the budget.",
              "Scope expanding gradually without control or documentation.",
              "Closing the project early.",
              "Changing the project manager.",
            ],
            answerIndex: 1,
            explainAr: "التوسّع الصامت من أكبر مخاطر المشاريع، ودفعه توثيق الطلبات.",
            explainEn: "Silent expansion is a top project risk; documenting requests holds it back.",
            wordId: "scope-creep",
          },
          {
            id: "jf3-q3",
            promptAr: "أي عبارة تحقق من فهم المتطلب؟",
            promptEn: "Which phrase checks your understanding of a requirement?",
            optionsAr: [
              "We'll see later.",
              "It's fine.",
              "So the requirement is X, correct?",
              "I think I know what you mean.",
            ],
            optionsEn: [
              "We'll see later.",
              "It's fine.",
              "So the requirement is X, correct?",
              "I think I know what you mean.",
            ],
            answerIndex: 2,
            explainAr: "الفحص المباشر يمنع سوء فهم المتطلبات.",
            explainEn: "A direct check prevents misread requirements.",
          },
          {
            id: "jf3-q4",
            promptAr: "لماذا نربط كل متطلب بصاحب مصلحة؟",
            promptEn: "Why do we link each requirement to a stakeholder?",
            optionsAr: [
              "لملء الوثيقة.",
              "لزيادة عدد الحضور.",
              "لا سبب.",
              "لمعرفة من يقرّره ومن يُستشار عند التغيير.",
            ],
            optionsEn: [
              "To fill the document.",
              "To increase attendance.",
              "No reason.",
              "To know who decides and who to consult when it changes.",
            ],
            answerIndex: 3,
            explainAr: "المصدر يحدّد المرجع عند أي تغيير لاحق.",
            explainEn: "The source defines the reference point for any later change.",
            wordId: "stakeholder",
          },
          {
            id: "jf3-q5",
            promptAr: "ما المخرج المتوقع لنهاية ورشة المتطلبات؟",
            promptEn: "What is the expected output at the end of a requirements workshop?",
            optionsAr: [
              "قائمة متطلبات موثّقة بأولويات ومصادر.",
              "نظام جاهز للتشغيل.",
              "تدريب الموظفين.",
              "الفاتورة النهائية.",
            ],
            optionsEn: [
              "A documented list of requirements with priorities and sources.",
              "A system ready for go-live.",
              "Staff training.",
              "The final invoice.",
            ],
            answerIndex: 0,
            explainAr: "المتطلبات الموثّقة أساس التصميم والتوثيق الوظيفي.",
            explainEn: "Documented requirements are the basis of design and functional documentation.",
          },
        ],
      },

      // ───────────────── 4) تحليل العمليات الحالية ─────────────────
      {
        id: "job-fc-04-analyzing-business-processes",
        slug: "analyzing-business-processes",
        order: 4,
        icon: "🧩",
        titleAr: "تحليل العمليات الحالية",
        titleEn: "Analyzing Existing Business Processes",
        level: "B2",
        scenarioAr:
          "لديك وصف كامل لعمليات الشركة الحالية. مهمتك أن تحلّلها خطوة بخطوة: من ينفّذ، ما المدخل والمخرج، وأين تظهر نقاط الاختناق، ثم تلخّص ذلك بلغة يفهمها أصحاب المصلحة.",
        scenarioEn:
          "You have a full description of the company's current processes. Your task is to analyse them step by step: who performs them, what the input and output are, and where the bottlenecks appear — then summarise it in language the stakeholders understand.",
        objectivesAr: [
          "تحليل خطوات العملية ومدخلاتها ومخرجاتها.",
          "تحديد نقاط الاختناق والتكرار.",
          "وصف المسار الحالي (As-Is) بلغة واضحة.",
          "تقديم ملخّص منظّم لأصحاب المصلحة.",
        ],
        objectivesEn: [
          "Analyse each process step with its inputs and outputs.",
          "Identify bottlenecks and duplication.",
          "Describe the current state (As-Is) in clear language.",
          "Deliver a structured summary to the stakeholders.",
        ],
        refs: {
          processIds: ["p2p", "o2c", "r2r", "p2produce", "h2r"],
          subModuleIds: ["administration-workflow", "bi-kpis", "finance-reporting"],
          businessFunctionIds: ["finance-reporting-export"],
          wordIds: ["workflow", "master-data", "transaction", "bottleneck", "kpi", "dashboard", "cycle-count", "lead-time"],
          meetingLessonSlugs: ["summarizing-minutes"],
        },
        practice: {
          mcqs: [
            {
              id: "jf4-mcq1",
              promptAr: "ما معنى as-is في تحليل العمليات؟",
              promptEn: "What does as-is mean in process analysis?",
              optionsAr: [
                "بيانات النظام القديم.",
                "قائمة الأخطاء فقط.",
                "وصف الوضع الحالي كما هو دون تحسين.",
                "التصميم المستهدف بعد التحسين.",
              ],
              optionsEn: [
                "The old system's data.",
                "A list of errors only.",
                "A description of the current state exactly as it is.",
                "The target design after improvement.",
              ],
              answerIndex: 2,
              explainAr: "نفهم الحالي أولًا (as-is) ثم نصمّم المستهدف (to-be).",
              explainEn: "We understand the current (as-is) first, then design the target (to-be).",
            },
            {
              id: "jf4-mcq2",
              promptAr: "ما معنى bottleneck؟",
              promptEn: "What does bottleneck mean?",
              optionsAr: [
                "موظف جديد.",
                "تقرير مالي.",
                "نوع من الموافقات.",
                "نقطة تُبطئ سير العملية وتؤخّر ما بعدها.",
              ],
              optionsEn: [
                "A new employee.",
                "A financial report.",
                "A kind of approval.",
                "A step that slows the process and delays everything after it.",
              ],
              answerIndex: 3,
              explainAr: "تحديد نقطة الاختناق أول خطوة في التحسين.",
              explainEn: "Finding the bottleneck is the first step toward improvement.",
              wordId: "bottleneck",
            },
          ],
          responses: [
            {
              id: "jf4-rs1",
              situationAr: "لخّصت العملية أمام الإدارة، فقاطعك أحدهم: «أنت تعقّد الأمور». كيف ترد؟",
              situationEn: "You summarise the process to management and someone interrupts: “You're overcomplicating this.” How do you respond?",
              optionsAr: [
                "I understand — I'm describing the current flow so we can simplify it together.",
                "You don't understand the process.",
                "This is my job, let me finish.",
                "Then you write the summary.",
              ],
              optionsEn: [
                "I understand — I'm describing the current flow so we can simplify it together.",
                "You don't understand the process.",
                "This is my job, let me finish.",
                "Then you write the summary.",
              ],
              answerIndex: 0,
              explainAr: "الرد الهادئ يوضّح أن الوصف هو مدخل للتبسيط لا نهايته.",
              explainEn: "A calm reply makes clear the description is the entry to simplification, not the end.",
            },
          ],
          order: [
            { id: "jf4-o1", labelAr: "تحديد بداية العملية ونهايتها", labelEn: "Define the start and end of the process" },
            { id: "jf4-o2", labelAr: "تتبّع الخطوات ومن ينفّذها", labelEn: "Trace the steps and who performs them" },
            { id: "jf4-o3", labelAr: "تسجيل المدخلات والمخرجات", labelEn: "Record the inputs and outputs" },
            { id: "jf4-o4", labelAr: "تحديد نقاط الاختناق والاستثناءات", labelEn: "Identify bottlenecks and exceptions" },
            { id: "jf4-o5", labelAr: "تلخيص الوضع الحالي للإدارة", labelEn: "Summarise the current state to management" },
          ],
          phrases: [
            {
              id: "jf4-p1",
              en: "The main bottleneck is here — every step after it waits for this approval.",
              ar: "نقطة الاختناق الرئيسية هنا — وكل خطوة بعدها تنتظر هذه الموافقة.",
              tipAr: "قف قليلًا بعد كلمة «bottleneck» لتبرزها.",
              tipEn: "Pause slightly after “bottleneck” to make it stand out.",
            },
            {
              id: "jf4-p2",
              en: "Let me summarise the current flow before we discuss the target design.",
              ar: "دعني ألخّص المسار الحالي قبل أن نناقش التصميم المستهدف.",
              tipAr: "افصل بين «current flow» و«target design» بنبرة واضحة.",
              tipEn: "Separate “current flow” and “target design” with a clear tone.",
            },
          ],
        },
        quiz: [
          {
            id: "jf4-q1",
            promptAr: "ما معنى to-be في تحليل العمليات؟",
            promptEn: "What does to-be mean in process analysis?",
            optionsAr: [
              "أرشيف المستندات.",
              "التصميم المستهدف بعد التحسين.",
              "الوضع الحالي.",
              "سجل الحركات.",
            ],
            optionsEn: [
              "The document archive.",
              "The target design after improvement.",
              "The current state.",
              "The transaction log.",
            ],
            answerIndex: 1,
            explainAr: "المستهدف (to-be) يُبنى على فهم الحالي (as-is).",
            explainEn: "The to-be is built on understanding the as-is.",
          },
          {
            id: "jf4-q2",
            promptAr: "لماذا نقيس زمن الدورة (lead time) في العمليات؟",
            promptEn: "Why do we measure lead time across processes?",
            optionsAr: [
              "لزيادة عدد الخطوات.",
              "لملء التقارير.",
              "لكشف التأخير وتحسين سرعة الدورة.",
              "لمعاقبة الموظفين.",
            ],
            optionsEn: [
              "To add more steps.",
              "To fill reports.",
              "To expose delays and improve cycle speed.",
              "To punish employees.",
            ],
            answerIndex: 2,
            explainAr: "زمن الدورة مقياس مباشر لكفاءة العملية.",
            explainEn: "Lead time is a direct measure of process efficiency.",
            wordId: "lead-time",
          },
          {
            id: "jf4-q3",
            promptAr: "أي عنصر يساعد على متابعة مؤشرات العملية لحظيًا؟",
            promptEn: "Which element helps monitor process indicators in real time?",
            optionsAr: [
              "دفتر ملاحظات.",
              "ملف PDF.",
              "بريد إلكتروني.",
              "لوحة المعلومات (dashboard).",
            ],
            optionsEn: [
              "A notebook.",
              "A PDF file.",
              "An email.",
              "A dashboard.",
            ],
            answerIndex: 3,
            explainAr: "لوحة المعلومات تجمع مؤشرات العملية في مكان واحد.",
            explainEn: "A dashboard brings process indicators together in one place.",
            wordId: "dashboard",
          },
          {
            id: "jf4-q4",
            promptAr: "ما الهدف من وصف مسار بديل (exception)؟",
            promptEn: "Why do we document an exception path?",
            optionsAr: [
              "لأن العمل الحقيقي يتضمّن حالات خارج المسار العادي.",
              "لأن النظام يحبّ التعقيد.",
              "لتطويل الوثيقة.",
              "لا هدف.",
            ],
            optionsEn: [
              "Because real work includes cases outside the normal path.",
              "Because systems like complexity.",
              "To lengthen the document.",
              "No goal.",
            ],
            answerIndex: 0,
            explainAr: "الحالات الاستثنائية غالبًا سبب أكثر الأعطال، فتوثيقها جوهري.",
            explainEn: "Exceptions often cause most breakdowns, so documenting them is essential.",
          },
          {
            id: "jf4-q5",
            promptAr: "ما أفضل صيغة لتقديم ملخّص التحليل للإدارة؟",
            promptEn: "What is the best format to present the analysis summary to management?",
            optionsAr: [
              "ملف صوتي.",
              "منظّم: العملية، الخطوات، المشكلة، الأثر، التوصية.",
              "قائمة كلمات متفرقة.",
              "رسالة طويلة بلا عنوان.",
            ],
            optionsEn: [
              "An audio file.",
              "Structured: process, steps, problem, impact, recommendation.",
              "A scattered word list.",
              "A long message with no headings.",
            ],
            answerIndex: 1,
            explainAr: "البنية الواضحة تجعل الإدارة تقرّر بسرعة.",
            explainEn: "Clear structure helps management decide quickly.",
          },
        ],
      },

      // ───────────────── 5) تحديد فجوات العمل ─────────────────
      {
        id: "job-fc-05-identifying-business-gaps",
        slug: "identifying-business-gaps",
        order: 5,
        icon: "🕳️",
        titleAr: "تحديد فجوات العمل",
        titleEn: "Identifying Business Gaps",
        level: "B2",
        scenarioAr:
          "بعد تحليل العمليات، تكتشف أن بعض احتياجات العميل لا يغطّيها النظام القياسي. عليك أن تصف الفجوة بدقة، وتقترح حلولًا قياسية أولًا، ثم تناقش التخصيص عند الحاجة مع تقييم أثره.",
        scenarioEn:
          "After analysing the processes, you find that some client needs are not covered by the standard system. You must describe the gap precisely, propose standard solutions first, and only then discuss customization with its impact.",
        objectivesAr: [
          "وصف الفجوة بين الاحتياج والوظيفة القياسية.",
          "اقتراح حلول قياسية قبل التخصيص.",
          "تقييم أثر التخصيص على الوقت والتكلفة والصيانة.",
          "توثيق القرار ومخاطره بوضوح.",
        ],
        objectivesEn: [
          "Describe the gap between the need and the standard functionality.",
          "Propose standard solutions before customization.",
          "Assess the impact of customization on time, cost and maintenance.",
          "Document the decision and its risks clearly.",
        ],
        refs: {
          processIds: ["p2p", "o2c"],
          subModuleIds: ["administration-workflow", "administration-system", "documents-templates"],
          wordIds: ["customization", "change-request", "scope-creep", "risk", "escalation-matrix", "workflow", "parameter", "sandbox"],
          emailLessonSlugs: ["invoice-discrepancy"],
        },
        practice: {
          mcqs: [
            {
              id: "jf5-mcq1",
              promptAr: "ما هو fit-gap analysis؟",
              promptEn: "What is fit-gap analysis?",
              optionsAr: [
                "مقارنة احتياج العميل بما يقدّمه النظام القياسي لتحديد الفجوات.",
                "قياس سرعة النظام.",
                "تحليل أسعار الموردين.",
                "تقييم أداء الموظفين.",
              ],
              optionsEn: [
                "Comparing client needs with standard system functionality to find gaps.",
                "Measuring system speed.",
                "Analysing vendor prices.",
                "Assessing employee performance.",
              ],
              answerIndex: 0,
              explainAr: "مقارنة «ما نحتاجه» بـ«ما يوفّره النظام» تكشف الفجوة قبل التصميم.",
              explainEn: "Comparing “what we need” with “what the system offers” reveals the gap before design.",
            },
            {
              id: "jf5-mcq2",
              promptAr: "ما القاعدة الأولى عند اكتشاف فجوة؟",
              promptEn: "What is the first rule when a gap is found?",
              optionsAr: [
                "أجّل القرار للمرحلة الأخيرة.",
                "اقترح حلًا قياسيًا أولًا قبل التخصيص.",
                "ابدأ التخصيص فورًا.",
                "اطلب ميزانية إضافية.",
              ],
              optionsEn: [
                "Delay the decision to the last phase.",
                "Propose a standard solution before customization.",
                "Start customization immediately.",
                "Ask for a bigger budget.",
              ],
              answerIndex: 1,
              explainAr: "الحلول القياسية أقل تكلفة وأسهل في الترقية والصيانة.",
              explainEn: "Standard solutions cost less and are easier to upgrade and maintain.",
            },
          ],
          responses: [
            {
              id: "jf5-rs1",
              situationAr: "يصرّ العميل على تخصيص لا يوصي به النظام. ما أفضل رد؟",
              situationEn: "The client insists on a customization the system does not recommend. What is the best reply?",
              optionsAr: [
                "We'll do it and see what happens.",
                "Let me document both options with the impact, then you can decide.",
                "No, it's not allowed.",
                "It's your decision, I take no responsibility.",
              ],
              optionsEn: [
                "We'll do it and see what happens.",
                "Let me document both options with the impact, then you can decide.",
                "No, it's not allowed.",
                "It's your decision, I take no responsibility.",
              ],
              answerIndex: 1,
              explainAr: "توفير الخيارين مع الأثر يحترم قرار العميل ويحمي المشروع بالتوثيق.",
              explainEn: "Offering both options with the impact respects the client's decision and protects the project through documentation.",
            },
          ],
          order: [
            { id: "jf5-o1", labelAr: "تحديد الاحتياج بدقة", labelEn: "Define the need precisely" },
            { id: "jf5-o2", labelAr: "مقارنته بالوظيفة القياسية", labelEn: "Compare it with the standard functionality" },
            { id: "jf5-o3", labelAr: "وصف الفجوة والحلول البديلة", labelEn: "Describe the gap and the alternatives" },
            { id: "jf5-o4", labelAr: "تقييم أثر التخصيص", labelEn: "Assess the impact of customization" },
            { id: "jf5-o5", labelAr: "توثيق القرار والمخاطر", labelEn: "Document the decision and the risks" },
          ],
          phrases: [
            {
              id: "jf5-p1",
              en: "There's a gap here — the standard system doesn't cover this case.",
              ar: "توجد فجوة هنا — النظام القياسي لا يغطّي هذه الحالة.",
              tipAr: "انطق «gap here» بوضوح ثم اشرح الحالة.",
              tipEn: "Say “gap here” clearly, then explain the case.",
            },
            {
              id: "jf5-p2",
              en: "Before considering customization, let's see if a standard configuration meets the need.",
              ar: "قبل التفكير في التخصيص، دعنا نرى هل يلبّي إعداد قياسي الاحتياج.",
              tipAr: "قارن «customization» و«standard configuration» بنبرة متوازنة.",
              tipEn: "Contrast “customization” and “standard configuration” in a balanced tone.",
            },
          ],
        },
        quiz: [
          {
            id: "jf5-q1",
            promptAr: "ما معنى customization؟",
            promptEn: "What does customization mean?",
            optionsAr: [
              "تدريب المستخدمين.",
              "نسخة احتياطية.",
              "تعديل في النظام ليلائم احتياجًا غير قياسي.",
              "تحديث تلقائي.",
            ],
            optionsEn: [
              "User training.",
              "A backup.",
              "A system modification to fit a non-standard need.",
              "An automatic update.",
            ],
            answerIndex: 2,
            explainAr: "التخصيص يخرج عن المسار القياسي ويحمّل تكلفة صيانة إضافية.",
            explainEn: "Customization leaves the standard path and adds maintenance cost.",
            wordId: "customization",
          },
          {
            id: "jf5-q2",
            promptAr: "لماذا نبدأ بالحل القياسي؟",
            promptEn: "Why do we start with the standard solution?",
            optionsAr: [
              "لأن العميل لا يستحق الأفضل.",
              "لإخفاء المشكلة.",
              "لتقليل الجودة.",
              "أقل تكلفة وأسهل في الترقية والصيانة.",
            ],
            optionsEn: [
              "Because the client doesn't deserve better.",
              "To hide the problem.",
              "To lower quality.",
              "It costs less and is easier to upgrade and maintain.",
            ],
            answerIndex: 3,
            explainAr: "الحل القياسي يقلّل المخاطر ويضمن استمرارية الدعم.",
            explainEn: "The standard solution reduces risk and keeps support sustainable.",
          },
          {
            id: "jf5-q3",
            promptAr: "ما دور sandbox عند تجربة حل لفجوة؟",
            promptEn: "What is the role of a sandbox when testing a gap solution?",
            optionsAr: [
              "بيئة آمنة للتجربة دون التأثير على بيانات التشغيل.",
              "قاعدة بيانات حقيقية.",
              "أداة للمراسلة.",
              "تقرير مالي.",
            ],
            optionsEn: [
              "A safe environment to test without touching production data.",
              "A live production database.",
              "A messaging tool.",
              "A financial report.",
            ],
            answerIndex: 0,
            explainAr: "التجربة في بيئة معزولة تحمي بيانات التشغيل الحقيقية.",
            explainEn: "Testing in an isolated environment protects real production data.",
            wordId: "sandbox",
          },
          {
            id: "jf5-q4",
            promptAr: "ماذا نوثّق عند الموافقة على تخصيص؟",
            promptEn: "What do we document when a customization is approved?",
            optionsAr: [
              "سعر الساعة.",
              "القرار والأثر والمخاطر وخطة المعالجة.",
              "اسم المطوّر فقط.",
              "لا شيء.",
            ],
            optionsEn: [
              "The hourly rate.",
              "The decision, impact, risks and a mitigation plan.",
              "Just the developer's name.",
              "Nothing.",
            ],
            answerIndex: 1,
            explainAr: "التوثيق يحمي الجميع وواضح عند المراجعة.",
            explainEn: "Documentation protects everyone and is clear at review time.",
            wordId: "risk",
          },
          {
            id: "jf5-q5",
            promptAr: "أي قناة تُستخدم عادة لتصعيد قرار التخصيص للجهة الأعلى؟",
            promptEn: "Which channel is usually used to escalate a customization decision upward?",
            optionsAr: [
              "بيان الرصيد.",
              "كشف الرواتب.",
              "مصفوفة التصعيد (escalation matrix).",
              "قائمة الأسعار.",
            ],
            optionsEn: [
              "The balance sheet.",
              "The payslip.",
              "The escalation matrix.",
              "The price list.",
            ],
            answerIndex: 2,
            explainAr: "مصفوفة التصعيد تحدّد من يرفع القرار وإلى من.",
            explainEn: "The escalation matrix defines who raises the decision and to whom.",
            wordId: "escalation-matrix",
          },
        ],
      },

      // ───────────────── 6) شرح حلول ERP ─────────────────
      {
        id: "job-fc-06-explaining-erp-solutions",
        slug: "explaining-erp-solutions",
        order: 6,
        icon: "💡",
        titleAr: "شرح حلول ERP",
        titleEn: "Explaining ERP Solutions",
        level: "B2",
        scenarioAr:
          "تجتمع مع العميل لتشرح كيف ستعمل عمليته في النظام الجديد: ما الخطوات، ومن يوافق، وأين تنتهي الحالة، مع شرح بدائل الحل ومزايا الحل القياسي بلغة يفهمها غير التقنيين.",
        scenarioEn:
          "You meet the client to explain how their process will work in the new system: the steps, who approves, and where each status ends — explaining solution options and the benefits of the standard solution in non-technical language.",
        objectivesAr: [
          "شرح مسار العملية الجديدة خطوة بخطوة.",
          "توضيح الحالات (statuses) والموافقات.",
          "عرض بدائل الحل وأفضلية الحل القياسي.",
          "تبسيط المعلومة التقنية لغير المتخصصين.",
        ],
        objectivesEn: [
          "Explain the new process flow step by step.",
          "Clarify the statuses and approvals.",
          "Present solution options and the advantage of the standard solution.",
          "Simplify technical information for non-specialists.",
        ],
        refs: {
          processIds: ["o2c", "p2produce"],
          subModuleIds: ["sales-orders", "manufacturing-orders", "administration-approvals"],
          businessFunctionIds: ["sales-orders-create", "manufacturing-orders-create"],
          wordIds: ["module", "workflow", "approval", "integration", "master-data", "dashboard", "benchmark"],
          meetingLessonSlugs: ["asking-for-clarification"],
        },
        practice: {
          mcqs: [
            {
              id: "jf6-mcq1",
              promptAr: "ما أفضل طريقة لشرح عملية جديدة لغير المتخصصين؟",
              promptEn: "What is the best way to explain a new process to non-specialists?",
              optionsAr: [
                "استخدام مصطلحات تقنية كثيرة.",
                "إرسال ملف طويل بعد الاجتماع.",
                "سرد الخطوات بالترتيب مع مثال واقعي واحد.",
                "عرض شاشات النظام كاملة.",
              ],
              optionsEn: [
                "Use lots of technical terms.",
                "Send a long file after the meeting.",
                "Walk through the steps in order with one real example.",
                "Show all the system screens.",
              ],
              answerIndex: 2,
              explainAr: "الترتيب مع مثال واقعي يجعل الفكرة واضحة سريعًا.",
              explainEn: "Order plus a real example makes the idea clear quickly.",
            },
            {
              id: "jf6-mcq2",
              promptAr: "لماذا نفضّل الحل القياسي عند الشرح؟",
              promptEn: "Why do we favour the standard solution when explaining?",
              optionsAr: [
                "لأنه أرخص بالنسبة لنا فقط.",
                "لأنه لا يحتاج شرحًا.",
                "لأن العميل لا يفهم.",
                "لأنه أسرع تنفيذًا وأقل مخاطرة في الصيانة والترقية.",
              ],
              optionsEn: [
                "Because it is cheaper for us only.",
                "Because it needs no explanation.",
                "Because the client doesn't understand.",
                "It is faster to implement and lower-risk to maintain and upgrade.",
              ],
              answerIndex: 3,
              explainAr: "المزايا الحقيقية للعميل هي الأسرع للتنفيذ وأقل مخاطرة على المدى الطويل.",
              explainEn: "The client's real benefits are faster delivery and lower long-term risk.",
            },
          ],
          responses: [
            {
              id: "jf6-rs1",
              situationAr: "يسألك العميل سؤالًا تقنيًا لا تعرف إجابته فورًا. ما أفضل رد؟",
              situationEn: "The client asks a technical question you cannot answer on the spot. What is the best reply?",
              optionsAr: [
                "That's not important now.",
                "I'll answer whatever you like.",
                "Good question — let me confirm with the technical team and come back to you tomorrow.",
                "I think so, maybe.",
              ],
              optionsEn: [
                "That's not important now.",
                "I'll answer whatever you like.",
                "Good question — let me confirm with the technical team and come back to you tomorrow.",
                "I think so, maybe.",
              ],
              answerIndex: 2,
              explainAr: "الوعد بالتحقق مع موعد واضح يحفظ مصداقيتك.",
              explainEn: "Promising to check with a clear date keeps your credibility.",
            },
          ],
          order: [
            { id: "jf6-o1", labelAr: "تذكير بهدف الحل", labelEn: "Restate the goal of the solution" },
            { id: "jf6-o2", labelAr: "سرد خطوات العملية الجديدة", labelEn: "Walk through the new process steps" },
            { id: "jf6-o3", labelAr: "توضيح الحالات والموافقات", labelEn: "Clarify the statuses and approvals" },
            { id: "jf6-o4", labelAr: "عرض البدائل ومزايا القياسي", labelEn: "Present options and the standard advantage" },
            { id: "jf6-o5", labelAr: "فتح المجال للأسئلة", labelEn: "Open the floor for questions" },
          ],
          phrases: [
            {
              id: "jf6-p1",
              en: "Let me walk you through how this will work in the system, step by step.",
              ar: "دعني أشرح لك كيف ستعمل هذه العملية في النظام، خطوة بخطوة.",
              tipAr: "انطق «step by step» ببطء لتبديد القلق.",
              tipEn: "Say “step by step” slowly to ease any worry.",
            },
            {
              id: "jf6-p2",
              en: "This is the standard approach — it's faster to deliver and easier to maintain.",
              ar: "هذا هو الأسلوب القياسي — أسرع في التنفيذ وأسهل في الصيانة.",
              tipAr: "أكّد على «faster» و«easier» لأنهما فائدة العميل.",
              tipEn: "Emphasise “faster” and “easier” as the client's benefit.",
            },
          ],
        },
        quiz: [
          {
            id: "jf6-q1",
            promptAr: "ما معنى status في العملية؟",
            promptEn: "What does status mean in a process?",
            optionsAr: [
              "اسم الموظف.",
              "سعر المنتج.",
              "رقم الهاتف.",
              "حالة المستند أو الطلب في مرحلة معيّنة.",
            ],
            optionsEn: [
              "The employee's name.",
              "The product price.",
              "A phone number.",
              "The state of a document or request at a given stage.",
            ],
            answerIndex: 3,
            explainAr: "الحالات تنظّم تتبّع الطلب من الإدخال حتى الإغلاق.",
            explainEn: "Statuses organise the tracking of a request from entry to closure.",
            wordId: "status",
          },
          {
            id: "jf6-q2",
            promptAr: "لماذا نستخدم مثالًا واقعيًا عند الشرح؟",
            promptEn: "Why use a real example when explaining?",
            optionsAr: [
              "لربط الخطوات المجرّدة بحالة يفهمها العميل.",
              "لإطالة العرض.",
              "لتجنّب الأسئلة.",
              "لملء الوقت.",
            ],
            optionsEn: [
              "To connect abstract steps to a case the client understands.",
              "To lengthen the presentation.",
              "To avoid questions.",
              "To fill time.",
            ],
            answerIndex: 0,
            explainAr: "المثال الواقعي يقرّب الفهم سريعًا.",
            explainEn: "A real example speeds up understanding.",
          },
          {
            id: "jf6-q3",
            promptAr: "ما معنى integration في شرح الحل؟",
            promptEn: "What does integration mean in a solution explanation?",
            optionsAr: [
              "إعادة تشغيل الجهاز.",
              "ربط النظام بأنظمة أو وحدات أخرى لتبادل البيانات.",
              "حذف البيانات القديمة.",
              "تغيير اسم الشركة.",
            ],
            optionsEn: [
              "Restarting the machine.",
              "Linking the system with other systems or modules to exchange data.",
              "Deleting the old data.",
              "Changing the company name.",
            ],
            answerIndex: 1,
            explainAr: "التكامل يمنع إدخال البيانات مرتين ويوحّد المعلومة.",
            explainEn: "Integration avoids double entry and unifies information.",
            wordId: "integration",
          },
          {
            id: "jf6-q4",
            promptAr: "أي عبارة تُبسّط معلومة تقنية للعميل؟",
            promptEn: "Which phrase simplifies technical information for the client?",
            optionsAr: [
              "It's complicated, trust me.",
              "You won't understand the details.",
              "In simple terms, this means the invoice is posted automatically.",
              "The API listens on the endpoint and returns a payload.",
            ],
            optionsEn: [
              "It's complicated, trust me.",
              "You won't understand the details.",
              "In simple terms, this means the invoice is posted automatically.",
              "The API listens on the endpoint and returns a payload.",
            ],
            answerIndex: 2,
            explainAr: "«In simple terms» ثم الترجمة للغة الأعمال يوضّح بلا تعقيد.",
            explainEn: "“In simple terms” then translating into business language explains without complexity.",
          },
          {
            id: "jf6-q5",
            promptAr: "ما المقصود بـ benchmark عند مقارنة الحلول؟",
            promptEn: "What does benchmark mean when comparing solutions?",
            optionsAr: [
              "مخالفة مالية.",
              "نوع من الموافقات.",
              "ملف قديم.",
              "معيار مرجعي للمقارنة مع أفضل الممارسات.",
            ],
            optionsEn: [
              "A financial penalty.",
              "A type of approval.",
              "An old file.",
              "A reference standard for comparison with best practice.",
            ],
            answerIndex: 3,
            explainAr: "المعيار المرجعي يجعل التوصية موضوعية لا رأيًا شخصيًا.",
            explainEn: "A benchmark makes the recommendation objective, not a personal opinion.",
            wordId: "benchmark",
          },
        ],
      },

      // ───────────────── 7) مناقشة إعدادات الوحدة ─────────────────
      {
        id: "job-fc-07-discussing-module-configuration",
        slug: "discussing-module-configuration",
        order: 7,
        icon: "⚙️",
        titleAr: "مناقشة إعدادات الوحدة",
        titleEn: "Discussing Module Configuration",
        level: "B2",
        scenarioAr:
          "اجتمع الفريق الفني مع العميل لمناقشة إعدادات وحدة معيّنة: الحقول الإلزامية، سلسلة الموافقات، والحالات. عليك أن تشرح الخيارات وتأثير كل خيار على سير العمل اليومي بدون الدخول في تفاصيل برمجية.",
        scenarioEn:
          "The technical team meets the client to discuss the configuration of a specific module: mandatory fields, the approval chain, and the statuses. You must explain the options and how each choice affects daily work without diving into programming.",
        objectivesAr: [
          "شرح معنى الإعداد (configuration) وآثره على المستخدم.",
          "توضيح الحقول الإلزامية وخيارات الإدخال.",
          "وصف سلسلة الموافقات والحالات.",
          "فصل الإعداد القياسي عن التخصيص في النقاش.",
        ],
        objectivesEn: [
          "Explain what configuration means and how it affects users.",
          "Clarify mandatory fields and input options.",
          "Describe the approval chain and the statuses.",
          "Separate standard configuration from customization in the discussion.",
        ],
        refs: {
          processIds: ["p2p"],
          subModuleIds: ["administration-system", "administration-workflow", "administration-approvals", "finance-gl"],
          businessFunctionIds: ["finance-gl-post-entry", "purchasing-orders-approve"],
          wordIds: ["parameter", "master-data", "workflow", "approval", "transaction", "sandbox", "audit-trail", "permission-role"],
          screenIds: [
            "mnu-configuration",
            "mnu-master-data",
            "stt-pending-approval",
            "stt-approved",
            "stt-submitted",
            "fld-mandatory-field",
            "fld-dropdown",
          ],
        },
        practice: {
          mcqs: [
            {
              id: "jf7-mcq1",
              promptAr: "ما الحقل الذي لا يُسمح بحفظ السجل بدونه؟",
              promptEn: "Which field cannot be left empty when saving a record?",
              optionsAr: [
                "الحقل الإلزامي (mandatory field).",
                "الحقل الاختياري.",
                "حقل الملاحظات.",
                "حقل المرفقات.",
              ],
              optionsEn: [
                "The mandatory field.",
                "The optional field.",
                "The notes field.",
                "The attachment field.",
              ],
              answerIndex: 0,
              explainAr: "الحقل الإلزامي يمنع حفظ بيانات ناقصة.",
              explainEn: "A mandatory field prevents saving incomplete data.",
              wordId: "fld-mandatory-field",
            },
            {
              id: "jf7-mcq2",
              promptAr: "ما الهدف من سلسلة الموافقات (approval chain)؟",
              promptEn: "What is the purpose of the approval chain?",
              optionsAr: [
                "تغيير الحالات فقط.",
                "ضمان مرور الطلب بالمراجعات المطلوبة بالترتيب.",
                "إطالة وقت المعالجة.",
                "منع المستخدمين من العمل.",
              ],
              optionsEn: [
                "To change statuses only.",
                "To ensure the request passes the required reviews in order.",
                "To lengthen processing time.",
                "To stop users from working.",
              ],
              answerIndex: 1,
              explainAr: "السلسلة تضبط من يوافق ومتى بوضوح.",
              explainEn: "The chain clearly controls who approves and when.",
              wordId: "approval",
            },
          ],
          responses: [
            {
              id: "jf7-rs1",
              situationAr: "يسأل العميل: «لماذا هذا الحقل إلزامي؟» ما أفضل شرح؟",
              situationEn: "The client asks: “Why is this field mandatory?” What is the best explanation?",
              optionsAr: [
                "Because the system says so.",
                "It's a technical rule.",
                "Just fill it in, please.",
                "Because without it the report can't match the cost to the right cost centre.",
              ],
              optionsEn: [
                "Because the system says so.",
                "It's a technical rule.",
                "Just fill it in, please.",
                "Because without it the report can't match the cost to the right cost centre.",
              ],
              answerIndex: 3,
              explainAr: "ربط الإلزام بفائدة عملية مقنع للمستخدم أكثر من «قاعدة النظام».",
              explainEn: "Tying the requirement to a practical benefit convinces the user more than “system rule”.",
            },
          ],
          order: [
            { id: "jf7-o1", labelAr: "تحديد الوحدة ونطاق الإعداد", labelEn: "Identify the module and configuration scope" },
            { id: "jf7-o2", labelAr: "شرح الحقول الإلزامية والاختيارية", labelEn: "Explain mandatory and optional fields" },
            { id: "jf7-o3", labelAr: "وصف سلسلة الموافقات", labelEn: "Describe the approval chain" },
            { id: "jf7-o4", labelAr: "تعريف الحالات وانتقالاتها", labelEn: "Define the statuses and their transitions" },
            { id: "jf7-o5", labelAr: "تأكيد الإعداد في بيئة تجريبية", labelEn: "Confirm the configuration in a test environment" },
          ],
          phrases: [
            {
              id: "jf7-p1",
              en: "This field is mandatory, because the approval can't proceed without it.",
              ar: "هذا الحقل إلزامي، لأن الموافقة لا يمكن أن تكتمل بدونه.",
              tipAr: "اربط الإلزام بسبب منطقي لتقنع المستخدم.",
              tipEn: "Link the requirement to a logical reason to convince the user.",
            },
            {
              id: "jf7-p2",
              en: "Let's configure this in a sandbox first and confirm it before production.",
              ar: "لنُعدّ هذا في بيئة تجريبية أولًا ونؤكّده قبل بيئة التشغيل.",
              tipAr: "فرّق بوضوح بين «sandbox» و«production».",
              tipEn: "Clearly distinguish “sandbox” from “production”.",
            },
          ],
        },
        quiz: [
          {
            id: "jf7-q1",
            promptAr: "ما معنى parameter في إعداد الوحدة؟",
            promptEn: "What does parameter mean in module configuration?",
            optionsAr: [
              "قيمة قابلة للضبط تتحكّم في سلوك النظام.",
              "رسالة خطأ.",
              "اسم المستخدم.",
              "كلمة المرور.",
            ],
            optionsEn: [
              "An adjustable value that controls system behaviour.",
              "An error message.",
              "The username.",
              "The password.",
            ],
            answerIndex: 0,
            explainAr: "المعامل يسمح بتغيير السلوك دون تعديل برمجي.",
            explainEn: "A parameter changes behaviour without code changes.",
            wordId: "parameter",
          },
          {
            id: "jf7-q2",
            promptAr: "ما المرحلة التي يمرّ بها الطلب قبل الموافقة؟",
            promptEn: "What stage does a request pass through before approval?",
            optionsAr: [
              "مدفوع ثم مرسل.",
              "تم الإرسال (submitted) ثم بانتظار الموافقة (pending approval).",
              "معتمد ثم ملغى.",
              "مغلق ثم مفتوح.",
            ],
            optionsEn: [
              "Paid, then submitted.",
              "Submitted, then pending approval.",
              "Approved, then cancelled.",
              "Closed, then open.",
            ],
            answerIndex: 1,
            explainAr: "التسلسل المنطقي: إرسال ثم انتظار ثم اعتماد.",
            explainEn: "The logical sequence: submitted, then pending, then approved.",
            wordId: "stt-pending-approval",
          },
          {
            id: "jf7-q3",
            promptAr: "لماذا نستخدم بيئة تجريبية قبل التشغيل؟",
            promptEn: "Why do we use a test environment before production?",
            optionsAr: [
              "لأن النظام أسرع هناك.",
              "لا فائدة.",
              "لتجربة الإعداد دون التأثير على بيانات العمل الحقيقية.",
              "لتوفير الترخيص.",
            ],
            optionsEn: [
              "Because the system is faster there.",
              "No benefit.",
              "To test the configuration without affecting real business data.",
              "To save on the licence.",
            ],
            answerIndex: 2,
            explainAr: "البيئة التجريبية تحمي التشغيل من الأخطاء.",
            explainEn: "A test environment protects production from errors.",
            wordId: "sandbox",
          },
          {
            id: "jf7-q4",
            promptAr: "ما دور audit trail في ضبط الإعداد؟",
            promptEn: "What is the role of the audit trail in configuration control?",
            optionsAr: [
              "تسريع التقارير.",
              "حذف السجلات.",
              "تغيير الحالات.",
              "تسجيل من غيّر ماذا ومتى.",
            ],
            optionsEn: [
              "Speeding up reports.",
              "Deleting records.",
              "Changing statuses.",
              "Recording who changed what and when.",
            ],
            answerIndex: 3,
            explainAr: "سجل التدقيق أساس الحوكمة والمساءلة.",
            explainEn: "The audit trail is the basis of governance and accountability.",
            wordId: "audit-trail",
          },
          {
            id: "jf7-q5",
            promptAr: "أي عنصر يحدّد من يستطيع تغيير الإعداد؟",
            promptEn: "Which element defines who can change the configuration?",
            optionsAr: [
              "صلاحية الدور (permission role).",
              "لون الشاشة.",
              "حجم الخط.",
              "اسم التقارير.",
            ],
            optionsEn: [
              "The permission role.",
              "The screen colour.",
              "The font size.",
              "The report name.",
            ],
            answerIndex: 0,
            explainAr: "الصلاحيات تضبط من يعدّل الإعداد الحسّاس.",
            explainEn: "Permissions control who can change sensitive configuration.",
            wordId: "permission-role",
          },
        ],
      },

      // ───────────────── 8) إعداد التوثيق الوظيفي ─────────────────
      {
        id: "job-fc-08-preparing-functional-documentation",
        slug: "preparing-functional-documentation",
        order: 8,
        icon: "📄",
        titleAr: "إعداد التوثيق الوظيفي",
        titleEn: "Preparing Functional Documentation",
        level: "B2",
        scenarioAr:
          "عليك أن تحوّل ما اتُّفق عليه في الورشة إلى وثيقة وظيفية واضحة: وصف العملية، الخطوات، الحالات، المتطلبات غير الوظيفية، وأمثلة الاختبار، ثم تعرضها على أصحاب المصلحة للاعتماد.",
        scenarioEn:
          "You must turn what was agreed in the workshop into a clear functional document: process description, steps, statuses, non-functional requirements and test examples — then present it to the stakeholders for approval.",
        objectivesAr: [
          "ترتيب أقسام الوثيقة الوظيفية.",
          "كتابة وصف دقيق للعملية والخطوات.",
          "توثيق الحالات والحالات الاستثنائية.",
          "عرض الوثيقة للاعتماد وتوثيق الملاحظات.",
        ],
        objectivesEn: [
          "Order the sections of the functional document.",
          "Write a precise description of the process and steps.",
          "Document the statuses and exception cases.",
          "Present the document for approval and record feedback.",
        ],
        refs: {
          processIds: ["r2r"],
          subModuleIds: ["documents-templates", "documents-types", "documents-versioning", "documents-approvals"],
          wordIds: ["template", "approval", "change-request", "objective", "field", "draft", "status", "memo"],
          emailLessonSlugs: ["supplier-follow-up", "issue-escalation"],
        },
        practice: {
          mcqs: [
            {
              id: "jf8-mcq1",
              promptAr: "ما العنصر الذي يجب أن يوجد في كل متطلب موثّق؟",
              promptEn: "What must every documented requirement include?",
              optionsAr: [
                "اسم القسم فقط.",
                "تاريخ فقط.",
                "معرّف فريد ووصف ومصدر ومعيار قبول.",
                "لون فقط.",
              ],
              optionsEn: [
                "Just the department name.",
                "Just a date.",
                "A unique ID, a description, a source and acceptance criteria.",
                "Just a colour.",
              ],
              answerIndex: 2,
              explainAr: "المعرّف والوصف ومعيار القبول تجعل المتطلب قابلًا للتتبّع والاختبار.",
              explainEn: "ID, description and acceptance criteria make the requirement traceable and testable.",
            },
            {
              id: "jf8-mcq2",
              promptAr: "لماذا نوثّق الحالات غير الوظيفية (non-functional)؟",
              promptEn: "Why do we document non-functional requirements?",
              optionsAr: [
                "لأنها أسهل.",
                "لأنها مطلوبة شكليًا.",
                "لأنها تُختصر دائمًا.",
                "لأنها تحدّد الأداء والأمان والتوافر لا الوظيفة فقط.",
              ],
              optionsEn: [
                "Because they are easier.",
                "Because they are a formal requirement.",
                "Because they are always dropped.",
                "Because they define performance, security and availability, not just function.",
              ],
              answerIndex: 3,
              explainAr: "المتطلبات غير الوظيفية تمنع مفاجآت الأداء والأمان بعد التشغيل.",
              explainEn: "Non-functional requirements prevent performance and security surprises after go-live.",
            },
          ],
          responses: [
            {
              id: "jf8-rs1",
              situationAr: "أعاد العميل الوثيقة بتعديلات في اليوم الأخير. ما أفضل رد؟",
              situationEn: "The client returns the document with changes on the last day. What is the best reply?",
              optionsAr: [
                "These are changes of scope — let me log them and assess the impact on the timeline.",
                "No problem, I'll change everything now.",
                "Too late, the document is approved.",
                "I'll ignore the changes.",
              ],
              optionsEn: [
                "These are changes of scope — let me log them and assess the impact on the timeline.",
                "No problem, I'll change everything now.",
                "Too late, the document is approved.",
                "I'll ignore the changes.",
              ],
              answerIndex: 0,
              explainAr: "تصنيف التعديل كتغيير نطاق وتوثيقه يحمي الجدول.",
              explainEn: "Classifying the change as a scope change and logging it protects the schedule.",
            },
          ],
          order: [
            { id: "jf8-o1", labelAr: "وصف العملية والهدف", labelEn: "Describe the process and the objective" },
            { id: "jf8-o2", labelAr: "تفصيل الخطوات والأدوار والصلاحيات", labelEn: "Detail the steps, roles and permissions" },
            { id: "jf8-o3", labelAr: "توثيق الحالات والحالات الاستثنائية", labelEn: "Document the statuses and exceptions" },
            { id: "jf8-o4", labelAr: "تحديد المتطلبات غير الوظيفية", labelEn: "Define the non-functional requirements" },
            { id: "jf8-o5", labelAr: "إضافة أمثلة الاختبار وعرض الوثيقة للاعتماد", labelEn: "Add test examples and present for approval" },
          ],
          phrases: [
            {
              id: "jf8-p1",
              en: "Let me add this to the functional document and send it for your approval.",
              ar: "دعني أضف هذا إلى الوثيقة الوظيفية وأرسلها لاعتمادكم.",
              tipAr: "أكّد على «functional document» و«approval».",
              tipEn: "Emphasise “functional document” and “approval”.",
            },
            {
              id: "jf8-p2",
              en: "This is a change of scope, so we'll log it and review the impact together.",
              ar: "هذا تغيير في النطاق، لذا سنوثّقه ونراجع الأثر معًا.",
              tipAr: "انطق «scope» بوضوح لأنها مفتاح الجملة.",
              tipEn: "Say “scope” clearly as it is the key of the sentence.",
            },
          ],
        },
        quiz: [
          {
            id: "jf8-q1",
            promptAr: "ما الفرق بين BRD و FRD؟",
            promptEn: "What is the difference between a BRD and an FRD?",
            optionsAr: [
              "FRD يُكتب بعد التشغيل.",
              "BRD يصف احتياج العمل عالي المستوى، وFRD يترجمه لمتطلبات وظيفية دقيقة.",
              "لا فرق بينهما.",
              "BRD تقني وFRD إداري.",
            ],
            optionsEn: [
              "The FRD is written after go-live.",
              "The BRD describes high-level business needs; the FRD translates them into precise functional requirements.",
              "There is no difference.",
              "The BRD is technical and the FRD is managerial.",
            ],
            answerIndex: 1,
            explainAr: "التمييز أساس فهم وثائق المشروع.",
            explainEn: "The distinction is fundamental to understanding project documents.",
          },
          {
            id: "jf8-q2",
            promptAr: "ما معنى draft في دورة حياة الوثيقة؟",
            promptEn: "What does draft mean in the document lifecycle?",
            optionsAr: [
              "ملف مؤرشف.",
              "نسخة محذوفة.",
              "نسخة أولية غير معتمدة بعد.",
              "نسخة نهائية موقّعة.",
            ],
            optionsEn: [
              "An archived file.",
              "A deleted version.",
              "An initial version not yet approved.",
              "A final signed version.",
            ],
            answerIndex: 2,
            explainAr: "المسودة قابلة للتعديل حتى الاعتماد.",
            explainEn: "A draft can still change until it is approved.",
            wordId: "draft",
          },
          {
            id: "jf8-q3",
            promptAr: "لماذا نضع معيار قبول (acceptance criteria) لكل متطلب؟",
            promptEn: "Why put acceptance criteria on every requirement?",
            optionsAr: [
              "لأنه يطيل الوثيقة.",
              "لأن النظام يفرضه.",
              "لا سبب.",
              "لأنه يحدّد متى يكون المتطلب منفّذًا فعليًا.",
            ],
            optionsEn: [
              "Because it lengthens the document.",
              "Because the system forces it.",
              "No reason.",
              "Because it defines when the requirement is truly satisfied.",
            ],
            answerIndex: 3,
            explainAr: "معيار القبول يمنع الخلاف في مرحلة الاختبار.",
            explainEn: "Acceptance criteria prevent disputes at the testing stage.",
          },
          {
            id: "jf8-q4",
            promptAr: "كيف نتعامل مع الحالات الاستثنائية في الوثيقة؟",
            promptEn: "How do we handle exception cases in the document?",
            optionsAr: [
              "نوثّقها صراحة مع المسار البديل.",
              "نتجاهلها لتوفير الوقت.",
              "نتركها للعميل.",
              "نذكرها شفهيًا فقط.",
            ],
            optionsEn: [
              "Document them explicitly with the alternative path.",
              "Ignore them to save time.",
              "Leave them to the client.",
              "Mention them verbally only.",
            ],
            answerIndex: 0,
            explainAr: "الحالات الاستثنائية هي أكثر ما يسبب المشكلات لاحقًا.",
            explainEn: "Exceptions cause most of the problems later.",
          },
          {
            id: "jf8-q5",
            promptAr: "أي معلومات يجب أن تحتويها الوثيقة المعتمدة نهائيًا؟",
            promptEn: "What should the finally approved document contain?",
            optionsAr: [
              "صور فقط.",
              "رقم نسخة وتاريخ وموافقات موثّقة.",
              "رأيَ كاتب الوثيقة فقط.",
              "لا شيء غير المتطلبات.",
            ],
            optionsEn: [
              "Only images.",
              "A version number, a date and documented approvals.",
              "Only the author's opinion.",
              "Nothing beyond the requirements.",
            ],
            answerIndex: 1,
            explainAr: "النسخة والتاريخ والموافقات تضمن تتبّع التغييرات.",
            explainEn: "Version, date and approvals keep the changes traceable.",
          },
        ],
      },

      // ───────────────── 9) إدارة تدريب المستخدمين ─────────────────
      {
        id: "job-fc-09-conducting-user-training",
        slug: "conducting-user-training",
        order: 9,
        icon: "🎓",
        titleAr: "إدارة تدريب المستخدمين",
        titleEn: "Conducting User Training",
        level: "B1",
        scenarioAr:
          "قبل التشغيل، تدرّب المستخدمين على العملية الجديدة داخل النظام. تحتاج إلى افتتاح الجلسة، وشرح الخطوات بأمثلة، والتحقّق من الفهم، وتوثيق الأسئلة والمتابعة.",
        scenarioEn:
          "Before go-live, you train the users on the new process in the system. You need to open the session, walk through the steps with examples, check understanding, and record questions and follow-up.",
        objectivesAr: [
          "افتتاح جلسة تدريب بأهداف واضحة.",
          "شرح الخطوات خطوة بخطوة بمثال عملي.",
          "التحقّق من فهم المتدربين.",
          "توثيق الأسئلة والمتابعة بعد الجلسة.",
        ],
        objectivesEn: [
          "Open a training session with clear objectives.",
          "Walk through the steps step by step with a practical example.",
          "Check that the trainees understood.",
          "Record questions and follow up after the session.",
        ],
        refs: {
          processIds: ["h2r"],
          subModuleIds: ["hr-training", "hr-employees", "communication-meetings"],
          wordIds: ["onboarding", "job-description", "follow-up", "feedback", "objective", "milestone"],
          meetingLessonSlugs: ["starting-business-meeting", "summarizing-minutes"],
        },
        practice: {
          mcqs: [
            {
              id: "jf9-mcq1",
              promptAr: "ما أفضل طريقة لافتتاح جلسة تدريب؟",
              promptEn: "What is the best way to open a training session?",
              optionsAr: [
                "اذكر الهدف والنتائج المتوقعة والوقت المتاح.",
                "ابدأ فورًا بالشاشات.",
                "اطلب من الحاضرين تقديم أنفسهم فقط.",
                "اسأل عن المشاكل دون سياق.",
              ],
              optionsEn: [
                "State the objective, the expected outcomes and the time available.",
                "Start straight away with the screens.",
                "Ask the attendees only to introduce themselves.",
                "Ask about problems with no context.",
              ],
              answerIndex: 0,
              explainAr: "الهدف والوقت يضبطان توقّعات المتدربين.",
              explainEn: "Objective and time set the trainees' expectations.",
            },
            {
              id: "jf9-mcq2",
              promptAr: "كيف تتحقّق من فهم المتدربين أثناء الجلسة؟",
              promptEn: "How do you check the trainees' understanding during the session?",
              optionsAr: [
                "أترك الشرح للتقرير.",
                "أطلب منهم تكرار الخطوة أو تنفيذها أمامي.",
                "أكمل الشرح دون توقّف.",
                "أسأل «هل فهمتم؟» فقط.",
              ],
              optionsEn: [
                "Leave the explanation for the report.",
                "Ask them to repeat or perform the step in front of you.",
                "Continue explaining without stopping.",
                "Only ask “did you understand?”.",
              ],
              answerIndex: 1,
              explainAr: "التنفيذ العملي أفضل دليل على الفهم من السؤال العام.",
              explainEn: "Doing the step is better evidence than a general question.",
            },
          ],
          responses: [
            {
              id: "jf9-rs1",
              situationAr: "يسأل متدرب سؤالًا بسيطًا أمام المجموعة. ما أفضل رد؟",
              situationEn: "A trainee asks a simple question in front of the group. What is the best reply?",
              optionsAr: [
                "It's easy, you'll get it.",
                "Good question — let's go through it together on the screen.",
                "We covered that already.",
                "Ask me after the session.",
              ],
              optionsEn: [
                "It's easy, you'll get it.",
                "Good question — let's go through it together on the screen.",
                "We covered that already.",
                "Ask me after the session.",
              ],
              answerIndex: 1,
              explainAr: "الإجابة أمام الجميع تفيد المجموعة وتشجّع على السؤال.",
              explainEn: "Answering in front of the group benefits everyone and encourages questions.",
            },
          ],
          order: [
            { id: "jf9-o1", labelAr: "ترحيب وذكر الهدف والوقت", labelEn: "Welcome, state the objective and time" },
            { id: "jf9-o2", labelAr: "عرض العملية الكاملة بمثال", labelEn: "Show the full process with an example" },
            { id: "jf9-o3", labelAr: "تنفيذ الخطوات مع المتدربين", labelEn: "Perform the steps with the trainees" },
            { id: "jf9-o4", labelAr: "التحقّق من الفهم", labelEn: "Check understanding" },
            { id: "jf9-o5", labelAr: "توثيق الأسئلة والمتابعة", labelEn: "Record questions and follow up" },
          ],
          phrases: [
            {
              id: "jf9-p1",
              en: "By the end of this session, you'll be able to create and approve a purchase order.",
              ar: "بنهاية هذه الجلسة، ستكون قادرًا على إنشاء أمر شراء واعتماده.",
              tipAr: "ابدأ بـ«By the end of this session» لتوضيح النتيجة المتوقعة.",
              tipEn: "Start with “By the end of this session” to state the outcome.",
            },
            {
              id: "jf9-p2",
              en: "Could you show me how you would do it, so I can make sure it's clear?",
              ar: "هل يمكنك أن تريني كيف ستفعلها، لأتأكد من وضوحها؟",
              tipAr: "نبرة داعمة لا اختبارية.",
              tipEn: "Use a supportive tone, not a testing one.",
            },
          ],
        },
        quiz: [
          {
            id: "jf9-q1",
            promptAr: "ما معنى onboarding في سياق المشروع؟",
            promptEn: "What does onboarding mean in a project context?",
            optionsAr: [
              "ترقية النظام.",
              "نسخ البيانات.",
              "تهيئة المستخدم/الموظف للعمل على النظام أو العملية الجديدة.",
              "إنهاء الخدمة.",
            ],
            optionsEn: [
              "Upgrading the system.",
              "Copying data.",
              "Preparing a user/employee to work with the new system or process.",
              "Ending employment.",
            ],
            answerIndex: 2,
            explainAr: "التهيئة تشمل التدريب والتوجيه قبل الاستخدام الفعلي.",
            explainEn: "Onboarding includes training and guidance before actual use.",
            wordId: "onboarding",
          },
          {
            id: "jf9-q2",
            promptAr: "لماذا نوثّق أسئلة الجلسة؟",
            promptEn: "Why do we record the questions from the session?",
            optionsAr: [
              "لملء وقت الجلسة.",
              "لتصفية الحاضرين.",
              "لا سبب.",
              "لمعالجة ما لم يُجب عليه ومتابعته.",
            ],
            optionsEn: [
              "To fill session time.",
              "To screen the attendees.",
              "No reason.",
              "To handle what was not answered and follow it up.",
            ],
            answerIndex: 3,
            explainAr: "الأسئلة المفتوحة تشير إلى ما يحتاج مزيد توضيح.",
            explainEn: "Open questions point to what needs more clarification.",
            wordId: "follow-up",
          },
          {
            id: "jf9-q3",
            promptAr: "ما أفضل دليل على نجاح التدريب؟",
            promptEn: "What is the best evidence that training succeeded?",
            optionsAr: [
              "قدرة المستخدم على تنفيذ المهمة بنفسه.",
              "عدد الحضور فقط.",
              "طول الجلسة.",
              "عدد الشرائح.",
            ],
            optionsEn: [
              "The user's ability to perform the task alone.",
              "Only the attendance count.",
              "The length of the session.",
              "The number of slides.",
            ],
            answerIndex: 0,
            explainAr: "الأداء الفعلي هو المقياس الحقيقي.",
            explainEn: "Actual performance is the real measure.",
          },
          {
            id: "jf9-q4",
            promptAr: "لماذا نطلب ملاحظات المتدربين (feedback)؟",
            promptEn: "Why do we ask for trainee feedback?",
            optionsAr: [
              "لا سبب.",
              "لتحسين المادة والطريقة في الجلسات القادمة.",
              "لتقييم الموظفين.",
              "لتقليل المدة.",
            ],
            optionsEn: [
              "No reason.",
              "To improve the material and method in future sessions.",
              "To appraise the employees.",
              "To shorten the duration.",
            ],
            answerIndex: 1,
            explainAr: "الملاحظات تغلق الفجوة بين الشرح والفهم.",
            explainEn: "Feedback closes the gap between explanation and understanding.",
            wordId: "feedback",
          },
          {
            id: "jf9-q5",
            promptAr: "ما دور وصف الوظيفة (job description) في التدريب؟",
            promptEn: "What is the role of the job description in training?",
            optionsAr: [
              "يُستخدم للتسويق.",
              "لا علاقة له.",
              "يحدّد ما يحتاج الموظف معرفته لأداء مهامه.",
              "يحدّد الراتب.",
            ],
            optionsEn: [
              "It is used for marketing.",
              "It is unrelated.",
              "It defines what the employee needs to know to do the job.",
              "It sets the salary.",
            ],
            answerIndex: 2,
            explainAr: "الوظيفة تحدّد نطاق التدريب المطلوب.",
            explainEn: "The job defines the required training scope.",
            wordId: "job-description",
          },
        ],
      },

      // ───────────────── 10) إدارة مشكلات العميل ─────────────────
      {
        id: "job-fc-10-managing-client-issues",
        slug: "managing-client-issues",
        order: 10,
        icon: "🚨",
        titleAr: "إدارة مشكلات العميل",
        titleEn: "Managing Client Issues",
        level: "B2",
        scenarioAr:
          "تلقّيت بلاغًا عن مشكلة تعطّل عملًا يوميًا لدى العميل. عليك أن تتعامل معه بهدوء: توثّق الحادثة، تحدّد الأولوية والأثر، تصعّد عند الحاجة، ثم تتابع حتى الإغلاق وتخبر العميل بالحالة.",
        scenarioEn:
          "You receive a report of an issue blocking the client's daily work. You must handle it calmly: log the incident, set the priority and impact, escalate when needed, then follow up to closure and keep the client informed.",
        objectivesAr: [
          "توثيق الحادثة والأثر والأولوية.",
          "توضيح المسار الحالي للمستخدم بلغة مهنية.",
          "التصعيد وفق مصفوفة التصعيد عند الحاجة.",
          "المتابعة حتى الإغلاق وإبلاغ العميل.",
        ],
        objectivesEn: [
          "Log the incident, impact and priority.",
          "Give the user a clear workaround in professional language.",
          "Escalate according to the escalation matrix when needed.",
          "Follow up to closure and update the client.",
        ],
        refs: {
          processIds: ["p2produce", "p2p"],
          subModuleIds: ["services-tickets", "services-sla", "management-escalation", "communication-escalation"],
          wordIds: [
            "escalate",
            "escalation-matrix",
            "owner",
            "sla",
            "ticket",
            "incident",
            "risk",
            "deadline",
            "resolution-time",
            "response-time",
          ],
          emailLessonSlugs: ["issue-escalation", "invoice-discrepancy"],
          meetingLessonSlugs: ["problems-action-items"],
        },
        practice: {
          mcqs: [
            {
              id: "jf10-mcq1",
              promptAr: "ما أول خطوة عند استلام بلاغ مشكلة؟",
              promptEn: "What is the first step when you receive an issue report?",
              optionsAr: [
                "إخبار مدير العميل بالخطأ.",
                "الانتظار حتى تتكرر.",
                "تسجيل الحادثة وتحديد الأثر والأولوية.",
                "إصلاح النظام فورًا.",
              ],
              optionsEn: [
                "Tell the client's manager about the mistake.",
                "Wait until it happens again.",
                "Log the incident and set the impact and priority.",
                "Fix the system immediately.",
              ],
              answerIndex: 2,
              explainAr: "التوثيق والتقييم يوجّهان الجهد إلى الأهم أولًا.",
              explainEn: "Logging and assessing direct effort to what matters most first.",
            },
            {
              id: "jf10-mcq2",
              promptAr: "متى نصعّد المشكلة؟",
              promptEn: "When do we escalate an issue?",
              optionsAr: [
                "في كل مشكلة.",
                "لا نصعّد أبدًا.",
                "بعد إغلاق المشكلة.",
                "عندما تتجاوز حدود الأولوية أو الزمن المتفق عليه.",
              ],
              optionsEn: [
                "For every issue.",
                "We never escalate.",
                "After the issue is closed.",
                "When it exceeds the agreed priority or time limits.",
              ],
              answerIndex: 3,
              explainAr: "التصعيد أداة تُستخدم عند تجاوز الحدود المتفق عليها، لا لكل مشكلة.",
              explainEn: "Escalation is used when agreed limits are exceeded, not for every issue.",
              wordId: "escalate",
            },
          ],
          responses: [
            {
              id: "jf10-rs1",
              situationAr: "يتصل العميل غاضبًا لأن التقارير متوقفة. ما أفضل افتتاحية؟",
              situationEn: "The client calls angrily because the reports are down. What is the best opening?",
              optionsAr: [
                "أتفهّم أن هذا يعطّل عملكم — أعالجه الآن وسأوافيكم بالتحديث خلال ساعة.",
                "اهدأ، الأمر ليس بهذه الخطورة.",
                "الأرجح أنها مشكلة في شبكتكم.",
                "من فضلك سجّل تذكرة وسأنظر فيها لاحقًا.",
              ],
              optionsEn: [
                "It's probably your network.",
                "Please log a ticket and I'll look later.",
                "I understand this is blocking you — I'm on it now and will update you within the hour.",
                "Calm down, it's not that serious.",
              ],
              answerIndex: 2,
              explainAr: "الاعتراف بالأثر مع وعد بموعد تحديث واضح يهدّئ العميل ويبني الثقة.",
              explainEn: "Acknowledging the impact with a clear update time calms the client and builds trust.",
            },
          ],
          order: [
            { id: "jf10-o1", labelAr: "تسجيل الحادثة ووصفها", labelEn: "Log and describe the incident" },
            { id: "jf10-o2", labelAr: "تحديد الأثر والأولوية", labelEn: "Set the impact and priority" },
            { id: "jf10-o3", labelAr: "تقديم حل مؤقت إن أمكن", labelEn: "Offer a workaround if possible" },
            { id: "jf10-o4", labelAr: "التصعيد وفق المصفوفة عند الحاجة", labelEn: "Escalate per the matrix when needed" },
            { id: "jf10-o5", labelAr: "المتابعة حتى الإغلاق وإبلاغ العميل", labelEn: "Follow up to closure and update the client" },
          ],
          phrases: [
            {
              id: "jf10-p1",
              en: "I understand the impact — I'll update you within the hour, even if it's not resolved yet.",
              ar: "أتفهّم الأثر — سأوافيك بالتحديث خلال ساعة، حتى لو لم تُحلّ بعد.",
              tipAr: "أكّد على موعد التحديث لتطمئن العميل.",
              tipEn: "Stress the update time to reassure the client.",
            },
            {
              id: "jf10-p2",
              en: "I'm escalating this to our technical lead as it's affecting daily operations.",
              ar: "أنا أصعّد هذا إلى الفريق الفني لأنه يؤثّر على العمل اليومي.",
              tipAr: "انطق «escalating» بثقة مع تبرير واضح.",
              tipEn: "Say “escalating” confidently with a clear reason.",
            },
          ],
        },
        quiz: [
          {
            id: "jf10-q1",
            promptAr: "ما معنى SLA؟",
            promptEn: "What does SLA mean?",
            optionsAr: [
              "نوع من الفواتير.",
              "قائمة الأسعار.",
              "تقرير مالي.",
              "اتفاقية مستوى الخدمة التي تحدّد زمن الاستجابة والحل.",
            ],
            optionsEn: [
              "A type of invoice.",
              "A price list.",
              "A financial report.",
              "A service-level agreement defining response and resolution times.",
            ],
            answerIndex: 3,
            explainAr: "SLA تحمي العلاقة بتحديد التوقّعات الزمنية.",
            explainEn: "An SLA protects the relationship by defining time expectations.",
            wordId: "sla",
          },
          {
            id: "jf10-q2",
            promptAr: "ما الفرق بين response time و resolution time؟",
            promptEn: "What is the difference between response time and resolution time?",
            optionsAr: [
              "الأول زمن الردّ الأول، والثاني زمن الحل النهائي.",
              "لا فرق.",
              "الأول سعر الخدمة.",
              "الثاني عدد المكالمات.",
            ],
            optionsEn: [
              "The first is time to first reply; the second is time to final resolution.",
              "There is no difference.",
              "The first is the service price.",
              "The second is the number of calls.",
            ],
            answerIndex: 0,
            explainAr: "التفريق مهم في قياس جودة الدعم.",
            explainEn: "The distinction matters in measuring support quality.",
            wordId: "resolution-time",
          },
          {
            id: "jf10-q3",
            promptAr: "لماذا نوثّق المخاطر عند إدارة مشكلة؟",
            promptEn: "Why do we document risks when managing an issue?",
            optionsAr: [
              "لا سبب.",
              "لتوقّع الأثر على مهام أخرى وخطط المعالجة.",
              "لسدّ النموذج.",
              "لتقليل الجهد.",
            ],
            optionsEn: [
              "No reason.",
              "To anticipate the impact on other tasks and plan mitigation.",
              "To fill the form.",
              "To reduce effort.",
            ],
            answerIndex: 1,
            explainAr: "توثيق المخاطر يحمي المشروع من مفاجآت لاحقة.",
            explainEn: "Documenting risks protects the project from later surprises.",
            wordId: "risk",
          },
          {
            id: "jf10-q4",
            promptAr: "ما المقصود بـ incident؟",
            promptEn: "What does incident mean?",
            optionsAr: [
              "خطة تدريب.",
              "تقرير ربحية.",
              "حدث غير متوقع يعطّل أو يهدّد الخدمة.",
              "طلب ميزة جديدة.",
            ],
            optionsEn: [
              "A training plan.",
              "A profitability report.",
              "An unexpected event that disrupts or threatens the service.",
              "A request for a new feature.",
            ],
            answerIndex: 2,
            explainAr: "الحادثة غير مخطّطة، وتختلف عن طلب التحسين.",
            explainEn: "An incident is unplanned, unlike an improvement request.",
            wordId: "incident",
          },
          {
            id: "jf10-q5",
            promptAr: "أي ممارسة تحافظ على ثقة العميل أثناء مشكلة طويلة؟",
            promptEn: "Which practice keeps the client's trust during a long issue?",
            optionsAr: [
              "الصمت حتى الحل الكامل.",
              "الردّ بعد انتهاء اليوم.",
              "نقل المسؤولية للآخرين.",
              "تحديث العميل دوريًا حتى لو لم يُحلّ بعد.",
            ],
            optionsEn: [
              "Silence until full resolution.",
              "Replying after the end of the day.",
              "Passing the responsibility to others.",
              "Updating the client regularly even before it is resolved.",
            ],
            answerIndex: 3,
            explainAr: "التواصل المستمر أهم من الصمت الطويل.",
            explainEn: "Continuous communication matters more than long silence.",
          },
        ],
      },

      // ───────────────── 11) تنفيذ اختبار قبول المستخدم ─────────────────
      {
        id: "job-fc-11-performing-user-acceptance-testing",
        slug: "performing-user-acceptance-testing",
        order: 11,
        icon: "✅",
        titleAr: "تنفيذ اختبار قبول المستخدم",
        titleEn: "Performing User Acceptance Testing",
        level: "B2",
        scenarioAr:
          "قبل التشغيل النهائي، يجب أن يتأكد العميل أن النظام ينفّذ المتطلبات المتفق عليها. تقود جلسة اختبار قبول: تعريف النطاق، تنفيذ حالات الاختبار، توثيق النتائج، والفصل بين الخلل والعطل وبين طلب التغيير.",
        scenarioEn:
          "Before final go-live the client must confirm the system meets the agreed requirements. You lead a UAT session: define the scope, run the test cases, record the results, and separate a defect from a change request.",
        objectivesAr: [
          "تعريف نطاق اختبار القبول ومعاييره.",
          "تنفيذ حالات الاختبار وتوثيق النتائج.",
          "التمييز بين الخلل وطلب التغيير.",
          "إعداد تقرير النتائج والموافقة النهائية.",
        ],
        objectivesEn: [
          "Define the UAT scope and its criteria.",
          "Run the test cases and record the results.",
          "Distinguish a defect from a change request.",
          "Prepare the results report and final sign-off.",
        ],
        refs: {
          processIds: ["o2c"],
          subModuleIds: ["it-testing", "administration-approvals", "bi-kpis"],
          wordIds: ["uat", "change-request", "approval", "risk", "milestone", "go-live", "stakeholder", "escalation-matrix"],
          screenIds: ["stt-approved", "stt-pending-approval"],
          meetingLessonSlugs: ["summarizing-minutes", "problems-action-items"],
        },
        practice: {
          mcqs: [
            {
              id: "jf11-mcq1",
              promptAr: "ما الهدف الأساسي من UAT؟",
              promptEn: "What is the main purpose of UAT?",
              optionsAr: [
                "تأكيد أن النظام يطابق احتياجات العمل المتفق عليها.",
                "قياس سرعة الإنترنت.",
                "تدريب الفريق الفني.",
                "تغيير الألوان.",
              ],
              optionsEn: [
                "To confirm the system matches the agreed business needs.",
                "To measure the internet speed.",
                "To train the technical team.",
                "To change the colours.",
              ],
              answerIndex: 0,
              explainAr: "UAT يقيس مطابقة النظام لاحتياج العمل لا للتقنية وحدها.",
              explainEn: "UAT measures fit with the business need, not technology alone.",
              wordId: "uat",
            },
            {
              id: "jf11-mcq2",
              promptAr: "ما الفرق بين defect و change request؟",
              promptEn: "What is the difference between a defect and a change request?",
              optionsAr: [
                "طلب التغيير خطأ برمجي.",
                "الخلل مخالفة لما اتُّفق عليه، وطلب التغيير إضافة أو تعديل جديد.",
                "لا فرق.",
                "الخلل بعد التشغيل فقط.",
              ],
              optionsEn: [
                "A change request is a programming error.",
                "A defect is a deviation from what was agreed; a change request is a new addition or change.",
                "There is no difference.",
                "A defect exists only after go-live.",
              ],
              answerIndex: 1,
              explainAr: "الفصل مهم لأنه يحدّد المسؤولية والتكلفة والجدول.",
              explainEn: "The separation matters because it determines responsibility, cost and schedule.",
              wordId: "change-request",
            },
          ],
          responses: [
            {
              id: "jf11-rs1",
              situationAr: "يكتشف العميل خلال UAT سلوكًا لم يُذكر في الوثيقة. ما أفضل رد؟",
              situationEn: "During UAT the client finds a behaviour that was not in the document. What is the best reply?",
              optionsAr: [
                "إنه يعمل كما صُمّم، فلا شيء نفعله.",
                "هذا لم يكن ضمن النطاق المتفق عليه — سأسجّله كطلب تغيير ونقيّم أثره.",
                "إنه خلل، وسنصلحه الآن.",
                "لا بدّ أنك أغفلته.",
              ],
              optionsEn: [
                "That's a bug, we'll fix it now.",
                "You must have missed it.",
                "It works as designed, so nothing to do.",
                "That wasn't in the agreed scope — I'll log it as a change request and we'll assess the impact.",
              ],
              answerIndex: 3,
              explainAr: "تصنيف ما هو خارج النطاق كطلب تغيير يحمي النطاق والجدول.",
              explainEn: "Classifying out-of-scope items as change requests protects scope and schedule.",
            },
          ],
          order: [
            { id: "jf11-o1", labelAr: "تعريف نطاق اختبار القبول ومعاييره", labelEn: "Define the UAT scope and criteria" },
            { id: "jf11-o2", labelAr: "تحضير حالات الاختبار والبيانات", labelEn: "Prepare the test cases and data" },
            { id: "jf11-o3", labelAr: "تنفيذ الحالات مع المستخدم", labelEn: "Run the cases with the user" },
            { id: "jf11-o4", labelAr: "توثيق النتائج والخلل", labelEn: "Record the results and defects" },
            { id: "jf11-o5", labelAr: "إعداد التقرير والموافقة النهائية", labelEn: "Prepare the report and final sign-off" },
          ],
          phrases: [
            {
              id: "jf11-p1",
              en: "Let's run this test case against the agreed criteria and record the result.",
              ar: "لننفّذ حالة الاختبار هذه وفق المعايير المتفق عليها ونوثّق النتيجة.",
              tipAr: "اربط الحالة بالمعيار لتفادي الجدل.",
              tipEn: "Link the case to the criterion to avoid disputes.",
            },
            {
              id: "jf11-p2",
              en: "This works as agreed. If you'd like it different, that's a change request.",
              ar: "هذا يعمل كما اتُّفق عليه. وإن أردت تغييره فهذا طلب تغيير.",
              tipAr: "نبرة محترمة تحفظ العلاقة وتوضّح الحدود.",
              tipEn: "A respectful tone keeps the relationship and sets the boundary.",
            },
          ],
        },
        quiz: [
          {
            id: "jf11-q1",
            promptAr: "ما هي حالة الاختبار (test case) في UAT؟",
            promptEn: "What is a test case in UAT?",
            optionsAr: [
              "خطوة أو سيناريو محدّد نتحقّق به من متطلب متفق عليه.",
              "تقرير عن سرعة النظام.",
              "قائمة بأسماء المختبرين.",
              "نسخة احتياطية من البيانات.",
            ],
            optionsEn: [
              "A specific step or scenario that verifies an agreed requirement.",
              "A report on system speed.",
              "A list of the testers' names.",
              "A backup of the data.",
            ],
            answerIndex: 0,
            explainAr: "حالة الاختبار تربط كل تحقّق بمتطلب متفق عليه بوضوح.",
            explainEn: "A test case ties each verification to a clearly agreed requirement.",
          },
          {
            id: "jf11-q2",
            promptAr: "ما الفرق بين النتيجة المتوقعة (expected result) والنتيجة الفعلية (actual result)؟",
            promptEn: "What is the difference between the expected result and the actual result?",
            optionsAr: [
              "النتيجة المتوقعة رأي المستخدم فقط.",
              "لا فرق بينهما.",
              "كلاهما يوثّق بعد التشغيل فقط.",
              "النتيجة الفعلية هي ما رأيناه عند التنفيذ، والمتوقعة هي ما اتُّفق عليه مسبقًا.",
            ],
            optionsEn: [
              "The expected result is only the user's opinion.",
              "There is no difference.",
              "Both are recorded only after go-live.",
              "The actual result is what we observed when running the case; the expected result is what was agreed beforehand.",
            ],
            answerIndex: 1,
            explainAr: "الفارق بينهما هو ما يكشف الخلل ويثبت القبول.",
            explainEn: "The gap between them is what reveals a defect and proves acceptance.",
          },
          {
            id: "jf11-q3",
            promptAr: "ما معنى الخلل (defect) في UAT؟",
            promptEn: "What does a defect mean in UAT?",
            optionsAr: [
              "طلب تحسين من العميل.",
              "خطأ في اختيار المختبرين.",
              "إضافة جديدة لم تكن في النطاق.",
              "مخالفة لما اتُّفق عليه في المتطلبات.",
            ],
            optionsEn: [
              "An improvement request from the client.",
              "A mistake in choosing the testers.",
              "A new addition that was not in scope.",
              "A deviation from what was agreed in the requirements.",
            ],
            answerIndex: 2,
            explainAr: "الخلل خروج عن المتطلب المتفق عليه؛ أما الإضافة الجديدة فهي طلب تغيير.",
            explainEn: "A defect departs from an agreed requirement; a new addition is instead a change request.",
            wordId: "change-request",
          },
          {
            id: "jf11-q4",
            promptAr: "ما الغرض من معايير القبول (acceptance criteria)؟",
            promptEn: "What is the purpose of acceptance criteria?",
            optionsAr: [
              "حذف البيانات القديمة.",
              "تحديد الشروط الواضحة التي يُعدّ النظام عندها مقبولًا.",
              "قياس سرعة الطباعة.",
              "تغيير واجهة النظام.",
            ],
            optionsEn: [
              "To delete old data.",
              "To define the clear conditions under which the system is accepted.",
              "To measure printing speed.",
              "To change the system interface.",
            ],
            answerIndex: 3,
            explainAr: "معايير القبول تحوّل «مقبول» من انطباع إلى شرط قابل للتحقّق.",
            explainEn: "Acceptance criteria turn “accepted” from an impression into a verifiable condition.",
          },
          {
            id: "jf11-q5",
            promptAr: "ما المقصود بالموافقة النهائية (sign-off) في نهاية UAT؟",
            promptEn: "What does the final sign-off mean at the end of UAT?",
            optionsAr: [
              "تأجيل القرار للاجتماع القادم.",
              "موافقة رسمية من العميل بأن المتطلبات المتفق عليها تحقّقت.",
              "طلب تمديد الجدول الزمني.",
              "إعادة كتابة المتطلبات من البداية.",
            ],
            optionsEn: [
              "Postponing the decision to the next meeting.",
              "Formal client approval that the agreed requirements have been met.",
              "A request to extend the timeline.",
              "Rewriting the requirements from scratch.",
            ],
            answerIndex: 0,
            explainAr: "التوقيع النهائي يثبّت نتيجة القبول ويفتح الطريق للتشغيل.",
            explainEn: "Sign-off fixes the acceptance outcome and opens the way to go-live.",
            wordId: "approval",
          },
        ],
      },

      // ───────────────── 12) التحضير للتشغيل النهائي ─────────────────
      {
        id: "job-fc-12-preparing-for-go-live",
        slug: "preparing-for-go-live",
        order: 12,
        icon: "🚀",
        titleAr: "التحضير للتشغيل النهائي",
        titleEn: "Preparing for Go-Live",
        level: "B2",
        scenarioAr:
          "اقترب موعد التشغيل. عليك أن تُجهّز خطة الانتقال: نقل البيانات، التدريب، الدعم بعد التشغيل، وخطة التعامل مع التوقّف المفاجئ، ثم تؤكّد الجاهزية مع العميل وتغلق المشروع رسميًا.",
        scenarioEn:
          "Go-live is close. You must prepare the cutover plan: data migration, training, post go-live support and the contingency for unexpected downtime — then confirm readiness with the client and formally close the project.",
        objectivesAr: [
          "إعداد خطة الانتقال وما قبل/بعد التشغيل.",
          "تأكيد جاهزية البيانات والتدريب والدعم.",
          "تحضير خطة التعامل مع التوقّف.",
          "تأكيد الجاهزية مع العميل وإغلاق المشروع.",
        ],
        objectivesEn: [
          "Prepare the cutover plan, pre- and post go-live.",
          "Confirm readiness of data, training and support.",
          "Prepare the downtime contingency plan.",
          "Confirm readiness with the client and close the project.",
        ],
        refs: {
          processIds: ["r2r", "p2p"],
          subModuleIds: ["it-deployment", "administration-import-export", "documents-retention", "management-governance"],
          wordIds: ["go-live", "cutover", "rollout", "migration", "downtime", "uptime", "deployment", "integration", "milestone", "risk"],
          emailLessonSlugs: ["production-delay-notification", "meeting-invitation-follow-up"],
          meetingLessonSlugs: ["giving-erp-project-updates", "summarizing-minutes"],
        },
        practice: {
          mcqs: [
            {
              id: "jf12-mcq1",
              promptAr: "ما عناصر خطة الانتقال (cutover plan) الأساسية؟",
              promptEn: "What are the key elements of a cutover plan?",
              optionsAr: [
                "أسماء المختبرين فقط.",
                "لا شيء.",
                "الجدول الزمني، نقل البيانات، المسؤوليات، وخطة العودة للخلف.",
                "الألوان والخطوط.",
              ],
              optionsEn: [
                "Only the testers' names.",
                "Nothing.",
                "The timeline, data migration, responsibilities and the rollback plan.",
                "Colours and fonts.",
              ],
              answerIndex: 2,
              explainAr: "الخطة تشمل ماذا ومتى ومن وما البديل عند الفشل.",
              explainEn: "The plan covers what, when, who and the fallback if it fails.",
              wordId: "cutover",
            },
            {
              id: "jf12-mcq2",
              promptAr: "لماذا نعدّ خطة تعامل مع التوقّف (downtime)؟",
              promptEn: "Why do we prepare a downtime contingency plan?",
              optionsAr: [
                "لزيادة مدة التوقف.",
                "لأن العميل طلب ذلك شكليًا.",
                "لا سبب.",
                "لتقليل أثر انقطاع الخدمة على الإنتاج.",
              ],
              optionsEn: [
                "To increase the downtime.",
                "Because the client formally asked.",
                "No reason.",
                "To reduce the impact of an outage on operations.",
              ],
              answerIndex: 3,
              explainAr: "الاستعداد للتوقف يحمي الإنتاج ويحدّ من الخسارة.",
              explainEn: "Downtime readiness protects operations and limits losses.",
              wordId: "downtime",
            },
          ],
          responses: [
            {
              id: "jf12-rs1",
              situationAr: "يسأل العميل يوم التشغيل: «هل نحن جاهزون؟» ما أفضل رد؟",
              situationEn: "On go-live day the client asks: “Are we ready?” What is the best reply?",
              optionsAr: [
                "هذا يعتمد عليكم.",
                "سنرى.",
                "نعم — البيانات والتدريب والدعم مؤكّدة، ولدينا خطة تراجع إذا لزم الأمر.",
                "أعتقد ذلك.",
              ],
              optionsEn: [
                "Yes — data, training and support are confirmed, and we have a rollback plan if needed.",
                "I think so.",
                "That depends on you.",
                "We'll see.",
              ],
              answerIndex: 0,
              explainAr: "تأكيد الجاهزية بالأدلة يبني الثقة في اللحظة الحرجة.",
              explainEn: "Confirming readiness with evidence builds trust at the critical moment.",
            },
          ],
          order: [
            { id: "jf12-o1", labelAr: "إعداد خطة الانتقال والجدول الزمني", labelEn: "Prepare the cutover plan and timeline" },
            { id: "jf12-o2", labelAr: "تنفيذ نقل البيانات ومطابقتها", labelEn: "Run data migration and reconciliation" },
            { id: "jf12-o3", labelAr: "تأكيد التدريب والدعم بعد التشغيل", labelEn: "Confirm training and post go-live support" },
            { id: "jf12-o4", labelAr: "تفعيل خطة التعامل مع التوقّف", labelEn: "Activate the downtime contingency plan" },
            { id: "jf12-o5", labelAr: "تأكيد الجاهزية مع العميل وإغلاق المشروع", labelEn: "Confirm readiness with the client and close the project" },
          ],
          phrases: [
            {
              id: "jf12-p1",
              en: "The cutover plan is confirmed for Friday; we'll have a rollback plan ready just in case.",
              ar: "خطة الانتقال مؤكّدة يوم الجمعة، وسنكون جاهزين بخطة عودة للخلف تحسّبًا لأي طارئ.",
              tipAr: "أكّد على «rollback plan» لطمأنة العميل.",
              tipEn: "Stress “rollback plan” to reassure the client.",
            },
            {
              id: "jf12-p2",
              en: "We'll be on standby for the first two days to support you after go-live.",
              ar: "سنكون في حالة استعداد خلال أول يومين لدعمكم بعد التشغيل.",
              tipAr: "«on standby» تعني جاهزية للتدخّل الفوري.",
              tipEn: "“On standby” means ready for immediate action.",
            },
          ],
        },
        quiz: [
          {
            id: "jf12-q1",
            promptAr: "ما المقصود بـ migration في المشروع؟",
            promptEn: "What does migration mean in a project?",
            optionsAr: [
              "عمل نسخة احتياطية فقط.",
              "نقل البيانات أو الأنظمة إلى البيئة الجديدة.",
              "حذف البيانات القديمة.",
              "ترقية الأجهزة فقط.",
            ],
            optionsEn: [
              "Only backing up.",
              "Moving data or systems to the new environment.",
              "Deleting the old data.",
              "Upgrading the hardware only.",
            ],
            answerIndex: 1,
            explainAr: "الهجرة نقل منظم وليست حذفًا.",
            explainEn: "Migration is an organised move, not a deletion.",
            wordId: "migration",
          },
          {
            id: "jf12-q2",
            promptAr: "ما الهدف من خطة العودة للخلف (rollback plan)؟",
            promptEn: "What is the goal of a rollback plan?",
            optionsAr: [
              "تقليل عدد المستخدمين.",
              "إلغاء المشروع.",
              "الرجوع إلى الوضع السابق بأمان عند فشل التشغيل.",
              "تسريع التشغيل.",
            ],
            optionsEn: [
              "To reduce the number of users.",
              "To cancel the project.",
              "To return safely to the previous state if go-live fails.",
              "To speed up go-live.",
            ],
            answerIndex: 2,
            explainAr: "خطة العودة تحوّل الفشل المحتمل من كارثة إلى إجراء.",
            explainEn: "A rollback turns a possible failure from a disaster into a procedure.",
          },
          {
            id: "jf12-q3",
            promptAr: "ما الدليل على نجاح التشغيل في الأسبوع الأول؟",
            promptEn: "What shows a successful go-live in the first week?",
            optionsAr: [
              "عدد رسائل البريد فقط.",
              "طول الاجتماعات.",
              "عدد الشاشات الجديدة.",
              "استقرار العمل وقلة البلاغات الحرجة واستمرار الأعمال اليومية.",
            ],
            optionsEn: [
              "Only the number of emails.",
              "The length of the meetings.",
              "The number of new screens.",
              "Stable operations, few critical tickets and business continuing normally.",
            ],
            answerIndex: 3,
            explainAr: "المقياس الأول هو استمرار العمل بالمعدل المعتاد.",
            explainEn: "The first measure is that work continues at the normal rate.",
            wordId: "go-live",
          },
          {
            id: "jf12-q4",
            promptAr: "لماذا نحدّد معالم (milestones) في خطة التشغيل؟",
            promptEn: "Why define milestones in the go-live plan?",
            optionsAr: [
              "لتتبّع التقدّم والتحقّق من الجاهزية عند كل مرحلة.",
              "لتزيين التقرير.",
              "لإطالة الجدول.",
              "لا سبب.",
            ],
            optionsEn: [
              "To track progress and verify readiness at each stage.",
              "To decorate the report.",
              "To lengthen the schedule.",
              "No reason.",
            ],
            answerIndex: 0,
            explainAr: "المعالم تقسّم العبء إلى نقاط تحقّق واضحة.",
            explainEn: "Milestones break the load into clear checkpoints.",
            wordId: "milestone",
          },
          {
            id: "jf12-q5",
            promptAr: "بعد التشغيل الناجح، ما الخطوة الأخيرة في إدارة المشروع؟",
            promptEn: "After a successful go-live, what is the final project-management step?",
            optionsAr: [
              "حذف الوثائق.",
              "تسليم نهائي وإغلاق رسمي مع توثيق الدروس المستفادة.",
              "بدء مشروع جديد فورًا.",
              "إيقاف كل الدعم.",
            ],
            optionsEn: [
              "Delete the documents.",
              "A final handover and formal closure with documented lessons learned.",
              "Start a new project immediately.",
              "Stop all support.",
            ],
            answerIndex: 1,
            explainAr: "الإغلاق الرسمي يحفظ المعرفة ويمنع الفوضى بعد التسليم.",
            explainEn: "Formal closure preserves knowledge and avoids chaos after handover.",
          },
        ],
      },
    ],
    assessment: {
      quiz: [
        {
          id: "jf-assess-q1",
          promptAr: "ما أول خطوة عند بدء التعامل مع عمل العميل؟",
          promptEn: "What is the first step when starting to work with the client's business?",
          optionsAr: [
            "تركيب النظام فورًا.",
            "إرسال الفاتورة.",
            "تدريب المستخدمين.",
            "فهم دورة العمل وأصحاب المصلحة قبل اقتراح أي حل.",
          ],
          optionsEn: [
            "Installing the system immediately.",
            "Sending the invoice.",
            "Training the users.",
            "Understanding the business cycle and stakeholders before proposing any solution.",
          ],
          answerIndex: 3,
          explainAr: "الفهم قبل الحل أساس عمل الاستشاري.",
          explainEn: "Understanding before the solution is the consultant's foundation.",
          wordId: "stakeholder",
        },
        {
          id: "jf-assess-q2",
          promptAr: "ما الغرض من جمع المتطلبات قبل التصميم؟",
          promptEn: "Why gather requirements before design?",
          optionsAr: [
            "لتحديد ما يحتاجه العمل فعلًا ومطابقته بالحل المناسب.",
            "لتصعيب المشروع.",
            "لإطالة الجدول فقط.",
            "لأن العميل يحب الاستبيانات.",
          ],
          optionsEn: [
            "To identify what the business truly needs and map it to the right solution.",
            "To make the project harder.",
            "Only to lengthen the schedule.",
            "Because the client likes surveys.",
          ],
          answerIndex: 0,
          explainAr: "المتطلبات تربط احتياج العمل بالحل الصحيح.",
          explainEn: "Requirements link the business need to the correct solution.",
        },
        {
          id: "jf-assess-q3",
          promptAr: "ما الذي يجعل تدريب المستخدم فعّالًا في مشروع ERP؟",
          promptEn: "What makes user training effective in an ERP project?",
          optionsAr: [
            "تأجيل التدريب إلى ما بعد التشغيل.",
            "الاكتفاء بإرسال دليل مكتوب.",
            "تدريب المستخدم على مهامه اليومية داخل النظام بسيناريوهات من عمله.",
            "شرح الكود البرمجي للمستخدمين.",
          ],
          optionsEn: [
            "Postponing training until after go-live.",
            "Only sending a written guide.",
            "Training the user on their daily tasks in the system with scenarios from their work.",
            "Explaining the source code to the users.",
          ],
          answerIndex: 2,
          explainAr: "التدريب الفعّال يربط الوظيفة بمهام المستخدم اليومية لا بالنظرية.",
          explainEn: "Effective training ties the function to the user's daily tasks, not to theory.",
        },
        {
          id: "jf-assess-q4",
          promptAr: "ما المقصود بوصف العملية الحالية (as-is) في تحليل العمليات؟",
          promptEn: "What does describing a process as-is mean in process analysis?",
          optionsAr: [
            "حذف الخطوات الزائدة فورًا.",
            "قائمة بأسماء الموظفين.",
            "وصف الوضع الحالي كما هو قبل أي تحسين.",
            "التصميم المستهدف بعد التحسين.",
          ],
          optionsEn: [
            "Deleting redundant steps immediately.",
            "A list of the employees' names.",
            "Describing the current state exactly as it is, before any improvement.",
            "The target design after improvement.",
          ],
          answerIndex: 2,
          explainAr: "نفهم الحالي (as-is) أولًا ثم نصمّم المستهدف (to-be).",
          explainEn: "We understand the current (as-is) first, then design the target (to-be).",
          wordId: "workflow",
        },
        {
          id: "jf-assess-q5",
          promptAr: "ما المقصود بالفجوة (gap) في تحليل العملية؟",
          promptEn: "What is meant by a gap in process analysis?",
          optionsAr: [
            "نقص في عدد الفريق.",
            "الفرق بين ما يحدث الآن وما ينبغي أن يحدث بالحل.",
            "خطأ برمجي.",
            "مشكلة في الشبكة.",
          ],
          optionsEn: [
            "A shortage in the team size.",
            "The difference between what happens now and what should happen with the solution.",
            "A programming error.",
            "A network problem.",
          ],
          answerIndex: 1,
          explainAr: "الفجوة تقود إلى قرار: قياسي أم تخصيص.",
          explainEn: "The gap drives a decision: standard or customization.",
          wordId: "customization",
        },
        {
          id: "jf-assess-q6",
          promptAr: "كيف تشرح قرارًا وظيفيًا لصاحب مصلحة غير تقني؟",
          promptEn: "How do you explain a functional decision to a non-technical stakeholder?",
          optionsAr: [
            "تجنّب الشرح.",
            "اذكر أسماء الجداول البرمجية.",
            "أرسل كودًا فقط.",
            "اربط القرار بأثره على العمل اليومي بلغة بسيطة.",
          ],
          optionsEn: [
            "Avoid the explanation.",
            "Name the database tables.",
            "Send only code.",
            "Link the decision to its effect on daily work in simple language.",
          ],
          answerIndex: 3,
          explainAr: "الأثر على العمل أوضح لصاحب المصلحة من التفاصيل البرمجية.",
          explainEn: "Business impact is clearer to the stakeholder than technical detail.",
          wordId: "stakeholder",
        },
        {
          id: "jf-assess-q7",
          promptAr: "ما الهدف من ضبط إعدادات الوحدة (module configuration)؟",
          promptEn: "What is the goal of module configuration?",
          optionsAr: [
            "إخفاء التقارير.",
            "تغيير شعار الشركة.",
            "ملاءمة وظائف الوحدة القياسية لعمليات العميل دون تعديل برمجي.",
            "زيادة عدد الشاشات.",
          ],
          optionsEn: [
            "Hiding the reports.",
            "Changing the company logo.",
            "Tailoring the module's standard functions to the client's processes without code changes.",
            "Increasing the number of screens.",
          ],
          answerIndex: 2,
          explainAr: "الضبط يبحث عن أقرب حل قياسي قبل أي تخصيص.",
          explainEn: "Configuration looks for the closest standard solution before any customization.",
        },
        {
          id: "jf-assess-q8",
          promptAr: "ما أفضل محتوى لتوثيق وظيفي واضح؟",
          promptEn: "What is the best content for clear functional documentation?",
          optionsAr: [
            "وصف العملية والقرار والأثر والخطوة التالية.",
            "مقتطفات من محادثات داخلية.",
            "شعار الشركة وألوانها.",
            "قائمة بأسماء الحاضرين فقط.",
          ],
          optionsEn: [
            "A description of the process, the decision, the impact and the next step.",
            "Excerpts from internal chats.",
            "The company logo and colours.",
            "A list of attendees only.",
          ],
          answerIndex: 0,
          explainAr: "التوثيق الوظيفي يخدم القرار والمتابعة، لا الشكل.",
          explainEn: "Functional documentation serves the decision and follow-up, not appearance.",
        },
      ],
      responses: [
        {
          id: "jf-assess-rs1",
          situationAr: "يسألك العميل: «هل يمكن اختصار التدريب أسبوعًا؟» ما أفضل رد؟",
          situationEn: "The client asks: “Can we shorten the training by a week?” What is the best reply?",
          optionsAr: [
            "يمكننا ذلك، لكنه سيؤثّر على جاهزية المستخدمين — لنراجع الأثر ونتفق على خطة آمنة.",
            "بالتأكيد، لا مشكلة.",
            "لا، غير ممكن.",
            "القرار قراركم وحدهم.",
          ],
          optionsEn: [
            "We can, but it would affect user readiness — let's review the impact and agree on a safe plan.",
            "Sure, no problem.",
            "No, impossible.",
            "It's your decision alone.",
          ],
          answerIndex: 0,
          explainAr: "الردّ المتوازن يوضّح الأثر ويحفظ العلاقة بدل الرفض أو القبول المطلق.",
          explainEn: "A balanced reply explains the impact and keeps the relationship instead of a flat yes or no.",
        },
        {
          id: "jf-assess-rs2",
          situationAr: "تظهر مشكلة حرجة صباح يوم التشغيل. ما أفضل تصرّف؟",
          situationEn: "A critical issue appears on the morning of go-live. What is the best action?",
          optionsAr: [
            "إلقاء اللوم على الفريق.",
            "تفعيل خطة الطوارئ وإبلاغ أصحاب المصلحة بالتحديثات فورًا.",
            "الانتظار حتى الظهيرة.",
            "إخفاء المشكلة.",
          ],
          optionsEn: [
            "Blame the team.",
            "Activate the contingency plan and update the stakeholders immediately.",
            "Wait until noon.",
            "Hide the issue.",
          ],
          answerIndex: 1,
          explainAr: "الاستجابة السريعة والتواصل يقلّلان الأثر ويحفظان الثقة.",
          explainEn: "Fast response and communication reduce impact and preserve trust.",
        },
      ],
      speaking: [
        {
          id: "jf-assess-sp1",
          en: "Let me recap what we agreed today before we move on.",
          ar: "دعني ألخّص ما اتّفقنا عليه اليوم قبل أن نكمل.",
          tipAr: "استخدم «Let me recap» لتنظيم نهاية الاجتماع.",
          tipEn: "Use “Let me recap” to organise the end of the meeting.",
        },
        {
          id: "jf-assess-sp2",
          en: "Based on the analysis, I'd recommend the standard configuration rather than a customization.",
          ar: "بناءً على التحليل، أوصي بالإعداد القياسي بدلًا من التخصيص.",
          tipAr: "«I'd recommend» تجعل التوصية مهنية وغير مفروضة.",
          tipEn: "“I'd recommend” makes the advice professional and non-imposing.",
        },
        {
          id: "jf-assess-sp3",
          en: "We'll be on standby after go-live to make sure everything runs smoothly.",
          ar: "سنكون في حالة استعداد بعد التشغيل للتأكد من سير كل شيء بسلاسة.",
          tipAr: "عبارة مطمئنة تُنهي المشروع بثقة.",
          tipEn: "A reassuring phrase to close the project with confidence.",
        },
      ],
    },
  },
];

// Phase 06: مسار محاسب ERP يُضاف بجانب المسار التجريبي (استشاري ERP الوظيفي).
// الترتيب ثابت: الاستشاري أولًا ثم المحاسب.
// Phase 07: مسار أخصائي المشتريات يُضاف ثالثًا بحالة "planned" (يُفعّل في مرحلة
// الجاهزية لاحقًا)، ويبقى مخفيًا عن الواجهة عبر READY_JOB_PATHS.
export const JOB_PATHS: JobPath[] = [...pilotPaths, erpAccountantPath, procurementSpecialistPath];

// قرار الإتاحة (Phase 05.5 / 05.6): تُعرض المسارات ذات الحالة "ready" فقط في الواجهة
// (الصفحة الرئيسية وصفحة المسارات) عبر READY_JOB_PATHS. تبقى المسارات "planned"
// مخفية حتى يكتمل محتواها، ولا تُضاف مسارات عنصرية (placeholders) في هذه المرحلة.
// الهدف: عدم عرض أي محتوى غير مكتمل للمستخدم، مع إبقاء البنية جاهزة لتعدد المسارات.
export const JOB_PATH_SLUGS: string[] = JOB_PATHS.map((p) => p.slug);
export const READY_JOB_PATHS: JobPath[] = JOB_PATHS.filter((p) => p.status === "ready");

export function jobPathBySlug(slug: string): JobPath | undefined {
  return JOB_PATHS.find((p) => p.slug === slug);
}

// حاجز الجاهزية (Phase 07.4.2): يُستخدم في صفحات المسار على الخادم للسماح بالوصول
// للمسارات ذات الحالة "ready" فقط، ورفض المسارات "planned" والمجالات غير المعروفة
// عبر notFound(). يبقى jobPathBySlug() متاحًا للبيانات والاختبارات الداخلية.
export function readyJobPathBySlug(slug: string): JobPath | undefined {
  const path = jobPathBySlug(slug);
  return path && path.status === "ready" ? path : undefined;
}

export function jobLessonSlugs(job: JobPath): string[] {
  return job.lessons.map((l) => l.slug);
}

export function jobLessonBySlug(job: JobPath, slug: string): JobLesson | undefined {
  return job.lessons.find((l) => l.slug === slug);
}
