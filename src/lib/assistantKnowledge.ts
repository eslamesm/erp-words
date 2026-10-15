import { WORDS } from "@/data/words";
import { devWords } from "@/data/devWords";
import { CAREER_PATHS_ALL } from "@/data/careerPaths";
import { CONVERSATIONS } from "@/data/conversations";
import { COLLOCATIONS, PROCESS_PACKS } from "@/data/phrases";

// قاعدة معرفة محلية تُبنى من بيانات التطبيق نفسه (كلمات، مسارات مهنية،
// مقابلات، سيناريوهات، محادثات، حزم العمليات). تُستخدم في وضع "بدون اتصال"
// وفي إثراء سياق الذكاء الاصطناعي عبر إرسال المقاطع المسترجعة فقط (خصوصية).

export type ChunkType =
  | "word"
  | "path"
  | "interview"
  | "scenario"
  | "conversation"
  | "process"
  | "collocation";

export interface KnowledgeChunk {
  id: string;
  type: ChunkType;
  refId: string;
  title: string;
  /** النص الكامل المستخدم للاسترجاع ولحقنه في السياق. */
  text: string;
  lang: "en" | "ar" | "bi";
  tokens: string[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are",
  "be", "with", "as", "at", "by", "it", "this", "that", "from", "we", "you",
  "i", "he", "she", "they", "do", "does", "how", "what", "why", "when", "which",
  "من", "في", "على", "عن", "إلى", "الى", "هو", "هي", "ما", "ماذا", "كيف", "لماذا",
  "متى", "هذا", "هذه", "ذلك", "التي", "الذي", "أو", "او", "و", "ثم", "مع", "هل",
  "أنا", "انت", "أنت", "نحن", "كان", "كانت",
]);

