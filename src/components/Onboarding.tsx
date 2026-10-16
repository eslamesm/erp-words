"use client";

import { useState } from "react";
import type { Level } from "@/types";
import { PlacementTest } from "@/components/PlacementTest";
import { AuthPanel } from "@/components/AuthPanel";
import { supabaseEnabled } from "@/lib/supabase";
import { useAuth } from "@/hooks/useSync";

import { useT } from "@/hooks/useT";

interface Props {
  onCreate: (name: string, level: Level, age?: number, nativeLanguage?: string) => void;
}

type Step = "auth" | "profile" | "test";

const NATIVE_LANGUAGES = ["العربية", "English", "Français", "Türkçe", "أخرى"];

export function Onboarding({ onCreate }: Props) {
  const { user, sync } = useAuth();
  const { t } = useT();
  const [step, setStep] = useState<Step>("profile");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("العربية");
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const loggedIn = justLoggedIn || !!user;
  const resolving =
    loggedIn &&
    (sync.status === "off" || sync.status === "connecting" || sync.status === "syncing");
  const current: Step = step === "auth" && loggedIn ? "profile" : step;

  const ageNum = parseInt(age, 10);
  const ageOk = !Number.isNaN(ageNum) && ageNum > 0 && ageNum <= 120;
  const canContinue = name.trim().length > 0 && ageOk;

  function startTest() {
    if (!canContinue) return;
    setStep("test");
  }

  if (current === "test") {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold">{t("onb.testTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-indigo-50">
            {t("onb.testIntro", { name: name.trim() })}
          </p>
        </div>
        <PlacementTest
          name={name.trim()}
          onComplete={(level) => onCreate(name.trim(), level, ageNum, language)}
        />
      </div>
    );
  }

  if (current === "auth") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white shadow-lg">
          <div className="text-5xl">📘</div>
          <h1 className="mt-3 text-2xl font-bold">{t("onb.welcomeTitle")}</h1>
          <p className="mt-2 max-w-sm leading-7 text-emerald-50">
            {t("onb.welcomeDesc")}
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AuthPanel
            onLoggedIn={() => {
              setJustLoggedIn(true);
              setStep("profile");
            }}
          />
          <button
            onClick={() => setStep("profile")}
            className="mt-4 w-full rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("onb.skipAccount")}
          </button>
        </div>

        <p className="max-w-sm text-center text-xs text-slate-400">
          {t("onb.privacy")}
        </p>
      </div>
    );
  }

  if (resolving) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="text-4xl">⏳</div>
        <p className="font-semibold text-slate-600 dark:text-slate-300">
          {t("onb.restoring")}
        </p>
        <p className="text-xs text-slate-400">{t("onb.preparing")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white shadow-lg">
        <div className="text-5xl">{loggedIn ? "✓" : "👤"}</div>
        <h1 className="mt-3 text-2xl font-bold">
          {loggedIn ? t("onb.loggedIn") : t("onb.defineProfile")}
        </h1>
        <p className="mt-2 max-w-sm leading-7 text-emerald-50">
          {t("onb.profileDesc")}
        </p>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-sm font-bold" htmlFor="login-name">
          {t("onb.name")}
        </label>
        <input
          id="login-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startTest()}
          placeholder={t("onb.namePlaceholder")}
          className="mt-2 w-full rounded-xl border-2 border-slate-300 px-4 py-3 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <label className="mt-4 block text-sm font-bold" htmlFor="login-age">
          {t("onb.age")}
        </label>
        <input
          id="login-age"
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startTest()}
          placeholder={t("onb.agePlaceholder")}
          className="mt-2 w-full rounded-xl border-2 border-slate-300 px-4 py-3 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <label className="mt-4 block text-sm font-bold" htmlFor="login-lang">
          {t("onb.nativeLanguage")}
        </label>
        <select
          id="login-lang"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {NATIVE_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button
          onClick={startTest}
          disabled={!canContinue}
          className="mt-6 w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("onb.continueToTest")}
        </button>
        {supabaseEnabled && step === "profile" && !loggedIn && (
          <button
            onClick={() => setStep("auth")}
            className="mt-2 w-full rounded-xl py-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
          >
            {t("onb.backToLogin")}
          </button>
        )}
      </div>
    </div>
  );
}