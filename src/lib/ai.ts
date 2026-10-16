"use client";

// إعدادات الذكاء الاصطناعي تُخزّن محليًا على هذا الجهاز فقط ولا تُزامَن سحابيًا،
// حفاظًا على خصوصية مفتاح المستخدم وبياناته.
//
// طبقة اتصال واحدة (unified) لكل من "اختبار الاتصال" والدردشة الحقيقية، حتى لا
// ينجح الاختبار بينما تفشل الدردشة. كل الأخطاء تُصنّف إلى رموز (codes) يعرضها
// الواجهة برسالة واضحة مع إمكانية إعادة المحاولة.

const KEY_AI = "erp-vocab:ai";

// موديلات Groq التي أُوقفت (2026) — أي إعداد محفوظ يستخدمها يُرحَّل تلقائيًا للبديل.
const RETIRED_GROQ_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
]);

// الافتراضي مزوّد بطبقة مجانية (Groq) — يكفي المستخدم إنشاء مفتاح مجاني دون بطاقة.
// بدون مفتاح يعمل المساعد المحلي تلقائيًا.
export const DEFAULT_AI: AiConfig = {
  baseUrl: "https://api.groq.com/openai/v1",
  apiKey: "",
  model: "openai/gpt-oss-120b",
};

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export type AiErrorCode =
  | "not_configured"
  | "unauthorized"
  | "payment"
  | "rate_limit"
  | "model_not_found"
  | "bad_request"
  | "server"
  | "network"
  | "timeout"
  | "aborted"
  | "empty"
  | "unknown";

export const AI_ERROR_CODES: AiErrorCode[] = [
  "not_configured",
  "unauthorized",
  "payment",
  "rate_limit",
  "model_not_found",
  "bad_request",
  "server",
  "network",
  "timeout",
  "aborted",
  "empty",
  "unknown",
];

export class AiError extends Error {
  code: AiErrorCode;
  status?: number;
  detail?: string;

  constructor(code: AiErrorCode, detail?: string, status?: number) {
    super(detail || code);
    this.name = "AiError";
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

/** يُصنّف رمز HTTP إلى رمز خطأ مفهوم للمستخدم. */
export function classifyStatus(status: number): AiErrorCode {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 402) return "payment";
  if (status === 404) return "model_not_found";
  if (status === 408 || status === 504) return "timeout";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  if (status >= 400) return "bad_request";
  return "unknown";
}

/** يوصل بروتوكول المزوّد لاسم الموديل الصحيح (مثل OpenRouter). */
export function normalizeModel(baseUrl: string, model: string): string {
  const m = (model || "").trim();
  if (!m) return m;
  const base = (baseUrl || "").toLowerCase();
  if (base.includes("openrouter.ai") && !m.includes("/")) return `openai/${m}`;
  return m;
}

/** ينظّف عنوان الـ Base URL من المسافات والشرطة المائلة الأخيرة. */
export function normalizeBaseUrl(baseUrl: string): string {
  return (baseUrl || "").trim().replace(/\/+$/, "");
}

export function readAiConfig(): AiConfig {
  if (typeof window === "undefined") return DEFAULT_AI;
  try {
    const raw = window.localStorage.getItem(KEY_AI);
    if (!raw) return DEFAULT_AI;
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    const baseUrl = parsed.baseUrl?.trim() || DEFAULT_AI.baseUrl;
    let model = parsed.model?.trim() || DEFAULT_AI.model;
    if (/groq\.com/i.test(baseUrl) && RETIRED_GROQ_MODELS.has(model)) {
      model = DEFAULT_AI.model;
    }
    return {
      baseUrl,
      apiKey: parsed.apiKey?.trim() || "",
      model,
    };
  } catch {
    return DEFAULT_AI;
  }
}

export function writeAiConfig(cfg: AiConfig): AiConfig {
  const baseUrl = normalizeBaseUrl(cfg.baseUrl) || DEFAULT_AI.baseUrl;
  const next: AiConfig = {
    baseUrl,
    apiKey: (cfg.apiKey || "").trim(),
    model: normalizeModel(baseUrl, (cfg.model || "").trim()),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY_AI, JSON.stringify(next));
    } catch {
      // التخزين غير متاح
    }
  }
  return next;
}

export function isAiConfigured(cfg?: AiConfig): boolean {
  const c = cfg ?? readAiConfig();
  return Boolean(c.apiKey && normalizeBaseUrl(c.baseUrl) && c.model);
}

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatOptions {
  signal?: AbortSignal;
  /** مهلة الاتصال بالميلي ثانية (افتراضي 30 ثانية). */
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
  /** عند تمريره يتم تفعيل البث ويُستدعى لكل جزء (الجزء + النص الكامل حتى الآن). */
  onToken?: (token: string, full: string) => void;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function combinedSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    },
  };
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string }; message?: string };
    return body?.error?.message || body?.message || "";
  } catch {
    return "";
  }
}

