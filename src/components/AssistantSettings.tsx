"use client";

import { useEffect, useState } from "react";
import { useT } from "@/hooks/useT";
import { aiChat, AiError, DEFAULT_AI, readAiConfig, writeAiConfig, type AiConfig } from "@/lib/ai";

export function AssistantSettings() {
  const { t, lang } = useT();
  const [cfg, setCfg] = useState<AiConfig>(DEFAULT_AI);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<null | "testing" | "ok" | string>(null);

  useEffect(() => {
    const id = setTimeout(() => setCfg(readAiConfig()), 0);
    return () => clearTimeout(id);
  }, []);

  function save(next: AiConfig) {
    setCfg(next);
    writeAiConfig(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function runTest() {
    setTest("testing");
    try {
      const reply = await aiChat(
        [{ role: "user", content: "Reply with the single word: OK" }],
        cfg
      );
      setTest(reply ? "ok" : "empty");
    } catch (e) {
      setTest(e instanceof AiError ? e.message : "error");
    }
  }

  const field =
    "mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900 dark:bg-slate-900">
      <h2 className="font-bold">{t("set.aiTitle")}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("set.aiDesc")}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium" htmlFor="ai-base">
            {t("set.aiBaseUrl")}
          </label>
          <input
            id="ai-base"
            dir="ltr"
            value={cfg.baseUrl}
            placeholder="https://api.openai.com/v1"
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
            placeholder="gpt-4o-mini"
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
            placeholder="sk-..."
            onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
            className={field}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">{t("set.aiKeyHint")}</p>

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
            {t("set.aiTestFail", { msg: test })}
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
