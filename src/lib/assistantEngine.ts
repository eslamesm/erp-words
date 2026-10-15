"use client";

import { WORDS } from "@/data/words";
import { devWords } from "@/data/devWords";
import { careerPathsExtra } from "@/data/careerPathsExtra";
import { CAREER_PATHS } from "@/data/careerPaths";
import { COLLOCATIONS, EMAIL_TEMPLATES } from "@/data/phrases";
import { getLesson, getProgressFor } from "@/lib/storage";
import { correctEnglish } from "@/lib/englishFix";
import type { AssistantChip, AssistantReply } from "@/lib/assistant";
import type { Word } from "@/types";

const ALL_WORDS: Word[] = [...WORDS, ...devWords];
const CAREER = [...CAREER_PATHS, ...careerPathsExtra];

const DEFAULT_CHIPS: AssistantChip[] = ["dailyLesson", "weak", "random", "interview", "writeEmail", "correct"];

function withChips(reply: AssistantReply, chips: AssistantChip[] = DEFAULT_CHIPS): AssistantReply {
  return { ...reply, chips };
}

function findWord(q: string): Word | undefined {
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
  return COLLOCATIONS.find((p) => p.en.toLowerCase().includes(n) || p.ar.includes(q));
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

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function wordToText(w: Word, isArabic: boolean): string {
  const ar = `كلمة: ${w.english} — ${w.arabic}\nالتعريف: ${w.definitionAr || w.arabic}\nالنوع: ${w.partOfSpeech || "—"}\nالمستوى: ${w.level}\nالوحدة: ${w.module}\nأمثلة:\n- ${w.examplesAr?.[0] || w.examples[0]}\n- ${w.examplesAr?.[1] || w.examples[1] || w.examples[0]}`;
  const en = `Word: ${w.english}\nArabic: ${w.arabic}\nDefinition: ${w.definitionEn || w.english}\nPOS: ${w.partOfSpeech || "—"}\nLevel: ${w.level}\nModule: ${w.module}\nExamples:\n- ${w.examples[0]}\n${w.examples[1] ? "- " + w.examples[1] : ""}`;
  return isArabic ? ar : `${en}\n\n${ar}`;
}

function randomWord(): Word {
  const idx = Math.floor(Math.random() * ALL_WORDS.length);
  return ALL_WORDS[idx];
}

function emailFor(q: string) {
  const n = q.toLowerCase();
  const map: { id: string; keys: string[] }[] = [
    { id: "approval", keys: ["approval", "approve", "موافقة", "اعتماد"] },
    { id: "escalation", keys: ["escalat", "overdue", "متأخر", "تصعيد"] },
    { id: "follow-up", keys: ["follow", "متابعة", "تذكير"] },
    { id: "meeting", keys: ["meeting", "invite", "اجتماع", "دعوة"] },
    { id: "request-info", keys: ["request", "info", "details", "طلب", "معلومات"] },
  ];
  const hit = map.find((m) => m.keys.some((k) => n.includes(k)));
  return hit ? EMAIL_TEMPLATES.find((e) => e.id === hit.id) : undefined;
}

function stripKeyword(q: string, words: string[]): string {
  let out = q;
  for (const w of words) out = out.replace(new RegExp(w, "gi"), "");
  return out.replace(/\s{2,}/g, " ").trim();
}

// ردود التحيات والمجاملات القصيرة — تتفاعل تلقائيًا بلغة المستخدم.
function smalltalkReply(q: string, lower: string, isArabic: boolean): string | null {
  if (/explain|translate|correct|email|interview|lesson|درس|اشرح|ترجم|صوّب|صحح|بريد|مقابل/i.test(q)) {
    return null;
  }
  const t = q.trim();
  if (/السلام\s*عليكم|السلام\s*علیکم|السَّلام|assalam|salam\s*alaikum|assalamu/i.test(q)) {
    return "وعليكم السلام ورحمة الله وبركاته 🌟\nكيف يمكنني مساعدتك في الإنجليزية المهنية اليوم؟";
  }
  if (/\b(bye|goodbye|see you|see ya)\b/i.test(lower) || /وداعا|وداعًا|إلى اللقاء|مع السلامة/.test(q)) {
    return isArabic ? "إلى اللقاء! أتمنى لك يومًا موفقًا ☺️" : "Goodbye! Have a great day ☺️";
  }
  if (/\b(thanks|thank you|thx|thank u)\b/i.test(lower) || /شكرا|شكرًا|مشكور|مشكورة/.test(q)) {
    return isArabic ? "العفو! أنا هنا متى احتجت 👍" : "You're welcome! I'm here whenever you need me 👍";
  }
  if (/كيف\s*حالك|كيف\s*الحال|كيفك|شلونك|أخبارك|اخبارك|كيف\s*الأمور/.test(q) || /\bhow are you\b/i.test(lower)) {
    return isArabic
      ? "بخير والحمد لله، شكرًا لسؤالك! 😊 كيف يمكنني مساعدتك؟"
      : "I'm doing well, thanks for asking! 😊 How can I help you?";
  }
  if (/صباح\s*الخير|صباح\s*النور|صباحو/.test(q) || /\bgood morning\b/i.test(lower)) {
    return isArabic ? "صباح النور! 🌅 كيف يمكنني مساعدتك اليوم؟" : "Good morning! 🌅 How can I help you today?";
  }
  if (/مساء\s*الخير|مساء\s*النور/.test(q) || /\bgood evening\b/i.test(lower)) {
    return isArabic ? "مساء النور! 🌆 كيف يمكنني مساعدتك اليوم؟" : "Good evening! 🌆 How can I help you today?";
  }
  if (/^(مرحبا|مرحبًا|أهلا|أهلًا|هلا|اهلا|هاي|هالو|أهلاً وسهلاً)/.test(t) || /^(hi|hello|hey|hallo|hola)\b/i.test(t)) {
    return isArabic
      ? "مرحبًا! 👋 كيف يمكنني مساعدتك في الإنجليزية المهنية؟"
      : "Hello! 👋 How can I help you with professional English?";
  }
  return null;
}

export function learnerSnapshot() {
  const weak = getWeakWords(8)
    .map((id) => ALL_WORDS.find((w) => w.id === id)?.english)
    .filter(Boolean) as string[];
  const lesson = (getLesson(todayKey())?.wordIds ?? [])
    .map((id) => ALL_WORDS.find((w) => w.id === id)?.english)
    .filter(Boolean) as string[];
  return { weak, lesson };
}

export function assistantRespond(user: string): AssistantReply {
  const q = user.trim();
  if (!q) return { text: "" };

  const lower = q.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(q);

  // تحيات ومجاملات قصيرة
  const greet = smalltalkReply(q, lower, isArabic);
  if (greet) return withChips({ text: greet });

  // تصحيح الأخطاء (فحص قواعدي مبني على قواعد شائعة)
  if (
    lower.includes("correct") ||
    lower.includes("fix ") ||
    lower.includes("check my") ||
    lower.includes("صوّب") ||
    lower.includes("صحح") ||
    lower.includes("تصحيح")
  ) {
    const text = stripKeyword(q, ["correct", "fix", "check my", "صوّب", "صحح", "تصحيح"]);
    if (!text) {
      return withChips({
        text: isArabic ? "أرسل الجملة أو الجواب لأصحّحه لك." : "Send your sentence/answer and I'll correct it.",
      });
    }
    const { corrected, fixes } = correctEnglish(text);
    if (!fixes.length) {
      return withChips({
        text: isArabic
          ? `جملتك سليمة ✔\n«${corrected}»\nإن أردت، اطلب صياغة أكثر مهنية: «أعد صياغة: ${corrected}»`
          : `Your sentence looks correct ✔\n"${corrected}"\nWant a more professional version? Ask: "Rewrite: ${corrected}"`,
      });
    }
    const listAr = fixes.map((f, i) => `${i + 1}. «${f.from}» ← «${f.to}» : ${f.note}`).join("\n");
    const listEn = fixes.map((f, i) => `${i + 1}. "${f.from}" → "${f.to}": ${f.note}`).join("\n");
    return withChips({
      text: isArabic
        ? `جملتك: «${text}»\nالصواب: «${corrected}»\n\nملاحظات:\n${listAr}`
        : `Your: "${text}"\nCorrected: "${corrected}"\n\nNotes:\n${listEn}`,
    });
  }

  // شرح كلمة
  if (
    lower.startsWith("explain") ||
    lower.startsWith("what is") ||
    lower.startsWith("define") ||
    lower.includes("meaning of") ||
    lower.startsWith("اشرح") ||
    lower.includes("معنى")
  ) {
    const term = stripKeyword(q, ["explain", "what is", "define", "meaning of", "اشرح", "ما معنى", "معنى"]);
    const w = findWord(term);
    if (w) return withChips({ text: wordToText(w, isArabic), wordIds: [w.id] });
    return withChips({
      text: isArabic
        ? "لم أجد هذه الكلمة في المفردات. جرّب كلمة ERP أخرى، أو اكتبها بالإنجليزية."
        : "I couldn't find this word in the vocabulary. Try another ERP term, or type it in English.",
    });
  }

  // كلمة عشوائية للتدريب
  if (lower.includes("random") || lower.includes("عشوائ")) {
    const w = randomWord();
    return withChips({
      text:
        (isArabic ? "كلمة عشوائية للتدريب:\n\n" : "Random practice word:\n\n") + wordToText(w, isArabic),
      wordIds: [w.id],
      chips: ["weak", "dailyLesson", "interview", "correct"],
    });
  }

  // كتابة مهنية (بريد/تقرير/تذكرة)
  if (
    lower.includes("email") ||
    lower.includes("write") ||
    lower.includes("report") ||
    lower.includes("ticket") ||
    lower.includes("message") ||
    lower.includes("بريد") ||
    lower.includes("اكتب") ||
    lower.includes("تقرير") ||
    lower.includes("تذكرة")
  ) {
    const topic = stripKeyword(q, ["email", "write", "report", "ticket", "message", "بريد", "اكتب", "تقرير", "تذكرة", "professional", "مهني"]);
    const tpl = emailFor(q);
    if (tpl) {
      const body = isArabic ? tpl.bodyAr : tpl.bodyEn;
      const subject = isArabic ? tpl.subjectAr : tpl.subjectEn;
      const tips = (isArabic ? tpl.tipsAr : tpl.tipsEn).map((x) => `• ${x}`).join("\n");
      return withChips({
        text:
          (isArabic ? `قالب بريد جاهز (${tpl.titleAr}):\n\n` : `Ready email template (${tpl.titleEn}):\n\n`) +
          `Subject: ${subject}\n\n${body}\n\n` +
          (isArabic ? `نصائح:\n${tips}\n` : `Tips:\n${tips}\n`) +
          (isArabic ? `\nاستبدل ما بين [الأقواس] بتفاصيلك.` : `\nReplace the [bracketed] parts with your details.`),
      });
    }
    const subj = topic || "ERP request";
    return withChips({
      text: isArabic
        ? `مساعد الكتابة المهنية — الموضوع: ${subj}\nاذكر النوع بدقة ليصلك قالب جاهز، مثل: «اكتب بريد موافقة»، «بريد متابعة»، «بريد تصعيد»، «دعوة اجتماع»، أو «طلب معلومات».`
        : `Professional writing assistant — Topic: ${subj}\nName the type to get a ready template, e.g. "Write an approval email", "Follow-up email", "Escalation email", "Meeting invite", or "Request for information".`,
      chips: ["writeEmail", "correct"],
    });
  }

  // تدريب مقابلة عمل
  if (lower.includes("interview") || lower.includes("مقابل")) {
    const path =
      CAREER.find((p) => lower.includes(p.title.toLowerCase())) ||
      CAREER.find((p) => q.includes(p.titleAr)) ||
      CAREER[Math.floor(Math.random() * CAREER.length)];
    const iq = path.interview[Math.floor(Math.random() * path.interview.length)];
    return withChips({
      text: isArabic
        ? `تدريب مقابلة — مسار ${path.titleAr} (${path.title})\n\nسؤال (${iq.type}):\n${iq.q}\n${iq.qAr}\n\nإجابة نموذجية:\n${iq.a}\n${iq.aAr}\n\nجاوبني بالإنجليزية وسأصوّب لك.`
        : `Interview practice — ${path.title} path\n\nQuestion (${iq.type}):\n${iq.q}\n${iq.qAr}\n\nSample answer:\n${iq.a}\n${iq.aAr}\n\nAnswer in English and I'll correct you.`,
      chips: ["interview", "correct", "writeEmail"],
    });
  }

  // درس اليوم
  if (lower.includes("daily") || lower.includes("lesson") || lower.includes("اليوم") || lower.includes("درس")) {
    const key = todayKey();
    const lesson = getLesson(key);
    if (lesson && lesson.wordIds.length) {
      const words = lesson.wordIds.map((id) => ALL_WORDS.find((w) => w.id === id)).filter(Boolean) as Word[];
      const ar = `درس اليوم (${key})\nكلمتان:\n1. ${words[0]?.english} — ${words[0]?.arabic}\n2. ${words[1]?.english} — ${words[1]?.arabic}\nاسأل: «اشرح ${words[0]?.english}» أو «استخدم ${words[0]?.english} في جملة».`;
      const en = `Today's lesson (${key})\n1. ${words[0]?.english} (${words[0]?.arabic})\n2. ${words[1]?.english} (${words[1]?.arabic})\nAsk me: "Explain ${words[0]?.english}".`;
      return withChips({
        text: isArabic ? ar : `${en}\n\n${ar}`,
        wordIds: lesson.wordIds,
      });
    }
    return withChips({
      text: isArabic ? "لم أجد درس اليوم بعد. افتح «درس خصوصي» أولًا." : "Today's lesson isn't ready. Open the Private Lesson first.",
      chips: ["weak", "random"],
    });
  }

  // مراجعة الكلمات الضعيفة
  if (lower.includes("review") || lower.includes("revision") || lower.includes("weak") || lower.includes("ضعيف") || lower.includes("مراجعة")) {
    const ids = getWeakWords();
    const words = ids.map((id) => ALL_WORDS.find((w) => w.id === id)).filter(Boolean) as Word[];
    const listAr = words.map((w, i) => `${i + 1}. ${w.english} — ${w.arabic}`).join("\n");
    const listEn = words.map((w, i) => `${i + 1}. ${w.english} (${w.arabic})`).join("\n");
    return withChips({
      text: isArabic
        ? `كلمات تحتاج مراجعة (ضعيفة):\n${listAr}\nراجعها لاحقًا عبر نظام التكرار المتباعد.`
        : `Words to review (weak areas):\n${listEn}\nRate them below to reschedule via spaced repetition.`,
      wordIds: ids,
      chips: ["random", "dailyLesson"],
    });
  }

  // المسارات المهنية
  if (lower.includes("career") || lower.includes("path") || lower.includes("job") || lower.includes("مسار") || lower.includes("وظيفة")) {
    const items = CAREER.slice(0, 5).map((p) => `${p.icon} ${p.title} (${p.titleAr})`).join("\n");
    return withChips({
      text: isArabic
        ? `مسارات مهنية في ERP:\n${items}\nاسأل: «تدريب مقابلة ${CAREER[0]?.titleAr}»`
        : `ERP career paths:\n${items}\nAsk: "Interview practice ${CAREER[0]?.title}"`,
      chips: ["interview", "correct"],
    });
  }

  // قاموس العبارات/المتلازمات اللفظية
  const ph = findPhrase(q);
  if (ph) {
    return withChips({ text: `${ph.en}\n${ph.ar}` });
  }

  // رد افتراضي
  const hintAr = "يمكنني: شرح الكلمات، تدريب المقابلات، تصحيح أخطائك، الكتابة المهنية (بريد/تقرير)، المراجعة الذكية، وكلمة عشوائية.";
  const hintEn = "I can: explain words, practice interviews, correct your mistakes, professional writing (email/report), smart revision, and a random word.";
  return withChips({
    text: isArabic
      ? `${hintAr}\n\nجرّب: «اشرح invoice»، «صوّب: I have informations»، «اكتب بريد موافقة»، «تدريب مقابلة».`
      : `${hintEn}\n\nTry: "Explain invoice", "Correct: I have informations", "Write an approval email", "Interview practice".`,
  });
}

/** واجهة نصية مختصرة للاستخدام كرد احتياطي عند فشل الذكاء الاصطناعي. */
export function assistantReply(user: string): string {
  return assistantRespond(user).text;
}
