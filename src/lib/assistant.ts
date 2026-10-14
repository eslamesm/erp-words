export type AssistantRole = "user" | "assistant" | "system";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  ts: number;
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

export function newAssistantState(): AssistantState {
  return {
    messages: [],
    context: { topic: "general", wordIds: [] },
  };
}
