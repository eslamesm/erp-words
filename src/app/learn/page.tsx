"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ModuleId, Rating } from "@/types";
import { MODULES } from "@/data/modules";
import { WORDS } from "@/data/words";
import { isDue } from "@/lib/srs";
import { useProgress } from "@/hooks/useProgress";
import { Flashcard } from "@/components/Flashcard";

type Screen = "config" | "session" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">جارٍ التحميل...</div>}>
      <LearnContent />
    </Suspense>
  );
}

function LearnContent() {
  const searchParams = useSearchParams();
  const preset = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return null;
    const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const found = ids.map((id) => WORDS.find((w) => w.id === id)).filter((w): w is NonNullable<typeof w> => Boolean(w));
    return found.length > 0 ? found.map((w) => w.id) : null;
  }, [searchParams]);

  const { progress, rate, settings, notes, setNote } = useProgress();
  const [screen, setScreen] = useState<Screen>("config");
  const [module, setModule] = useState<ModuleId | "all">("all");
  const [count, setCount] = useState(10);
  const [deck, setDeck] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(0);
  const [retry, setRetry] = useState<string[]>([]);
  const [retryRoundDone, setRetryRoundDone] = useState(false);

  function buildDeck() {
    const filtered = WORDS.filter((w) => module === "all" || w.module === module);
    const withProgress = filtered.map((w) => ({ w, p: progress[w.id] }));
    const dueList = withProgress.filter((x) => !x.p || isDue(x.p)).map((x) => x.w);
    const rest = withProgress.filter((x) => x.p && !isDue(x.p)).map((x) => x.w);
    const pool = shuffle([...dueList, ...rest]).slice(0, Math.min(count, filtered.length));
    startSession(pool.map((w) => w.id));
  }

  function buildPresetDeck() {
    if (!preset) return;
    const pool = shuffle(preset);
    startSession(pool);
  }

  function startSession(ids: string[]) {
    setDeck(ids);
    setIndex(0);
    setSeen(0);
    setRetry([]);
    setRetryRoundDone(false);
    setScreen("session");
  }

  function handleRate(rating: Rating) {
    const id = deck[index];
    rate(id, rating);
    setSeen((s) => s + 1);
    const atEnd = index + 1 >= deck.length;

    if (rating === "again" && !retryRoundDone) {
      const remaining = deck.slice(index + 1);
      if (!remaining.includes(id) && !retry.includes(id)) {
        setRetry((q) => [...q, id]);
      }
    }

    if (atEnd) {
      if (retry.length > 0 && !retryRoundDone) {
        // جولة تلقائية لإعادة تعلم الكلمات التي نسيها المستخدم
        setDeck([...retry]);
        setRetry([]);
        setRetryRoundDone(true);
        setIndex(0);
      } else {
        setScreen("done");
      }
    } else {
      setIndex((i) => i + 1);
    }
  }

  const current = useMemo(() => {
    const id = deck[index];
    return WORDS.find((w) => w.id === id);
  }, [deck, index]);

  if (screen === "config") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">🎴 جلسة تعلّم</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            اختر الوحدة وعدد الكلمات. سنبدأ بالكلمات الأقدم في المراجعة تلقائيًا،
            وسنعيد تلقائيًا الكلمات التي تحددها «نسيته».
          </p>
        </div>

        {preset && preset.length > 0 && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div className="flex-1">
                <div className="font-bold">مراجعة كلمات مختارة ({preset.length})</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  قائمة يُرسلها المصدر (مثل «مراجعة الأخطاء»). اضغط للمراجعة مباشرة.
                </div>
              </div>
            </div>
            <button
              onClick={buildPresetDeck}
              className="mt-3 w-full rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              ابدأ مراجعة الكلمات المختارة ←
            </button>
          </section>
        )}

        <div>
          <h2 className="mb-3 font-bold">الوحدة</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModule("all")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                module === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              كل الوحدات
            </button>
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  module === m.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {m.icon} {m.labelAr}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-bold">عدد الكلمات</h2>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                  count === n
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={buildDeck}
          className="mt-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          ابدأ الجلسة ←
        </button>
      </div>
    );
  }

  if (screen === "done" || !current) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold">انتهت الجلسة!</h1>
        <p className="text-slate-600 dark:text-slate-300">
          راجعت <strong>{seen}</strong> كلمة في هذه الجلسة.
          {retryRoundDone && <span className="block text-emerald-600 dark:text-emerald-400">أعدتَ تعلّم الكلمات التي نسيتها تلقائيًا ✓</span>}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setScreen("config")}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            تغيير الإعدادات
          </button>
          <button
            onClick={preset ? buildPresetDeck : buildDeck}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            🔄 جلسة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          الكلمة {index + 1} من {deck.length}
        </span>
        <span className="flex items-center gap-2">
          {retry.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              🔁 إعادة تعلّم: {retry.length}
            </span>
          )}
          <span className="font-bold text-emerald-600">{seen} تمت مراجعتها</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(index / deck.length) * 100}%` }}
        />
      </div>
      <Flashcard
        key={current.id}
        word={current}
        onRate={handleRate}
        autoPlay={settings?.autoPlay ?? true}
        showTranslation={settings?.showTranslation ?? true}
        voiceRate={settings?.voiceRate ?? 0.95}
        note={notes[current.id] ?? ""}
        onSaveNote={(t) => setNote(current.id, t)}
      />
      {index + 1 === deck.length && deck.length > 0 && (
        <p className="text-center text-sm text-slate-400">هذه الكلمة الأخيرة في الجولة الحالية</p>
      )}
    </div>
  );
}