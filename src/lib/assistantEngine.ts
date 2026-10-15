"use client";

import { WORDS } from "@/data/words";
import { devWords } from "@/data/devWords";
import { careerPathsExtra } from "@/data/careerPathsExtra";
import { CAREER_PATHS } from "@/data/careerPaths";
import { COLLOCATIONS, EMAIL_TEMPLATES } from "@/data/phrases";
import { getLesson, getProgressFor } from "@/lib/storage";
import { correctEnglish } from "@/lib/englishFix";
import { CONVERSATIONS, CONVERSATION_EN } from "@/data/conversations";
import { ROLES, getRole, setRole, clearRole, roleLabel, savePending, takePending, detectRole, getPath, setPath, type RoleId } from "./assistantRole";
import { retrieve, careerPathById, careerPathOptions } from "@/lib/assistantKnowledge";
import type { AssistantChip, AssistantReply, AssistantOption } from "@/lib/assistant";
import type { Word } from "@/types";

const ALL_WORDS: Word[] = [...WORDS, ...devWords];
const CAREER = [...CAREER_PATHS, ...careerPathsExtra];

const DEFAULT_CHIPS: AssistantChip[] = ["dailyLesson", "weak", "random", "interview", "writeEmail", "correct"];

function withChips(reply: AssistantReply, chips: AssistantChip[] = DEFAULT_CHIPS): AssistantReply {
  return { ...reply, chips };
}

function roleOptions() {
  return ROLES.map((r) => ({ label: `${r.ar} — ${r.en}`, value: `role:${r.id}` }));
}

function pathOptions(isArabic: boolean): AssistantOption[] {
  return careerPathOptions().map((p) => ({
    label: `${p.icon} ${isArabic ? p.ar : p.en}`,
    value: `path:${p.id}`,
  }));
}

export interface AssistantRuntime {
  /** المسار المهني المختار (يُمرَّر من الواجهة) لاستخدامه في التدريب. */
  pathId?: string;
}

function askRoleText(isArabic: boolean): string {
  return isArabic
    ? "لتخصّص الرد لوظيفتك، ما دورك في العمل؟ اختر من الخيارات أو اكتبه (مثلاً: «أنا محاسب»)."
    : "So I can tailor the answer to your job, what is your role? Pick below or type it (e.g. \"I'm an accountant\").";
}

function clientConversationIntent(q: string): boolean {
  const s = q.toLowerCase();
  if (/(conversation with|talk to|speak to|speak with|deal with|handle).*?(client|customer)/.test(s)) return true;
  if (/(client|customer).*?(conversation|meeting|call|complaint)/.test(s)) return true;
  if (/(محادثة|حوار|محاور|حديث|التعامل|التحدث|مخاطبة)\s*(مع|إلى)?.{0,10}(العميل|عميل|الزبون|زبون|العميلا)/.test(q)) return true;
  if (/(العميل|عميل|الزبون|زبون).{0,12}(محادثة|حوار|تعامل|شكوى|اجتماع|مكالمة)/.test(q)) return true;
  if (/(كيف|طريقة|طريقه).{0,15}(أتعامل|اتعامل|أخاطب|اخاطب|أحادث|احادث|محادثة|حوار)/.test(q)) return true;
  return false;
}

function pickConversationId(role: RoleId | null, q: string): string | null {
  const s = q.toLowerCase();
  if (/complaint|شكا|شكوى/.test(s)) return "complaint";
  if (/delivery|تسليم|شحن/.test(s)) return "delivery";
  if (/change|تعديل|طلب تغيير/.test(s)) return "change-request";
  if (/trouble|problem|issue|مشكلة|عطل/.test(s)) return "troubleshooting";
  if (/sales|مبيعات|بيع/.test(s)) return "sales";
  if (/procurement|شراء|مورد|مشتريات/.test(s)) return "procurement";
  if (/budget|ميزانية|ميزاني/.test(s)) return "budget";
  if (/inventory|مخزن|مخزون|جرد/.test(s)) return "inventory";
  if (/hr|موارد بشرية|رواتب/.test(s)) return "hr";
  if (/roadmap|خارطة/.test(s)) return "roadmap";
  const prefs: Record<RoleId, string[]> = {
    accountant: ["budget", "management", "procurement"],
    purchasing: ["procurement", "delivery"],
    sales: ["sales", "close", "kickoff"],
    inventory: ["inventory"],
    hr: ["hr"],
    it: ["troubleshooting", "change-request"],
    pm: ["kickoff", "roadmap", "delivery", "change-request"],
    support: ["complaint", "troubleshooting", "delivery"],
    general: ["sales", "kickoff"],
  };
  return (prefs[role ?? "general"] ?? prefs.general)[0] ?? null;
}

