export type ModuleId =
  | "finance"
  | "inventory"
  | "sales"
  | "purchasing"
  | "manufacturing"
  | "hr"
  | "management"
  | "communication"
  | "it"
  | "assets"
  | "services"
  | "general";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export interface Word {
  id: string;
  english: string;
  arabic: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definitionEn?: string;
  definitionAr?: string;
  note?: string;
  module: ModuleId;
  level: Level;
  examples: string[];
  examplesAr?: string[];
  synonyms?: string[];
  antonyms?: string[];
  tags?: string[];
}

export interface ModuleMeta {
  id: ModuleId;
  labelAr: string;
  labelEn: string;
  icon: string;
  color: string;
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
