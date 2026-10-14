"use client";

import { WORDS } from "@/data/words";
import { devWords } from "@/data/devWords";
import { careerPathsExtra } from "@/data/careerPathsExtra";
import { CAREER_PATHS } from "@/data/careerPaths";
import { COLLOCATIONS } from "@/data/phrases";
import { getLesson } from "@/lib/storage";
import { getProgressFor } from "@/lib/storage";

const ALL_WORDS = [...WORDS, ...devWords];
const CAREER = [...CAREER_PATHS, ...careerPathsExtra];

function findWord(q: string): (typeof ALL_WORDS)[number] | undefined {
  const needle = q.toLowerCase().trim();
  return (
    ALL_WORDS.find((w) => w.english.toLowerCase() === needle) ||
    ALL_WORDS.find((w) => w.id.toLowerCase() === needle) ||
    ALL_WORDS.find((w) => w.arabic === q.trim()) ||
    ALL_WORDS.find((w) => w.english.toLowerCase().startsWith(needle)) ||
    ALL_WORDS.find((w) => w.arabic.includes(q.trim()))
  );
}

function findPhrase(q: string) {
  const n = q.toLowerCase();
  return COLLOCATIONS.find((p: any) => p.en.toLowerCase().includes(n) || p.ar.includes(q));
}

function getWeakWords(limit = 6): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of ALL_WORDS) {
    const p = getProgressFor(w.id);
    if ((p.wrongCount > p.correctCount + 1 || (p.wrongCount >= 2 && p.reps >= 2)) && !seen.has(w.id)) {
      out.push(w.id);
      seen.add(w.id);
      if (out.length >= limit) break;
    }
  }
  if (out.length < limit) {
    for (const w of ALL_WORDS.slice(0, 20)) {
      if (!seen.has(w.id)) {
        out.push(w.id);
        seen.add(w.id);
        if (out.length >= limit) break;
      }
    }
  }
  return out;
}