export function tokenize(text: string): string[] {
  const norm = (text || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // تشكيل عربي
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  if (!norm) return [];
  return norm
    .split(/\s+/)
    .map((t) => (t.startsWith("ال") && t.length > 4 ? t.slice(2) : t))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

let INDEX: KnowledgeChunk[] | null = null;

function push(
  arr: KnowledgeChunk[],
  c: Omit<KnowledgeChunk, "tokens">
): void {
  arr.push({ ...c, tokens: Array.from(new Set(tokenize(c.text + " " + c.title))) });
}

function buildIndex(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const w of [...WORDS, ...devWords]) {
    const parts = [
      `EN: ${w.english}`,
      `AR: ${w.arabic}`,
      w.partOfSpeech ? `POS: ${w.partOfSpeech}` : "",
      w.definitionEn ? `Definition: ${w.definitionEn}` : "",
      w.definitionAr ? `تعريف: ${w.definitionAr}` : "",
      w.examples?.[0] ? `Example: ${w.examples[0]}` : "",
      w.module ? `Module: ${w.module}` : "",
      w.synonyms?.length ? `Synonyms: ${w.synonyms.join(", ")}` : "",
    ].filter(Boolean);
    push(chunks, {
      id: `word:${w.id}`,
      type: "word",
      refId: w.id,
      title: w.english,
      text: parts.join(" | "),
      lang: "bi",
    });
  }

  for (const p of CAREER_PATHS_ALL) {
    push(chunks, {
      id: `path:${p.id}`,
      type: "path",
      refId: p.id,
      title: `${p.title} / ${p.titleAr}`,
      text: [
        `Career path: ${p.title} (${p.titleAr})`,
        `Summary: ${p.summary}`,
        `ملخص: ${p.summaryAr}`,
        p.responsibilities?.length ? `Responsibilities: ${p.responsibilities.join("; ")}` : "",
        p.skills?.length ? `Skills: ${p.skills.join(", ")}` : "",
        p.tools?.length ? `Tools: ${p.tools.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      lang: "bi",
    });

    p.interview?.forEach((q, i) => {
      push(chunks, {
        id: `interview:${p.id}:${i}`,
        type: "interview",
        refId: p.id,
        title: `${p.title} — Interview Q${i + 1}`,
        text: [
          `Question (${q.type}): ${q.q}`,
          `السؤال: ${q.qAr}`,
          `Model answer: ${q.a}`,
          `الإجابة النموذجية: ${q.aAr}`,
        ].join(" | "),
        lang: "bi",
      });
    });

    p.scenarios?.forEach((s, i) => {
      push(chunks, {
        id: `scenario:${p.id}:${i}`,
        type: "scenario",
        refId: p.id,
        title: `${p.title} — ${s.title}`,
        text: [
          `Scenario: ${s.title}`,
          `Situation: ${s.situation}`,
          `الموقف: ${s.situationAr}`,
          s.steps?.length ? `Steps: ${s.steps.join(" → ")}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        lang: "bi",
      });
    });
  }

  for (const c of CONVERSATIONS) {
    push(chunks, {
      id: `conv:${c.id}`,
      type: "conversation",
      refId: c.id,
      title: `${c.title} / ${c.topic}`,
      text:
        `Conversation "${c.title}" (${c.topic}): ` +
        c.lines.map((l) => `"${l.en}"`).join(" "),
      lang: "en",
    });
  }

  for (const pack of PROCESS_PACKS) {
    push(chunks, {
      id: `process:${pack.id}`,
      type: "process",
      refId: pack.id,
      title: `${pack.code} — ${pack.titleEn}`,
      text: [
        `${pack.titleEn} (${pack.titleAr}): ${pack.descEn}`,
        `الوصف: ${pack.descAr}`,
        pack.steps?.length ? `Steps: ${pack.steps.map((s) => s.en).join(" → ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      lang: "bi",
    });
  }

  COLLOCATIONS.forEach((c, i) => {
    push(chunks, {
      id: `collocation:${i}`,
      type: "collocation",
      refId: `${i}`,
      title: c.en,
      text: `Collocation: ${c.en} — ${c.ar}${c.module ? ` (${c.module})` : ""}`,
      lang: "bi",
    });
  });

  return chunks;
}

function getIndex(): KnowledgeChunk[] {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

/** يُعيد بناء الفهرس (يُستدعى عند تغيّر بيانات التطبيق إن لزم). */
export function rebuildKnowledgeIndex(): void {
  INDEX = null;
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

/** استرجاع المقاطع الأكثر صلة بالسؤال (بحث معجمي بسيط ثنائي اللغة). */
export function retrieve(
  query: string,
  opts: { limit?: number; types?: ChunkType[]; minScore?: number } = {}
): KnowledgeChunk[] {
  const limit = opts.limit ?? 6;
  const minScore = opts.minScore ?? 1;
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  const index = getIndex();
  const types = opts.types ? new Set(opts.types) : null;

  const scored: { chunk: KnowledgeChunk; score: number }[] = [];
  for (const chunk of index) {
    if (types && !types.has(chunk.type)) continue;
    let score = 0;
    for (const qt of queryTokens) {
      if (chunk.tokens.includes(qt)) {
        score += 3;
        if (tokenize(chunk.title).includes(qt)) score += 2;
      } else if (qt.length >= 4) {
        const hit = chunk.tokens.some(
          (ct) => ct.length >= 4 && (ct.startsWith(qt) || qt.startsWith(ct))
        );
        if (hit) score += 1;
      }
    }
    if (score >= minScore) scored.push({ chunk, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.chunk);
}

export function careerPathOptions(): { id: string; en: string; ar: string; icon: string }[] {
  return CAREER_PATHS_ALL.map((p) => ({
    id: p.id,
    en: p.title,
    ar: p.titleAr,
    icon: p.icon,
  }));
}

export function careerPathById(id: string | null | undefined) {
  if (!id) return null;
  return CAREER_PATHS_ALL.find((p) => p.id === id) ?? null;
}

/** يبني كتلة المعرفة للحقن في سياق الذكاء الاصطناعي (المقاطع المسترجعة فقط). */
export function buildKnowledgeBlock(chunks: KnowledgeChunk[]): string {
  if (!chunks.length) return "";
  const body = chunks
    .map((c) => `• ${c.title}\n${c.text}`)
    .join("\n---\n");
  return `[APP_KNOWLEDGE]\n${body}\n[/APP_KNOWLEDGE]`;
}
