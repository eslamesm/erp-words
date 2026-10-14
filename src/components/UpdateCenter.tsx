"use client";

import { useEffect, useState } from "react";
import { useT } from "@/hooks/useT";
import {
  APP_VERSION,
  BUILD_TIME,
  applyUpdate,
  fetchLatestVersion,
  isNewer,
  type UpdateInfo,
} from "@/lib/version";

const LAST_CHECK_KEY = "erp:lastUpdateCheck";

function fmt(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function UpdateCenter() {
  const { t, lang } = useT();
  const [checking, setChecking] = useState(false);
  const [applying, setApplying] = useState(false);
  const [latest, setLatest] = useState<UpdateInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        setLastCheck(localStorage.getItem(LAST_CHECK_KEY));
      } catch {
        // تجاهل
      }
      setOnline(navigator.onLine);
    }, 0);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      clearTimeout(id);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const updateAvailable = checked && isNewer(latest?.version);
  const notes = latest?.notes?.[lang]?.length ? latest.notes[lang]! : latest?.notes?.ar ?? [];

  async function check() {
    setChecking(true);
    const info = await fetchLatestVersion();
    setLatest(info);
    setChecked(true);
    const now = new Date().toISOString();
    setLastCheck(now);
    try {
      localStorage.setItem(LAST_CHECK_KEY, now);
    } catch {
      // تجاهل
    }
    setChecking(false);
  }

  async function update() {
    setApplying(true);
    await applyUpdate();
  }

  return (
    <section className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm dark:border-teal-900 dark:bg-slate-900">
      <h2 className="font-bold">{t("upd.title")}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("upd.desc")}</p>

      <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
        <li>
          {t("upd.current")}: <span dir="ltr" className="font-semibold">{APP_VERSION}</span>
        </li>
        <li>
          {t("upd.builtAt")}: <span dir="ltr" className="font-semibold">{fmt(BUILD_TIME)}</span>
        </li>
        <li>
          {t("upd.lastCheck")}:{" "}
          <span dir="ltr" className="font-semibold">
            {lastCheck ? fmt(lastCheck) : t("upd.never")}
          </span>
        </li>
      </ul>

      {!online && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{t("upd.offline")}</p>
      )}

      {updateAvailable ? (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-950/40">
          <div className="font-semibold text-emerald-800 dark:text-emerald-300">
            {t("upd.available")}
            {latest?.version && (
              <span dir="ltr" className="ml-1 rounded-md bg-emerald-200/60 px-1.5 py-0.5 text-xs dark:bg-emerald-900/60">
                {latest.version}
              </span>
            )}
          </div>
          {notes.length > 0 ? (
            <div className="mt-2">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t("upd.whatsNew")}</div>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-emerald-700 dark:text-emerald-400">
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-emerald-700 dark:text-emerald-400">{t("upd.availableDesc")}</div>
          )}
        </div>
      ) : checked ? (
        <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {t("upd.upToDate")}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={check}
          disabled={checking || applying}
          className="rounded-xl border-2 border-teal-500 px-5 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 disabled:opacity-50 dark:text-teal-300 dark:hover:bg-teal-950"
        >
          {checking ? t("upd.checking") : t("upd.check")}
        </button>
        {updateAvailable && (
          <button
            onClick={update}
            disabled={applying}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {applying ? t("upd.applying") : t("upd.apply")}
          </button>
        )}
      </div>
    </section>
  );
}
