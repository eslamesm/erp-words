// تقييم نطق تقديري (client-side) دون أي خدمة خارجية:
// يطابق النص المنطوق مع النص المتوقّع كلمة-بكلمة، مع مسافة تحرير ومقارنة صوتية
// (Soundex مبسّطة) للتسامح مع اختلافات التعرّف الصوتي.

export type WordStatus = "good" | "close" | "bad";

export interface WordScore {
  expected: string;
  heard: string | null;
  score: number; // 0..1
  status: WordStatus;
}

export interface PronunciationResult {
  score: number; // 0..100
  passed: boolean;
  words: WordScore[];
}

export const DEFAULT_THRESHOLD = 80;

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, "");
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  const n = normalizeText(s);
  return n ? n.split(" ") : [];
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

// مفتاح صوتي مبسّط يشبه Soundex — لكشف التطابق رغم اختلاف الكتابة.
export function phoneticKey(word: string): string {
  const w = normalizeWord(word);
  if (!w) return "";
  const codes: Record<string, string> = {
    b: "1", f: "1", p: "1", v: "1",
    c: "2", g: "2", j: "2", k: "2", q: "2", s: "2", x: "2", z: "2",
    d: "3", t: "3",
    l: "4",
    m: "5", n: "5",
    r: "6",
  };
  let out = w[0];
  let prev = codes[w[0]] ?? "";
  for (let i = 1; i < w.length; i++) {
    const ch = w[i];
    const code = codes[ch] ?? "";
    if (code && code !== prev) out += code;
    if (ch !== "h" && ch !== "w") prev = code;
  }
  return out;
}

// تشابه كلمتين 0..1 بين النص الخام + تعزيز صوتي.
export function wordSimilarity(a: string, b: string): number {
  const na = normalizeWord(a);
  const nb = normalizeWord(b);
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ratio = 1 - levenshtein(na, nb) / Math.max(na.length, nb.length);
  const sim = Math.max(0, ratio);
  if (phoneticKey(na) && phoneticKey(na) === phoneticKey(nb)) {
    return Math.max(sim, 0.85);
  }
  return sim;
}

interface Alignment {
  pairs: { exp: string; heard: string | null }[];
}

// محاذاة كلمات المتوقّع مع كلمات المنطوق عبر برمجة ديناميكية مع إمكانية الحذف/الإضافة.
function align(expected: string[], heard: string[]): Alignment {
  const m = expected.length;
  const n = heard.length;
  const DEL = 1; // كلمة متوقّعة لم تُنطق
  const INS = 0.5; // كلمة زائدة نُطقت
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) dp[i][0] = i * DEL;
  for (let j = 1; j <= n; j++) dp[0][j] = j * INS;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = dp[i - 1][j - 1] + (1 - wordSimilarity(expected[i - 1], heard[j - 1]));
      const del = dp[i - 1][j] + DEL;
      const ins = dp[i][j - 1] + INS;
      dp[i][j] = Math.min(sub, del, ins);
    }
  }
  const pairs: { exp: string; heard: string | null }[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sub = dp[i - 1][j - 1] + (1 - wordSimilarity(expected[i - 1], heard[j - 1]));
      if (Math.abs(dp[i][j] - sub) < 1e-9) {
        pairs.push({ exp: expected[i - 1], heard: heard[j - 1] });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + DEL)) < 1e-9) {
      pairs.push({ exp: expected[i - 1], heard: null });
      i--;
      continue;
    }
    j--;
  }
  pairs.reverse();
  return { pairs };
}

function statusFor(score: number): WordStatus {
  if (score >= 0.85) return "good";
  if (score >= 0.6) return "close";
  return "bad";
}

// يقيّم نطق النص المنطوق مقابل النص المتوقّع.
export function scorePronunciation(
  expectedText: string,
  heardText: string,
  threshold: number = DEFAULT_THRESHOLD
): PronunciationResult {
  const expected = tokenize(expectedText);
  const heard = tokenize(heardText);
  if (expected.length === 0) {
    return { score: 0, passed: false, words: [] };
  }
  const { pairs } = align(expected, heard);
  const words: WordScore[] = pairs.map(({ exp, heard: h }) => {
    const score = h === null ? 0 : wordSimilarity(exp, h);
    return { expected: exp, heard: h, score, status: statusFor(score) };
  });
  const total = words.reduce((acc, w) => acc + w.score, 0) / words.length;
  const score = Math.round(total * 100);
  return { score, passed: score >= threshold, words };
}
