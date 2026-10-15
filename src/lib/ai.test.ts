import { describe, it, expect, vi, afterEach } from "vitest";
import {
  AiError,
  aiChat,
  classifyStatus,
  normalizeBaseUrl,
  normalizeModel,
  testConnection,
  type AiConfig,
} from "@/lib/ai";

const CFG: AiConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "sk-test",
  model: "gpt-4o-mini",
};

function okResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("classifyStatus", () => {
  it("maps HTTP status codes to user-facing error codes", () => {
    expect(classifyStatus(401)).toBe("unauthorized");
    expect(classifyStatus(403)).toBe("unauthorized");
    expect(classifyStatus(402)).toBe("payment");
    expect(classifyStatus(404)).toBe("model_not_found");
    expect(classifyStatus(408)).toBe("timeout");
    expect(classifyStatus(429)).toBe("rate_limit");
    expect(classifyStatus(500)).toBe("server");
    expect(classifyStatus(400)).toBe("bad_request");
  });
});

describe("normalizeModel", () => {
  it("prefixes bare model names for OpenRouter", () => {
    expect(normalizeModel("https://openrouter.ai/api/v1", "gpt-4o-mini")).toBe("openai/gpt-4o-mini");
  });

  it("keeps provider-qualified names intact", () => {
    expect(normalizeModel("https://openrouter.ai/api/v1", "meta-llama/llama-3.3:free")).toBe(
      "meta-llama/llama-3.3:free"
    );
  });

  it("does not touch names for OpenAI-compatible endpoints", () => {
    expect(normalizeModel("https://api.openai.com/v1", "gpt-4o-mini")).toBe("gpt-4o-mini");
  });
});

describe("normalizeBaseUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(normalizeBaseUrl("  https://api.openai.com/v1/  ")).toBe("https://api.openai.com/v1");
  });
});

describe("aiChat", () => {
  it("throws not_configured when the key is missing", async () => {
    await expect(aiChat([{ role: "user", content: "hi" }], { ...CFG, apiKey: "" })).rejects.toMatchObject({
      code: "not_configured",
    });
  });

  it("returns the assistant content on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(okResponse("Hello!"));
    await expect(aiChat([{ role: "user", content: "hi" }], CFG)).resolves.toBe("Hello!");
  });

  it("maps a 401 to unauthorized with provider detail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Invalid key" } }), { status: 401 })
    );
    await expect(aiChat([{ role: "user", content: "hi" }], CFG)).rejects.toMatchObject({
      code: "unauthorized",
      detail: "Invalid key",
    });
  });

  it("maps a 429 to rate_limit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 429 }));
    await expect(aiChat([{ role: "user", content: "hi" }], CFG)).rejects.toMatchObject({
      code: "rate_limit",
    });
  });

  it("maps a network failure to the network code", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const err = await aiChat([{ role: "user", content: "hi" }], CFG).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect((err as AiError).code).toBe("network");
  });

  it("times out and reports the timeout code", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as RequestInit).signal as AbortSignal;
          signal.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.name = "AbortError";
            reject(e);
          });
        })
    );
    const err = await aiChat([{ role: "user", content: "hi" }], CFG, { timeoutMs: 10 }).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect((err as AiError).code).toBe("timeout");
  });

  it("streams tokens through onToken", async () => {
    const sse =
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n' +
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n' +
      "data: [DONE]\n\n";
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sse));
        controller.close();
      },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(stream, { status: 200 })
    );
    const tokens: string[] = [];
    const full = await aiChat(
      [{ role: "user", content: "hi" }],
      CFG,
      { onToken: (t, whole) => tokens.push(`${t}|${whole}`) }
    );
    expect(full).toBe("Hello");
    expect(tokens).toEqual(["Hel|Hel", "lo|Hello"]);
  });
});

describe("testConnection", () => {
  it("uses the same chat/completions endpoint as the real chat", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(okResponse("OK"));
    await testConnection(CFG);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain("/chat/completions");
  });

  it("surfaces typed errors from the real endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "no credit" } }), { status: 402 })
    );
    await expect(testConnection(CFG)).rejects.toMatchObject({ code: "payment" });
  });
});
