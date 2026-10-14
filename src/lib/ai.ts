"use client";

// إعدادات الذكاء الاصطناعي تُخزّن محليًا على هذا الجهاز فقط ولا تُزامَن سحابيًا،
// حفاظًا على خصوصية مفتاح المستخدم وبياناته.

const KEY_AI = "erp-vocab:ai";

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const DEFAULT_AI: AiConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
};

export function readAiConfig(): AiConfig {
  if (typeof window === "undefined") return DEFAULT_AI;
  try {
    const raw = window.localStorage.getItem(KEY_AI);
    if (!raw) return DEFAULT_AI;
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return {
      baseUrl: parsed.baseUrl?.trim() || DEFAULT_AI.baseUrl,
      apiKey: parsed.apiKey ?? "",
      model: parsed.model?.trim() || DEFAULT_AI.model,
    };
  } catch {
    return DEFAULT_AI;
  }
}

export function writeAiConfig(cfg: AiConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_AI, JSON.stringify(cfg));
  } catch {
    // التخزين غير متاح
  }
}

export function isAiConfigured(cfg?: AiConfig): boolean {
  const c = cfg ?? readAiConfig();
  return Boolean(c.apiKey && c.baseUrl && c.model);
}

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiError extends Error {}

export async function aiChat(
  messages: AiChatMessage[],
  cfg: AiConfig,
  signal?: AbortSignal
): Promise<string> {
  if (!isAiConfigured(cfg)) throw new AiError("not_configured");
  const url = `${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: 0.6,
        max_tokens: 700,
      }),
      signal,
    });
  } catch (e) {
    throw new AiError(e instanceof Error ? e.message : "network_error");
  }
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = body.error.message;
    } catch {
      // تجاهل
    }
    throw new AiError(detail);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AiError("empty_response");
  return content;
}
