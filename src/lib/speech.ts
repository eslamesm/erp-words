// محرك نطق محسّن: اختيار أفضل صوت إنجليزي، تقسيم الجمل لتجنّب انقطاع الصوت،
// وتشغيل متتابع مع استدعاءات للمتابعة (لإبراز الجملة الحالية والتوقف عند النهاية).

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: (chunk: string) => void;
  onEnd?: () => void;
}

let voicesReady = false;
let warming = false;
let preferredVoiceName = "";
const pending: (() => void)[] = [];
let activeUtterances: SpeechSynthesisUtterance[] = [];

// يضبط الصوت المفضّل الذي سيُستخدم في كل استدعاءات النطق (اسم الصوت أو فراغ = تلقائي).
export function setPreferredVoice(name: string) {
  preferredVoiceName = name || "";
}

export interface VoiceInfo {
  name: string;
  lang: string;
  gender: "male" | "female" | "unknown";
  local: boolean;
}

// تخمين جنس الصوت من اسمه (المتصفح لا يوفّر الجنس صراحةً).
export function guessGender(name: string): "male" | "female" | "unknown" {
  const n = name.toLowerCase();
  if (/\bmale\b/.test(n) && !/female/.test(n)) return "male";
  if (/female|\bwoman\b/.test(n)) return "female";
  if (/(david|mark|daniel|alex|fred|james|george|ryan|guy|thomas|oliver|rishi|andrew|brian|christopher|eric|steffan|liam|william|arthur|roger|john|paul|richard|matthew|nathan|eli|luke|noah|aaron|adam|jason|kevin|steve|diego|jorge|juan|carlos|albert|eddy|reed|rocko|grandpa|aaron)/.test(n))
    return "male";
  if (/(zira|samantha|aria|jenny|michelle|ava|emma|sonia|karen|moira|tessa|fiona|victoria|susan|allison|joanna|salli|kimberly|amy|nicole|olivia|sara|sarah|hazel|catherine|serena|kate|clara|nicky|linda|mary|jane|lily|sophie|isabella|emily|heather|siri|monica|paulina|lucia)/.test(n))
    return "female";
  return "unknown";
}

// قائمة أصوات الإنجليزية المتاحة على الجهاز.
export function getEnglishVoices(): VoiceInfo[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("en"))
    .map((v) => ({ name: v.name, lang: v.lang, gender: guessGender(v.name), local: v.localService }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// يختار أفضل صوت متاح لجنس معيّن (رجل/امرأة) — يعيد اسمه فقط.
export function bestVoiceNameFor(gender: "male" | "female"): string {
  const list = getEnglishVoices();
  const hit = list.find((v) => v.gender === gender);
  return hit?.name ?? list[0]?.name ?? "";
}

function markVoicesReady() {
  voicesReady = true;
  pending.splice(0).forEach((cb) => cb());
}

// يضمن تحميل قائمة الأصوات (يرسل طلبًا لاستدعاء voiceschanged في المتصفحات).
export function warmUpVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || voicesReady) return;
  if (warming) return;
  warming = true;
  const check = () => {
    if (voicesReady) return;
    if (window.speechSynthesis.getVoices().length) markVoicesReady();
  };
  check();
  if (!voicesReady) window.speechSynthesis.addEventListener?.("voiceschanged", check);
}

function rankVoice(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase().replace("_", "-");
  const name = v.name.toLowerCase();
  let s = 0;
  if (lang === "en-us") s += 6;
  else if (lang === "en-gb" || lang === "en-uk") s += 5;
  else if (lang.startsWith("en")) s += 3;
  if (/google us english/.test(name)) s += 5;
  if (/natural|neural|premium|online(s)?(voice)?/.test(name)) s += 3;
  if (/(samantha|aria|jenny|michelle|ava|emma|sonia|ryan|guy|daniel|mark|zira|david)/.test(name)) s += 1;
  if (v.localService) s += 1;
  if (v.default) s += 1;
  return s;
}

function pickVoice(lang?: string): SpeechSynthesisVoice | null {
  const list = window.speechSynthesis.getVoices();
  if (!list.length) return null;
  const prefix = (lang || "en").toLowerCase().slice(0, 2);
  // غير الإنجليزية: اختر صوتًا يطابق لغة الرد إن وُجد (مثل العربية).
  if (prefix && prefix !== "en") {
    const match = list.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;
  }
  if (preferredVoiceName) {
    const want = preferredVoiceName.toLowerCase();
    const exact = list.find((v) => v.name.toLowerCase() === want);
    if (exact) return exact;
    const partial = list.find((v) => v.name.toLowerCase().includes(want));
    if (partial) return partial;
  }
  const ranked = list
    .filter((v) => v.lang.toLowerCase().startsWith("en"))
    .sort((a, b) => rankVoice(b) - rankVoice(a));
  return ranked[0] ?? list[0];
}

function splitSentences(text: string): string[] {
  const m = text.match(/[^.!?\n]+[.!?]+["'\u201D]*|\S[^.!?\n]*$/g);
  return (m ?? []).map((s) => s.trim()).filter(Boolean);
}

// تقسيم النص الطويل إلى أجزاء صغيرة حتى لا يقطع المتصفح الصوت في النصوص الطويلة.
function chunkText(text: string): string[] {
  const sentences = splitSentences(text);
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && (buf + " " + s).length > 200) {
      out.push(buf);
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) out.push(buf);
  return out.length ? out : [text].filter(Boolean);
}

export function stop() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  activeUtterances = [];
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onEnd?.();
    return;
  }
  stop();
  const synth = window.speechSynthesis;
  const chunks = chunkText(text);
  const run = () => {
    const voice = pickVoice(opts.lang);
    let i = 0;
    const step = () => {
      if (i >= chunks.length) {
        opts.onEnd?.();
        return;
      }
      const chunk = chunks[i++];
      opts.onStart?.(chunk);
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = opts.lang ?? "en-US";
      u.rate = opts.rate ?? 0.95;
      u.pitch = opts.pitch ?? 1;
      if (voice) u.voice = voice;
      u.onend = step;
      u.onerror = step;
      activeUtterances.push(u);
      synth.speak(u);
    };
    step();
  };
  warmUpVoices();
  if (voicesReady) run();
  else pending.push(run);
}
export function speakWords(words: string[], opts: SpeakOptions = {}) {
  if (typeof window === "undefined" || !words.length) {
    opts.onEnd?.();
    return;
  }
  stop();
  const synth = window.speechSynthesis;
  const speakOne = (i: number) => {
    if (i >= words.length) {
      opts.onEnd?.();
      return;
    }
    opts.onStart?.(words[i]);
    const run = () => {
      const voice = pickVoice(opts.lang);
      const u = new SpeechSynthesisUtterance(words[i]);
      u.lang = opts.lang ?? "en-US";
      u.rate = opts.rate ?? 0.95;
      u.pitch = opts.pitch ?? 1;
      if (voice) u.voice = voice;
      u.onend = () => speakOne(i + 1);
      u.onerror = () => speakOne(i + 1);
      activeUtterances.push(u);
      synth.speak(u);
    };
    warmUpVoices();
    if (voicesReady) run();
    else pending.push(run);
  };
  speakOne(0);
}