export function assistantReply(user: string): string {
  const q = user.trim();
  if (!q) return "";

  const lower = q.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(q);

  // Explain word
  if (lower.startsWith("explain") || lower.startsWith("what is") || lower.startsWith("define") || lower.includes("meaning of")) {
    const term = q.replace(/explain|what is|define|meaning of/gi, "").trim();
    const w = findWord(term);
    if (w) {
      const ar = `كلمة: ${w.english} — ${w.arabic}\nالتعريف: ${w.definitionAr || w.arabic}\nالنوع: ${w.partOfSpeech || "—"}\nالمستوى: ${w.level}\nالوحدة: ${w.module}\nأمثلة:\n- ${w.examplesAr?.[0] || w.examples[0]}\n- ${w.examplesAr?.[1] || w.examples[1] || w.examples[0]}`;
      const en = `Word: ${w.english}\nArabic: ${w.arabic}\nDefinition: ${w.definitionEn || w.english}\nPOS: ${w.partOfSpeech || "—"}\nLevel: ${w.level}\nModule: ${w.module}\nExamples:\n- ${w.examples[0]}\n${w.examples[1] ? "- " + w.examples[1] : ""}`;
      return isArabic ? ar : `${en}\n\n${ar}`;
    }
    return isArabic ? "لم أجد هذه الكلمة في المفردات. جرّب كلمة أخرى." : "I couldn't find this word in the vocabulary. Try another term.";
  }

  // Daily lesson
  if (lower.includes("daily") || lower.includes("lesson") || lower.includes("اليوم") || lower.includes("درس")) {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const lesson = getLesson(key);
    if (lesson && lesson.wordIds.length) {
      const words = lesson.wordIds.map((id) => ALL_WORDS.find((w) => w.id === id)).filter(Boolean) as typeof ALL_WORDS;
      const ar = `درس اليوم (${key})\nكلمتان:\n1. ${words[0]?.english} — ${words[0]?.arabic}\n2. ${words[1]?.english} — ${words[1]?.arabic}\nاسأل: «استخدم ${words[0]?.english} في جملة» أو «اشرح ${words[0]?.english}».`;
      const en = `Today's lesson (${key})\n1. ${words[0]?.english} (${words[0]?.arabic})\n2. ${words[1]?.english} (${words[1]?.arabic})\nAsk me: "Use ${words[0]?.english} in a sentence" or "Explain ${words[0]?.english}".`;
      return isArabic ? ar : `${en}\n\n${ar}`;
    }
    return isArabic ? "لم أجد درس اليوم بعد. عدّ لاحقًا." : "Today's lesson not found yet.";
  }

  // Revision / weak
  if (lower.includes("review") || lower.includes("revision") || lower.includes("weak") || lower.includes("ضعيف") || lower.includes("مراجعة")) {
    const ids = getWeakWords();
    const words = ids.map((id) => ALL_WORDS.find((w) => w.id === id)).filter(Boolean);
    const listAr = words.map((w, i) => `${i + 1}. ${w!.english} — ${w!.arabic}`).join("\n");
    const listEn = words.map((w, i) => `${i + 1}. ${w!.english} (${w!.arabic})`).join("\n");
    return isArabic
      ? `كلمات تحتاج مراجعة (ضعيفة):\n${listAr}\nأطلب: «استخدم [الكلمة] في جملة» أو «صوّب جملتي...»`
      : `Words to review (weak areas):\n${listEn}\nAsk: "Use [word] in a sentence" or "Correct my sentence...".`;
  }

  // Career paths
  if (lower.includes("career") || lower.includes("path") || lower.includes("job") || lower.includes("مسار") || lower.includes("وظيفة")) {
    const items = CAREER.slice(0, 5).map((p) => `${p.icon} ${p.title} (${p.titleAr})`).join("\n");
    return isArabic
      ? `مسارات مهنية في ERP:\n${items}\nاسأل: «مقابلة لمسار ${CAREER[0]?.titleAr}»`
      : `ERP career paths:\n${items}\nAsk: "Interview for ${CAREER[0]?.title}"`;
  }

  // Correction
  if (lower.includes("correct") || lower.includes("fix") || lower.includes("صوّب") || lower.includes("صحح")) {
    const text = q.replace(/correct|fix|صوّب|صحح/gi, "").trim();
    if (!text) return isArabic ? "أرسل الجملة أو الجواب للتصحيح." : "Send your sentence/answer to correct.";
    return isArabic
      ? `تصحيح مقترح للجملة:\n«${text}»\nاقتراح مهني أنسب:\n«${text}» (اقتراح مبسط — يمكنني تطويره أكثر عند إضافة نموذج AI).`
      : `Suggested correction:\nYour: "${text}"\nImproved (professional): "${text}".\nNote: For deeper grammar/ERP-specific corrections, enable AI mode in settings (BYOK).`;
  }

  // Writing
  if (lower.includes("email") || lower.includes("ticket") || lower.includes("report") || lower.includes("message") || lower.includes("بريد") || lower.includes("تذكرة") || lower.includes("تقرير")) {
    const topic = q.replace(/email|ticket|report|message|بريد|تذكرة|تقرير/gi, "").trim() || "ERP request";
    return isArabic
      ? `مساعد كتابة مهني — الموضوع: ${topic}\nأكتب: «اكتب بريدًا إنجليزيًا عن ${topic} بأسلوب رسمي ومهني».`
      : `Professional writing assistant — Topic: ${topic}\nAsk: "Write a professional English email about ${topic}".`;
  }

  // Phrase lookup
  const ph = findPhrase(q);
  if (ph) {
    return isArabic ? `${ph.en}\n${ph.ar}` : `${ph.en}\n${ph.ar}`;
  }

  // Default
  const hintAr = "يمكنني الشرح، المراجعة الذكية، التدرب على المقابلات، تصحيح الأخطاء والمساعدة في الكتابة المهنية.";
  const hintEn = "I can explain words, do smart revision, practice interviews, correct mistakes, and help with professional writing.";
  return isArabic ? `${hintAr}\n\nجرّب: «اشرح invoice»، «درس اليوم»، «مراجعة الكلمات الضعيفة»` : `${hintEn}\n\nTry: "Explain invoice", "Today's lesson", "Review weak words"`;
}
