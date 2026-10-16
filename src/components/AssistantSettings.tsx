"use client";

import { useEffect, useState } from "react";
import { useT } from "@/hooks/useT";
import {
  AiError,
  DEFAULT_AI,
  aiErrorMessageKey,
  readAiConfig,
  testConnection,
  writeAiConfig,
  type AiConfig,
  type AiErrorCode,
} from "@/lib/ai";

interface AiPreset {
  id: string;
  labelKey?: string;
  label?: string;
  baseUrl: string;
  model: string;
  keysUrl: string;
}

const PRESETS: AiPreset[] = [
  {
    id: "groq",
    label: "Groq · Free",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "openai/gpt-oss-120b",
    keysUrl: "https://console.groq.com/keys",
  },
  {
    id: "openrouter",
    label: "OpenRouter · Free",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    keysUrl: "https://openrouter.ai/keys",
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    keysUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "ollama",
    labelKey: "set.aiOllama",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.1",
    keysUrl: "https://ollama.com/download",
  },
];

export function AssistantSettings() {
  const { t, lang } = useT();
  const [cfg, setCfg] = useState<AiConfig>(DEFAULT_AI);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<
    null | "testing" | "ok" | { code: AiErrorCode; detail?: string }
  >(null);

  useEffect(() => {
    const id = setTimeout(() => setCfg(readAiConfig()), 0);
    return () => clearTimeout(id);
  }, []);

  function save(next: AiConfig) {
    const saved = writeAiConfig(next);
    setCfg(saved);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function applyPreset(p: AiPreset) {
    save({ ...cfg, baseUrl: p.baseUrl, model: p.model });
  }

  async function runTest() {
    setTest("testing");
    try {
      await testConnection(cfg);
      setTest("ok");
    } catch (e) {
      if (e instanceof AiError) setTest({ code: e.code, detail: e.detail });
      else setTest({ code: "unknown" });
    }
  }

  const field =
    "mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const keysUrl =
    PRESETS.find((p) => p.baseUrl.replace(/\/+$/, "") === cfg.baseUrl.replace(/\/+$/, ""))?.keysUrl ??
    PRESETS[0].keysUrl;

  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900 dark:bg-slate-900">
      <h2 className="font-bold">{t("set.aiTitle")}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("set.aiDesc")}</p>

      <div className="mt-4">
        <div className="text-sm font-medium">{t("set.aiProvider")}</div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("set.aiProviderHint")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => {
            const active = cfg.baseUrl.replace(/\/+$/, "") === p.baseUrl.replace(/\/+$/, "");
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-sky-600 text-white"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {p.label ?? t(p.labelKey!)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium" htmlFor="ai-base">
            {t("set.aiBaseUrl")}
          </label>
          <input
            id="ai-base"
            dir="ltr"
            value={cfg.baseUrl}
            placeholder="https://api.groq.com/openai/v1"
            onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="ai-model">
            {t("set.aiModel")}
          </label>
          <input
            id="ai-model"
            dir="ltr"
            value={cfg.model}
            placeholder="openai/gpt-oss-120b"
            onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="ai-key">
            {t("set.aiKey")}
          </label>
          <input
            id="ai-key"
            dir="ltr"
            type="password"
            autoComplete="off"
            value={cfg.apiKey}
            placeholder="gsk_... / sk-..."
            onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
            className={field}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {t("set.aiKeyHint")}{" "}
        <a
          href={keysUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sky-600 underline hover:text-sky-500 dark:text-sky-400"
        >
          {t("set.aiGetKey")}
        </a>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => save(cfg)}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
        >
          {t("set.aiSave")}
        </button>
        <button
          onClick={() => void runTest()}
          disabled={test === "testing" || !cfg.apiKey}
          className="rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {test === "testing" ? t("set.aiTesting") : t("set.aiTest")}
        </button>
        <button
          onClick={() => save({ ...DEFAULT_AI })}
          className="rounded-xl border-2 border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950"
        >
          {t("set.aiClear")}
        </button>
        {saved && <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("set.aiSaved")}</span>}
        {test === "ok" && <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("set.aiTestOk")}</span>}
        {test && test !== "ok" && test !== "testing" && (
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {t("set.aiTestFail", { msg: t(aiErrorMessageKey(test.code)) })}
            {test.detail ? ` — ${test.detail}` : ""}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {lang === "en"
          ? "Tip: any OpenAI-compatible endpoint works (OpenAI, Azure, OpenRouter, Groq, local Ollama…)."
          : "ملاحظة: يعمل أي مزوّد متوافق مع OpenAI (OpenAI، Azure، OpenRouter، Groq، Ollama المحلي…)."}
      </p>
    </section>
  );
}
