"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useSync";
import { WORDS } from "@/data/words";
import { PLAN_META } from "@/lib/plan";
import { InstallButton } from "@/components/InstallButton";
import { AuthPanel } from "@/components/AuthPanel";
import { NewPasswordForm } from "@/components/NewPasswordForm";
import { AssistantSettings } from "@/components/AssistantSettings";
import { SyncStatus } from "@/components/SyncStatus";
import { UpdateCenter } from "@/components/UpdateCenter";
import { signOut } from "@/lib/auth";
import { getEnglishVoices, setPreferredVoice, speak, warmUpVoices, type VoiceInfo } from "@/lib/speech";
import { resizeImageToDataUrl } from "@/lib/avatar";
import { useT } from "@/hooks/useT";
import type { Lang } from "@/lib/i18n";

export default function SettingsPage() {
  const { settings, updateSettings, reset, profile, logout, updateProfile, backup, restore, freezeLeft, plan } =
    useProgress();
  const { t, lang } = useT();
  const { user, enabled, recovering } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const meta = profile ? PLAN_META[profile.level] : null;

  useEffect(() => {
    warmUpVoices();
    const load = () => setVoices(getEnglishVoices());
    const t = setTimeout(load, 0);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    synth?.addEventListener?.("voiceschanged", load);
    return () => {
      clearTimeout(t);
      synth?.removeEventListener?.("voiceschanged", load);
    };
  }, []);

  function setVoice(name: string) {
    updateSettings({ ...settings, voiceName: name });
    setPreferredVoice(name);
    if (name) setTimeout(() => speak("Invoice", { rate: settings?.voiceRate ?? 0.95 }), 60);
  }

  function handleExport() {
    const json = backup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `erp-vocab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const ok = restore(text);
    setImportMsg(ok ? t("set.importOk") : t("set.importBad"));
  }

  async function handleAvatar(file: File) {
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      updateProfile({ avatar: dataUrl });
      setAvatarMsg(null);
    } catch {
      setAvatarMsg(t("set.avatarBad"));
    }
  }

  function requestNotifyPermission() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("set.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("set.subtitle")}</p>
      </div>

      {profile && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold">{t("set.account")}</h2>
          <div className="mt-3 flex items-center gap-4">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-14 w-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                {profile.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold">{profile.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {meta ? `${meta.icon} ${lang === "en" ? meta.titleEn : meta.title}` : "—"} • {profile.xp} XP
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium">{t("set.avatar")}</div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("set.avatarHint")}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                onClick={() => avatarRef.current?.click()}
                className="rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {profile.avatar ? t("set.avatarChange") : t("set.avatarUpload")}
              </button>
              {profile.avatar && (
                <button
                  onClick={() => updateProfile({ avatar: undefined })}
                  className="rounded-xl border-2 border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950"
                >
                  {t("set.avatarRemove")}
                </button>
              )}
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAvatar(f);
                  e.target.value = "";
                }}
              />
            </div>
            {avatarMsg && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{avatarMsg}</p>}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium" htmlFor="profile-name">{t("set.editName")}</label>
            <input
              id="profile-name"
              defaultValue={profile.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== profile.name) updateProfile({ name: v });
              }}
              className="mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium" htmlFor="profile-age">{t("set.age")}</label>
              <input
                id="profile-age"
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                defaultValue={profile.age ?? ""}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v) && v > 0 && v <= 120 && v !== profile.age)
                    updateProfile({ age: v });
                }}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="profile-lang">{t("set.nativeLanguage")}</label>
              <select
                id="profile-lang"
                defaultValue={profile.nativeLanguage ?? "العربية"}
                onChange={(e) => updateProfile({ nativeLanguage: e.target.value })}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {["العربية", "English", "Français", "Türkçe", "أخرى"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="mt-4 rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("set.logout")}
            </button>
          ) : (
            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  setConfirmLogout(false);
                  try {
                    await signOut();
                  } catch {
                    // تجاهل أخطاء الشبكة — نكمل الخروج محليًا
                  }
                  logout();
                }}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t("set.logoutYes")}
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {t("common.cancel")}
              </button>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.cloudSync")}</h2>
        {!enabled ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t("set.syncUnavailable")}
          </p>
        ) : recovering && user ? (
          <div className="mt-3">
            <NewPasswordForm />
          </div>
        ) : user ? (
          <>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("set.loggedInAs")} <span dir="ltr" className="font-semibold">{user.email}</span>
            </p>
            <div className="mt-3">
              <SyncStatus showButton />
            </div>
            <button
              onClick={() => void signOut()}
              className="mt-4 rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("set.logoutAccount")}
            </button>
          </>
        ) : (
          <div className="mt-3">
            <AuthPanel />
          </div>
        )}
      </section>

      <AssistantSettings />

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.scheduleTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t("set.scheduleDesc", { n: plan?.reviewsPerDay ?? 10 })}
        </p>
        <label className="mt-3 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{t("set.scheduleEnable")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t("set.scheduleEnableDesc")}</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.scheduleEnabled ?? false}
            onChange={(e) => {
              const v = e.target.checked;
              if (v) requestNotifyPermission();
              updateSettings({ ...settings, scheduleEnabled: v });
            }}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>
        {settings?.scheduleEnabled && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium" htmlFor="sch-time">{t("set.reminderTime")}</label>
              <input
                id="sch-time"
                type="time"
                value={settings?.scheduleTime ?? "18:00"}
                onChange={(e) => updateSettings({ ...settings, scheduleTime: e.target.value })}
                className="mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="sch-dur">{t("set.alertDuration")}</label>
              <input
                id="sch-dur"
                type="number"
                min={5}
                max={120}
                step={5}
                value={settings?.scheduleDuration ?? 15}
                onChange={(e) =>
                  updateSettings({ ...settings, scheduleDuration: parseInt(e.target.value, 10) || 15 })
                }
                className="mt-1 w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.learning")}</h2>
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{t("set.autoPlay")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t("set.autoPlayDesc")}</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.autoPlay ?? true}
            onChange={(e) => updateSettings({ ...settings, autoPlay: e.target.checked })}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{t("set.showTranslation")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t("set.showTranslationDesc")}</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.showTranslation ?? true}
            onChange={(e) => updateSettings({ ...settings, showTranslation: e.target.checked })}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{t("set.welcomeSplash")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t("set.welcomeSplashDesc")}</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.welcomeSplash ?? true}
            onChange={(e) => updateSettings({ ...settings, welcomeSplash: e.target.checked })}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>
        <div>
          <div className="font-medium">{t("set.speechRate")}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t("set.speechRateDesc")}</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(
              [
                { label: t("set.rateSlow"), value: 0.8 },
                { label: t("set.rateNormal"), value: 0.95 },
                { label: t("set.rateFast"), value: 1.1 },
              ] as { label: string; value: number }[]
            ).map((r) => (
              <button
                key={r.value}
                onClick={() => updateSettings({ ...settings, voiceRate: r.value })}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  (settings?.voiceRate ?? 0.95) === r.value
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900 dark:bg-slate-900">
        <div>
          <h2 className="font-bold">{t("set.voiceTitle")}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("set.voiceDesc")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(() => {
            const maleVoice = voices.find((v) => v.gender === "male")?.name ?? "";
            const femaleVoice = voices.find((v) => v.gender === "female")?.name ?? "";
            const current = settings?.voiceName ?? "";
            const groups = [
              { id: "auto", label: t("set.voiceAuto"), target: "", active: !current },
              { id: "male", label: t("set.voiceMale"), target: maleVoice, active: !!current && current === maleVoice },
              { id: "female", label: t("set.voiceFemale"), target: femaleVoice, active: !!current && current === femaleVoice },
            ];
            return groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setVoice(g.target)}
                disabled={g.id !== "auto" && !g.target}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  g.active
                    ? "bg-sky-600 text-white"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {g.label}
              </button>
            ));
          })()}
        </div>
        <div>
          <label className="font-medium" htmlFor="voice-select">{t("set.voicePick")}</label>
          <select
            id="voice-select"
            value={settings?.voiceName ?? ""}
            onChange={(e) => setVoice(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">{t("set.voiceBest")}</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.gender === "male" ? "👨" : v.gender === "female" ? "👩" : "🔈"} {v.name} — {v.lang}
                {v.local ? "" : " ☁"}
              </option>
            ))}
          </select>
          {voices.length === 0 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {t("set.voiceNotLoaded")}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.languageTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("set.languageDesc")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              { id: "ar", label: t("set.langAr"), dir: "rtl" as const },
              { id: "en", label: t("set.langEn"), dir: "ltr" as const },
            ] as { id: Lang; label: string; dir: "rtl" | "ltr" }[]
          ).map((l) => (
            <button
              key={l.id}
              dir={l.dir}
              onClick={() => updateSettings({ ...settings, language: l.id })}
              className={`rounded-xl px-3 py-3 text-center font-semibold transition-colors ${
                (settings?.language ?? "ar") === l.id
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm dark:border-violet-900 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.appearance")}</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              { id: "system", label: t("set.themeSystem"), desc: t("set.themeSystemDesc") },
              { id: "light", label: t("set.themeLight"), desc: t("set.themeLightDesc") },
              { id: "dark", label: t("set.themeDark"), desc: t("set.themeDarkDesc") },
            ] as { id: "system" | "light" | "dark"; label: string; desc: string }[]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => updateSettings({ ...settings, theme: m.id })}
              className={`rounded-xl px-3 py-3 text-center transition-colors ${
                (settings?.theme ?? "system") === m.id
                  ? "bg-violet-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="block text-lg">{m.label.split(" ")[0]}</span>
              <span className="block text-sm font-semibold">{m.label.split(" ").slice(1).join(" ")}</span>
              <span className="block text-[10px] opacity-80">{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <UpdateCenter />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.about")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>{t("set.aboutWords")} <strong>{WORDS.length}</strong></li>
          <li>{t("set.aboutModules")}</li>
          <li>{t("set.aboutStorage")}</li>
          <li>{t("set.aboutSrs")}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.installTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("set.installDesc")}
        </p>
        <div className="mt-3">
          <InstallButton />
        </div>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>{t("set.installAndroid")}</li>
          <li>{t("set.installIphone")}</li>
          <li>{t("set.installDesktop")}</li>
          <li>{t("set.installSecure")}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-bold">{t("set.backupTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("set.backupDesc")}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {t("set.export")}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("set.import")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
        </div>
        {importMsg && <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{importMsg}</p>}
        <p className="mt-3 text-xs text-slate-400">
          {t("set.freezeLeft", { n: freezeLeft })}
        </p>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900 dark:bg-slate-900">
        <h2 className="font-bold text-rose-700 dark:text-rose-400">{t("set.dataTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {t("set.dataDesc")}
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-3 rounded-xl border-2 border-rose-500 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            {t("set.clearProgress")}
          </button>
        ) : (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                reset();
                setConfirmReset(false);
              }}
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            >
              {t("set.clearYes")}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}