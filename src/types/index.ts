// وحدات نظام ERP (Phase 01) + الفئات العابرة (Cross-functional) المحفوظة للتوافق.
export type ModuleId =
  // ── وحدات ERP الأساسية ──
  | "finance"
  | "sales"
  | "purchasing"
  | "inventory"
  | "warehouse"
  | "manufacturing"
  | "quality"
  | "maintenance"
  | "hr"
  | "payroll"
  | "crm"
  | "projects"
  | "assets"
  | "scm"
  | "planning"
  | "plm"
  | "pos"
  | "ecommerce"
  | "services"
  | "bi"
  | "administration"
  | "documents"
  // ── فئات عابرة للوظائف (تبقى للتوافق الخلفي) ──
  | "management"
  | "communication"
  | "it"
  | "general";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

// نوع المصطلح داخل شاشات ووحدات ERP.
export type VocabularyCategory =
  | "term"
  | "screen"
  | "field"
  | "button"
  | "menu"
  | "document"
  | "status"
  | "action"
  | "report"
  | "error"
  | "abbreviation";

// حالة اكتمال المحتوى (حالة النشر — لا تتغيّر دلالتها).
export type ContentStatus = "draft" | "reviewed" | "published";

// حالة مراجعة التصنيف (منفصلة عن حالة النشر):
// "reviewed" = تصنيف يدوي/صريح مُراجَع، "auto" = تصنيف آلي (rules/tags/default).
export type ContentReviewStatus = "reviewed" | "auto";

export interface Word {
  id: string;
  english: string;
  arabic: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definitionEn?: string;
  definitionAr?: string;
  note?: string;
  // الوحدة (يُعادلها moduleId في التذكرة — أُبقي الاسم للتوافق الخلفي).
  module: ModuleId;
  // الوحدة الفرعية داخل الوحدة (مثال: finance/gl).
  subModuleId?: string;
  // الوظيفة التجارية داخل الوحدة الفرعية (اختياري، قابل للتوسّع في مراحل لاحقة).
  businessFunctionId?: string;
  // نوع المصطلح (حقل/زر/حالة/مستند…).
  category?: VocabularyCategory;
  level: Level;
  examples: string[];
  examplesAr?: string[];
  synonyms?: string[];
  antonyms?: string[];
  tags?: string[];
  // علاقات المحتوى (معرّفات مصطلحات/مستندات/وحدات مرتبطة).
  relatedTermIds?: string[];
  relatedDocumentIds?: string[];
  relatedModuleIds?: ModuleId[];
  // إدارة المحتوى.
  status?: ContentStatus;
  // مراجعة التصنيف (منفصلة تمامًا عن status).
  reviewStatus?: ContentReviewStatus;
  source?: string;
  lastReviewedAt?: number;
  // حقول محجوزة لتوسعة إدارة المحتوى لاحقًا (تحرير/اعتماد/تسجيل المراجع وتاريخه).
  // لا منطق مرتبط بها حاليًا — وُضعت لتفادي أي ترحيل مستقبلي.
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: number;
}

export interface ModuleMeta {
  id: ModuleId;
  labelAr: string;
  labelEn: string;
  icon: string;
  color: string;
  // "erp" وحدة نظام، "category" فئة عابرة للوظائف.
  kind?: "erp" | "category";
  descAr?: string;
  descEn?: string;
}

// وحدة فرعية داخل وحدة ERP.
export interface SubModuleMeta {
  id: string;
  moduleId: ModuleId;
  labelAr: string;
  labelEn: string;
  icon?: string;
  descAr?: string;
  descEn?: string;
}

// وظيفة تجارية داخل وحدة فرعية (المستوى القابل للتوسّع لاحقًا).
export interface BusinessFunctionDef {
  id: string;
  subModuleId: string;
  moduleId: ModuleId;
  labelAr: string;
  labelEn: string;
}

export type Rating = "again" | "hard" | "good" | "easy";

export interface WordProgress {
  wordId: string;
  ease: number;
  interval: number;
  due: number;
  reps: number;
  lapses: number;
  lastReviewed?: number;
  correctCount: number;
  wrongCount: number;
}

export interface AppStats {
  reviews: number;
  correct: number;
  wrong: number;
  streak: number;
  lastStudyDay?: string;
  history: { day: string; count: number }[];
  freezes: number;
  frozenDays: string[];
}

export interface DailyResult {
  score: number;
  total: number;
}

export interface GameRecord {
  plays: number;
  best: number;
  lastAt: number;
}

export interface LessonRecord {
  day: string;
  wordIds: string[];
  viewed: string[];
  quizScore?: number;
  quizTotal?: number;
  done: boolean;
  startedAt: number;
}

export interface PronunciationProgress {
  id: string;
  best: number;
  attempts: number;
  lastScore: number;
  lastAttempt: number;
}

