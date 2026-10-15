export type AssistantRole = "user" | "assistant" | "system";

/** شريحة اقتراح ديناميكية: تُعرض بنصّ ظاهر وترسل قيمة مختلفة للمحرّك. */
export interface AssistantOption {
  label: string;
  value: string;
}

/** شرائح الاقتراحات التي يمكن للمستخدم الضغط عليها لمتابعة الحوار. */
export type AssistantChip =
  | "dailyLesson"
  | "weak"
  | "random"
  | "interview"
  | "writeEmail"
  | "correct";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  ts: number;
  /** كلمات مقترحة للتقييم عبر نظام المراجعة المتباعدة (SRS). */
  wordIds?: string[];
  /** شرائح المتابعة المقترحة بعد هذا الرد. */
  chips?: AssistantChip[];
  /** خيارات ديناميكية (اختيار الوظيفة، سيناريوهات…). */
  options?: AssistantOption[];
}

export interface AssistantContext {
  topic: string;
  wordIds: string[];
  pathId?: string;
  lessonDay?: string;
}

export interface AssistantState {
  messages: AssistantMessage[];
  context: AssistantContext;
}

/** رد المحرك المحلي: النص + الكلمات القابلة للتقييم + شرائح/خيارات المتابعة. */
export interface AssistantReply {
  text: string;
  wordIds?: string[];
  chips?: AssistantChip[];
  options?: AssistantOption[];
}

export function newAssistantState(): AssistantState {
  return {
    messages: [],
    context: { topic: "general", wordIds: [] },
  };
}