function clientConversationReply(role: RoleId | null, q: string, isArabic: boolean): AssistantReply {
  const id = pickConversationId(role, q);
  const conv = CONVERSATIONS.find((c) => c.id === id);
  if (!conv) {
    return withChips({
      text: isArabic
        ? "لدي سيناريوهات محادثات عملية مع العملاء. اختر نوعًا: شكاوى، مبيعات، تسليم."
        : "I have practical client-conversation scenarios. Pick a type: complaint, sales, delivery.",
      options: [
        { label: isArabic ? "شكاوى" : "Complaint", value: "محادثة مع عميل شكاوى" },
        { label: isArabic ? "مبيعات" : "Sales", value: "محادثة مبيعات" },
        { label: isArabic ? "تسليم" : "Delivery", value: "محادثة تسليم" },
        { label: isArabic ? "تغيير الوظيفة" : "Change role", value: "role:clear" },
      ],
    });
  }
  const en = CONVERSATION_EN[id as keyof typeof CONVERSATION_EN];
  const title = en?.title ?? conv.title;
  const topic = en?.topic ?? conv.topic;
  const lines = conv.lines
    .slice(0, 4)
    .map((l) => `${l.role === "A" ? (isArabic ? "الشخص الأول" : "A") : isArabic ? "الشخص الثاني" : "B"}: ${isArabic ? l.ar : l.en}`)
    .join("\n");
  const roleL = roleLabel(role, isArabic ? "ar" : "en");
  const meta = isArabic ? `${conv.level} · ${conv.minutes} دقيقة` : `${conv.level} · ${conv.minutes} min`;
  const tail = roleL ? (isArabic ? ` · موجّه نحو: ${roleL}` : ` · Tailored to: ${roleL}`) : "";
  return withChips({
    text: `**${title}** — ${topic}\n\n${lines}\n\n(${meta}${tail})`,
    options: [
      { label: isArabic ? "شكاوى (complaint)" : "Complaint", value: "محادثة مع عميل شكاوى" },
      { label: isArabic ? "مبيعات (sales)" : "Sales", value: "محادثة مبيعات" },
      { label: isArabic ? "تسليم (delivery)" : "Delivery", value: "محادثة تسليم" },
      { label: isArabic ? "تغيير الوظيفة" : "Change role", value: "role:clear" },
    ],
  });
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

export function assistantRespond(user: string, runtime: AssistantRuntime = {}): AssistantReply {
  const q = user.trim();
  if (!q) return { text: "" };

  const lower = q.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(q);

  // تحيات ومجاملات قصيرة
  const greet = smalltalkReply(q, lower, isArabic);
  if (greet) return withChips({ text: greet });

  // اختيار/تحديد وظيفة السائل (لجعل الردود مناسبة لدوره)
  if (lower.startsWith("role:")) {
    const id = lower.slice(5).trim();
    if (id === "clear") {
      clearRole();
      return { text: askRoleText(isArabic), options: roleOptions() };
    }
    if (ROLES.some((r) => r.id === id)) {
      setRole(id as RoleId);
      const pending = takePending();
      if (pending) return assistantRespond(pending, runtime);
      return withChips({
        text: isArabic
          ? `ممتاز! سأخصّص ردودي لمجال «${roleLabel(id as RoleId, "ar")}». اسألني عن محادثة مع عميل، بريد مهني، أو كلمة ERP.`
          : `Great! I'll tailor answers to "${roleLabel(id as RoleId, "en")}". Ask me about a client conversation, a professional email, or an ERP word.`,
      });
    }
  }

  // اختيار المسار المهني (لتدريب المقابلات والسيناريوهات)
  if (lower.startsWith("path:")) {
    const id = q.slice(5).trim();
    const path = careerPathById(id);
    if (path) {
      setPath(path.id);
      return withChips({
        text: isArabic
          ? `تم اختيار المسار المهني: ${path.icon} «${path.titleAr}» (${path.title}).\nاطلب «تدريب مقابلة» ليأتيك سؤال من هذا المسار فقط.`
          : `Career path set: ${path.icon} "${path.title}" (${path.titleAr}).\nAsk "Interview practice" to get a question from this path only.`,
        chips: ["interview", "correct", "writeEmail"],
        options: pathOptions(isArabic),
      });
    }
    return withChips({
      text: isArabic ? "اختر المسار المهني:" : "Pick a career path:",
      options: pathOptions(isArabic),
    });
  }

  const coreIntent = /correct|fix |check my|صوّب|صحح|تصحيح|explain|what is|define|meaning of|اشرح|معنى|random|عشوائ|email|write|report|ticket|message|بريد|اكتب|تقرير|تذكرة|interview|مقابل|lesson|درس|review|weak|ضعيف|مراجعة|career|path|job|مسار|وظيفة/.test(lower);
  const detectedRole = coreIntent ? null : detectRole(q);
  if (detectedRole) setRole(detectedRole);
  const role: RoleId | null = detectedRole ?? getRole();

  // محادثة عملية مع عميل (تُخصّص حسب الوظيفة)
  if (clientConversationIntent(q)) {
    if (!role) {
      savePending(q);
      return { text: askRoleText(isArabic), options: roleOptions() };
    }
    return clientConversationReply(role, q, isArabic);
  }

  if (detectedRole) {
    return withChips({
      text: isArabic
        ? `تم! سأخصّص ردودي لمجال «${roleLabel(detectedRole, "ar")}». اسألني: «محادثة مع عميل»، «اكتب بريد متابعة»، أو «اشرح invoice».`
        : `Done! I'll tailor answers to "${roleLabel(detectedRole, "en")}". Ask: "conversation with a client", "write a follow-up email", or "explain invoice".`,
      options: [{ label: isArabic ? "تغيير الوظيفة" : "Change role", value: "role:clear" }],
    });
  }

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
    const inText =
      CAREER.find((p) => lower.includes(p.title.toLowerCase())) ||
      CAREER.find((p) => q.includes(p.titleAr));
    const path = inText ?? careerPathById(runtime.pathId ?? getPath());
    if (!path) {
      return withChips({
        text: isArabic
          ? "لتخصّص تدريب المقابلة، اختر المسار المهني أولًا:"
          : "To tailor the interview practice, pick a career path first:",
        options: pathOptions(isArabic),
      });
    }
    if (!path.interview?.length) {
      return withChips({
        text: isArabic
          ? `لا توجد أسئلة مقابلة جاهزة لمسار «${path.titleAr}» بعد.`
          : `No interview questions are ready for the "${path.title}" path yet.`,
        options: pathOptions(isArabic),
      });
    }
    const iq = path.interview[Math.floor(Math.random() * path.interview.length)];
    return withChips({
      text: isArabic
        ? `تدريب مقابلة — مسار ${path.titleAr} (${path.title})\n\nسؤال (${iq.type}):\n${iq.q}\n${iq.qAr}\n\nإجابة نموذجية:\n${iq.a}\n${iq.aAr}\n\nجاوبني بالإنجليزية وسأصوّب لك.`
        : `Interview practice — ${path.title} path\n\nQuestion (${iq.type}):\n${iq.q}\n${iq.qAr}\n\nSample answer:\n${iq.a}\n${iq.aAr}\n\nAnswer in English and I'll correct you.`,
      chips: ["interview", "correct", "writeEmail"],
      options: [{ label: isArabic ? "تغيير المسار" : "Change path", value: "path:ask" }],
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

  // بحث محلي في بيانات التطبيق (وضع بدون اتصال)
  const hits = retrieve(q, { limit: 4, minScore: 3 });
  if (hits.length) {
    const wordIds = hits.filter((h) => h.type === "word").map((h) => h.refId).slice(0, 4);
    const body = hits
      .map((h) => {
        if (h.type === "word") {
          const w = ALL_WORDS.find((x) => x.id === h.refId);
          if (w) return wordToText(w, isArabic);
        }
        return `• ${h.title}\n${h.text}`;
      })
      .join("\n\n");
    return withChips({
      text: (isArabic ? "من بيانات التطبيق:\n\n" : "From app data:\n\n") + body,
      wordIds: wordIds.length ? wordIds : undefined,
    });
  }

  // رد افتراضي
  const hintAr = "لا توجد نتيجة مطابقة في بيانات التطبيق. أستطيع: شرح الكلمات، تدريب المقابلات، تصحيح أخطائك، الكتابة المهنية (بريد/تقرير)، المراجعة الذكية، وكلمة عشوائية.";
  const hintEn = "No matching result in app data. I can: explain words, practice interviews, correct your mistakes, professional writing (email/report), smart revision, and a random word.";
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