export interface Profile {
  name: string;
  level: Level;
  planType: string;
  xp: number;
  badges: string[];
  joinedAt: number;
  motivational?: string;
  age?: number;
  nativeLanguage?: string;
  avatar?: string;
  // وقت آخر تعديل صريح للصورة (رفع/حذف) — يُستخدم لحسم الدمج ولا يتأثر بتغيّر XP.
  avatarAt?: number;
  planOverrides?: {
    newWordsPerDay?: number;
    reviewsPerDay?: number;
    days?: number;
    conversationMinutes?: number;
  };
  planAuto?: boolean;
  weeklyChallenge?: Record<string, { score: number; total: number }>;
}

export interface BadgeDef {
  id: string;
  icon: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
}

export interface PlanDef {
  id: string;
  level: Level;
  forLevels: Level[];
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  days: number;
  newWordsPerDay: number;
  reviewsPerDay: number;
  weeklyGoal: number;
  conversationMinutes: number;
  intro: string;
  introEn?: string;
  milestones: { day: number; title: string; titleEn?: string; message: string; messageEn?: string }[];
}

export interface ConversationLine {
  role: "A" | "B";
  en: string;
  ar: string;
}

export interface Conversation {
  id: string;
  title: string;
  topic: string;
  icon: string;
  minutes: number;
  level: Level;
  lines: ConversationLine[];
}

// ═══════════════ Phase 02: العمليات التجارية (Business Processes) ═══════════════

// نتيجة/مسار بديل داخل الخطوة (اعتماد، رفض، إكمال جزئي، استثناء).
export type ProcessPathOutcome = "normal" | "approved" | "rejected" | "partial" | "exception";

export interface ProcessStepPath {
  outcome: ProcessPathOutcome;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
}

// خطوة واحدة داخل العملية (Process Step).
export interface ProcessStep {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  moduleId: ModuleId;
  subModuleId?: string;
  // الدور المسؤول عن الخطوة (Template v1.0).
  roleAr?: string;
  roleEn?: string;
  // المدخل المطلوب لتنفيذ الخطوة.
  inputAr?: string;
  inputEn?: string;
  // المخرج الناتج عن الخطوة.
  outputAr?: string;
  outputEn?: string;
  // القرار أو المسار البديل الرئيسي في الخطوة.
  decisionAr?: string;
  decisionEn?: string;
  // مسارات فرعية: اعتماد/رفض/إكمال جزئي/استثناء.
  paths?: ProcessStepPath[];
  // الوظائف التجارية (Phase 01) المرتبطة بالخطوة.
  businessFunctionIds?: string[];
  // مصطلحات (term) مرتبطة بالخطوة من WORDS.
  wordIds?: string[];
  // مصطلحات واجهات (شاشة/حقل/زر/حالة) مرتبطة بالخطوة.
  screenIds?: string[];
}

// سطر حوار بين موظفين داخل العملية.
export interface ProcessDialogLine {
  speaker: string;
  en: string;
  ar: string;
}

export interface ProcessConversation {
  id: string;
  titleAr: string;
  titleEn: string;
  participantsAr: string;
  participantsEn: string;
  lines: ProcessDialogLine[];
  // مصطلحات من WORDS مرتبطة بالحوار (عرض فقط).
  wordIds?: string[];
}

// مستند مستخدم في العملية.
export interface ProcessDocumentItem {
  id: string;
  abbr: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  // معرّف المصطلح المرتبط (إن وُجد) من WORDS.
  wordId?: string;
}

// تمرين عملي.
export interface ProcessExercise {
  titleAr: string;
  titleEn: string;
  briefAr: string;
  briefEn: string;
  tasksAr: string[];
  tasksEn: string[];
  solutionAr: string;
  solutionEn: string;
}

// سؤال اختبار فهم داخل الدرس.
export interface ProcessQuizQuestion {
  id: string;
  promptAr: string;
  promptEn: string;
  optionsAr: string[];
  optionsEn: string[];
  answerIndex: number;
  explainAr?: string;
  explainEn?: string;
  // ربط السؤال بمصطلح من WORDS (إن وُجد) — عرض فقط، دون أي منطق SRS جديد.
  wordId?: string;
}

// العملية التجارية الكاملة (درس Phase 02).
export interface BusinessProcess {
  id: string;
  slug: string;
  icon: string;
  acronym: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  moduleIds: ModuleId[];
  // "ready" = الدرس مكتمل ومتاح، "planned" = قيد الإعداد (بطاقة "قريبًا").
  status: "ready" | "planned";
  scenarioAr?: string;
  scenarioEn?: string;
  steps?: ProcessStep[];
  conversations?: ProcessConversation[];
  documents?: ProcessDocumentItem[];
  exercise?: ProcessExercise;
  quiz?: ProcessQuizQuestion[];
}
