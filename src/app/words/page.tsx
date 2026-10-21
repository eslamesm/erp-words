"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Level, ModuleId, Word, WordProgress } from "@/types";
import { MODULES } from "@/data/modules";
import { subModulesByModule } from "@/data/subModules";
import { WORDS } from "@/data/words";
import { useProgress } from "@/hooks/useProgress";
import { LevelBadge, ModuleBadge, PoS } from "@/components/Badges";
import { speak } from "@/lib/speech";
import { romanize } from "@/lib/roman";

export default function WordsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">جارٍ التحميل...</div>}>
      <WordsContent />
    </Suspense>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function posCategory(pos?: string): "verb" | "noun" | "other" {
  const p = pos?.toLowerCase() ?? "";
  if (p.includes("verb")) return "verb";
  if (p.includes("noun")) return "noun";
  return "other";
}

function WordsContent() {
  const searchParams = useSearchParams();
  const initialModule = (searchParams.get("module") as ModuleId | null) ?? "all";
  const [module, setModule] = useState<ModuleId | "all">(initialModule);
  const [subModule, setSubModule] = useState<string | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [pos, setPos] = useState<"all" | "verb" | "noun">("all");
  const [query, setQuery] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [randomActive, setRandomActive] = useState(false);
  const [randomIds, setRandomIds] = useState<string[]>([]);
  const { bookmarks, progress, toggleSave, settings } = useProgress();
  const voiceRate = settings?.voiceRate ?? 0.95;

  const words = useMemo(() => {
    return WORDS.filter((w) => {
      if (module !== "all" && w.module !== module) return false;
      if (subModule !== "all" && w.subModuleId !== subModule) return false;
      if (level !== "all" && w.level !== level) return false;
      if (pos !== "all" && posCategory(w.partOfSpeech) !== pos) return false;
      if (onlySaved && !bookmarks.includes(w.id)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const text = `${w.english} ${w.arabic} ${w.definitionEn ?? ""} ${w.definitionAr ?? ""} ${w.synonyms ?? ""} ${w.tags ?? ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [module, subModule, level, pos, query, onlySaved, bookmarks]);

  const grouped = useMemo(() => {
    const groups = new Map<ModuleId, Word[]>();
    const knownModules = MODULES.map((m) => m.id);
    for (const m of knownModules) {
      const list = words.filter((w) => w.module === m);
      if (list.length) groups.set(m, list);
    }
    if (module === "all") {
      const rest = words.filter((w) => !knownModules.includes(w.module));
      if (rest.length) groups.set(rest[0].module, rest);
    }
    return groups;
  }, [words, module]);

  function randomize() {
    if (!words.length) return;
    setRandomIds(shuffle(words.map((w) => w.id)).slice(0, Math.min(10, words.length)));
    setRandomActive(true);
  }

  const randomWords = useMemo(() => {
    const map = new Map(words.map((w) => [w.id, w]));
    return randomIds.map((id) => map.get(id)).filter((w): w is Word => Boolean(w));
  }, [randomIds, words]);

  const levelChip = "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors";
  const levelOn = "bg-slate-900 text-white dark:bg-white dark:text-slate-900";
  const levelOff = "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">📚 المفردات</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          مجموع {WORDS.length} كلمة يمكنك الإبحار والبحث فيها.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 ابحث بالإنجليزية أو العربية..."
        className="rounded-2xl border-2 border-slate-300 px-5 py-3 outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setModule("all");
            setSubModule("all");
          }}
          className={`${levelChip} ${module === "all" ? levelOn : levelOff}`}
        >
          الكل
        </button>
        {MODULES.filter((m) => WORDS.some((w) => w.module === m.id)).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setModule(m.id);
              setSubModule("all");
            }}
            className={`${levelChip} ${module === m.id ? levelOn : levelOff}`}
          >
            {m.icon} {m.labelAr}
          </button>
        ))}
      </div>

      {module !== "all" && subModulesByModule(module).length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الوحدة الفرعية:</span>
          <button
            onClick={() => setSubModule("all")}
            className={`${levelChip} ${subModule === "all" ? levelOn : levelOff}`}
          >
            الكل
          </button>
          {subModulesByModule(module).map((s) => (
            <button
              key={s.id}
              onClick={() => setSubModule(s.id)}
              className={`${levelChip} ${subModule === s.id ? levelOn : levelOff}`}
            >
              {s.labelAr}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المستوى:</span>
        {(["all", "A1", "A2", "B1", "B2", "C1"] as const).map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv === "all" ? "all" : lv)}
            className={`${levelChip} ${level === lv ? levelOn : levelOff}`}
          >
            {lv === "all" ? "كل المستويات" : lv}
          </button>
        ))}
        <span className="mx-1 text-slate-300 dark:text-slate-600">|</span>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نوع الكلمة:</span>
        {(
          [
            { id: "all", label: "الكل" },
            { id: "verb", label: "فعل 🅰️" },
            { id: "noun", label: "اسم 🅰️" },
          ] as { id: "all" | "verb" | "noun"; label: string }[]
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setPos(p.id)}
            className={`${levelChip} ${pos === p.id ? levelOn : levelOff}`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={randomize}
          className={`${levelChip} border-2 border-amber-300 text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950`}
          title="عرض 10 كلمات عشوائية من النطاق الحالي"
        >
          🎲 كلمات عشوائية
        </button>
      </div>

      {(() => {
        const mistakes = words.filter((w) => (progress[w.id]?.lapses ?? 0) > 0);
        if (mistakes.length === 0) return null;
        const ids = mistakes.map((w) => w.id).join(",");
        return (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-rose-800 dark:text-rose-300">🔁 كلماتك الصعبة ({mistakes.length})</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  كلمات أخطأت فيها — مراجعتها قصيرة سترسّخها في ذاكرتك.
                </p>
              </div>
              <Link
                href={`/learn?ids=${ids}`}
                className="shrink-0 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              >
                راجعها كلها ←
              </Link>
            </div>
          </section>
        );
      })()}

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={onlySaved} onChange={(e) => setOnlySaved(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
        المحفوظة فقط ({bookmarks.length})
      </label>

      {randomActive && randomWords.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              🎲 كلمات عشوائية ({randomWords.length})
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                من النطاق المفلتر الحالي
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={randomize}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-600"
              >
                🎲 عشوائية جديدة
              </button>
              <Link
                href={`/learn?ids=${randomWords.map((w) => w.id).join(",")}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                🎴 ابدأ جلسة بهذه الكلمات
              </Link>
              <button
                onClick={() => setRandomActive(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                عرض القائمة الكاملة
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {randomWords.map((w) => (
              <WordCard
                key={`rand-${w.id}`}
                w={w}
                progress={progress[w.id]}
                bookmarked={bookmarks.includes(w.id)}
                voiceRate={voiceRate}
                onToggle={() => toggleSave(w.id)}
              />
            ))}
          </div>
        </section>
      )}

      {!randomActive &&
        Array.from(grouped.entries()).map(([mod, list]) => {
          const mastered = list.filter((w) => (progress[w.id]?.lapses ?? 0) >= 3).length;
          const pct = list.length ? Math.round((mastered / list.length) * 100) : 0;
          return (
            <section key={mod}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                {MODULES.find((m) => m.id === mod)?.icon} {MODULES.find((m) => m.id === mod)?.labelAr}
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {list.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  🏆 {mastered} متقنة ({pct}%)
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {list.map((w) => (
                  <WordCard
                    key={w.id}
                    w={w}
                    progress={progress[w.id]}
                    bookmarked={bookmarks.includes(w.id)}
                    voiceRate={voiceRate}
                    onToggle={() => toggleSave(w.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

      {words.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-500 dark:border-slate-700">
          لا توجد كلمات مطابقة. جرّب تغيير الفلترة أو البحث.
        </div>
      )}

      <Link href="/learn" className="mt-2 text-center font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
        🎴 ارجع إلى التعلم
      </Link>
    </div>
  );
}

function WordCard({
  w,
  progress,
  bookmarked,
  voiceRate,
  onToggle,
}: {
  w: Word;
  progress?: WordProgress;
  bookmarked: boolean;
  voiceRate: number;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold" dir="ltr">
            {w.english}
          </h3>
          <PoS pos={w.partOfSpeech} />
          {progress && progress.reps >= 5 && progress.interval >= 21 && <span title="أتقنت هذه الكلمة">🏆</span>}
        </div>
        <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">{w.arabic}</p>
        <p className="text-xs text-slate-400" dir="ltr">
          {romanize(w.arabic)}
        </p>
        {w.definitionEn && (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400" dir="ltr">
            {w.definitionEn}
          </p>
        )}
        {w.definitionAr && (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{w.definitionAr}</p>
        )}
        {w.note && (
          <p className="mt-1 text-xs leading-5 text-amber-600 dark:text-amber-400">💡 {w.note}</p>
        )}
        {w.examples[0] && (
          <p className="mt-1 flex max-w-2xl items-center justify-between gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400" dir="ltr">
            <span className="min-w-0 flex-1">{w.examples[0]}</span>
            <button
              onClick={() => speak(w.examples[0], { rate: voiceRate })}
              className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              title="استمع إلى الجملة"
            >
              🔊 جملة
            </button>
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <ModuleBadge moduleId={w.module} />
          <LevelBadge level={w.level} />
          {w.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => speak(w.english, { rate: voiceRate })}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          🔊
        </button>
        <button
          onClick={onToggle}
          className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
            bookmarked
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "border border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          }`}
        >
          {bookmarked ? "★ محفوظة" : "☆ حفظ"}
        </button>
      </div>
    </div>
  );
}