interface ChatMessage {
  content?: string;
  reasoning?: string;
}

// موديلات التفكير (مثل openai/gpt-oss على Groq) قد تضع الناتج في الحقل `reasoning`
// بدل `content` عندما لا يكفي حد الرموز؛ نقرأ الاثنين لتفادي ردّ فارغ خاطئ.
function pickReply(message?: ChatMessage): string {
  const content = (message?.content ?? "").trim();
  return content || (message?.reasoning ?? "").trim();
}

async function parseStream(
  res: Response,
  onToken: (token: string, full: string) => void
): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new AiError("empty");
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  let reasoning = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string; reasoning?: string } }[];
        };
        const delta = json.choices?.[0]?.delta;
        if (delta?.reasoning) reasoning += delta.reasoning;
        if (delta?.content) {
          full += delta.content;
          onToken(delta.content, full);
        }
      } catch {
        // تجاهل أجزاء غير مكتملة
      }
    }
  }
  return full.trim() || reasoning.trim();
}

/**
 * الدالة الموحّدة للاتصال بالموديل عبر أي مزوّد متوافق مع OpenAI.
 * تُستخدم لكل من الدردشة واختبار الاتصال.
 */
export async function aiChat(
  messages: AiChatMessage[],
  cfg: AiConfig,
  opts: AiChatOptions | AbortSignal = {}
): Promise<string> {
  const options: AiChatOptions =
    opts instanceof AbortSignal ? { signal: opts } : opts;

  if (!isAiConfigured(cfg)) throw new AiError("not_configured");

  const baseUrl = normalizeBaseUrl(cfg.baseUrl);
  const model = normalizeModel(baseUrl, cfg.model);
  const url = `${baseUrl}/chat/completions`;
  const { signal, cleanup } = combinedSignal(
    options.signal,
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 1024,
        ...(options.onToken ? { stream: true } : {}),
      }),
      signal,
    });
  } catch (e) {
    cleanup();
    const aborted =
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) {
      if (options.signal?.aborted) throw new AiError("aborted");
      throw new AiError("timeout");
    }
    // أخطاء الشبكة أو CORS تضهر كـ TypeError من fetch.
    throw new AiError("network", e instanceof Error ? e.message : undefined);
  }

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    cleanup();
    console.error(`[ai] ${res.status} ${url}`, detail || "(no detail)");
    throw new AiError(classifyStatus(res.status), detail || undefined, res.status);
  }

  try {
    if (options.onToken) {
      // إن أعاد المزوّد JSON عاديًا (لا يدعم البث) نقرأه مباشرة بدل إعادة الطلب
      // حتى لا يُستهلك رصيد المستخدم مرتين.
      const type = res.headers.get("content-type") ?? "";
      if (type.includes("application/json")) {
        const data = (await res.json()) as {
          choices?: { message?: ChatMessage }[];
        };
        const content = pickReply(data.choices?.[0]?.message);
        if (!content) throw new AiError("empty");
        options.onToken(content, content);
        return content;
      }
      // جرّب البث، وإن فشلت قراءته أعد الطلب بدون بث كملاذ أخير.
      let full = "";
      try {
        full = await parseStream(res, options.onToken);
      } catch {
        full = "";
      }
      if (!full) {
        return await aiChat(messages, cfg, {
          signal: options.signal,
          timeoutMs: options.timeoutMs,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        });
      }
      return full;
    }
    const data = (await res.json()) as {
      choices?: { message?: ChatMessage }[];
    };
    const content = pickReply(data.choices?.[0]?.message);
    if (!content) throw new AiError("empty");
    return content;
  } finally {
    cleanup();
  }
}

/**
 * اختبار الاتصال يستخدم نفس مسار الدردشة الفعلي (chat/completions) بالموديل
 * المحفوظ نفسه، حتى يعكس حال الاتصال الحقيقي.
 */
export async function testConnection(cfg: AiConfig): Promise<void> {
  await aiChat(
    [
      {
        role: "user",
        content: "Reply with the single word: OK",
      },
    ],
    cfg,
    { timeoutMs: 20_000, maxTokens: 512, temperature: 0 }
  );
}

/** مفتاح ترجمة رسالة الخطأ (يُستخدم في الواجهة عبر t()). */
export function aiErrorMessageKey(code: AiErrorCode): string {
  return `assist.err.${code}`;
}
