"use client";

import Link from "next/link";
import { ALPHABET, BLENDS, DIGRAPHS, VOWEL_TEAMS, type SoundGroup } from "@/data/phonics";
import { speak } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";
import { useT } from "@/hooks/useT";

export default function PhonicsPage() {
  const { t } = useT();
  const { settings } = useProgress();
  const rate = settings?.voiceRate ?? 0.95;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t("phonics.title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("phonics.subtitle")}</p>
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          💡 {t("phonics.limitNote")}
        </p>
      </div>

      <section>
        <h2 className="mb-1 text-xl font-bold">{t("phonics.letters")}</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t("phonics.lettersDesc")}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ALPHABET.map((l) => (
            <div
              key={l.letter}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {l.letter}
                  <span className="text-slate-400">{l.lower}</span>
                </span>
                <button
                  onClick={() => speak(l.name, { rate })}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t("phonics.name")}
                </button>
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("phonics.sound")}: <span className="font-mono text-emerald-600 dark:text-emerald-400">{l.ipa}</span>
              </div>
              <button
                onClick={() => speak(l.example, { rate })}
                className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-start transition-colors hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <span>
                  <span className="font-semibold text-slate-900 dark:text-white">{l.example}</span>
                  <span className="ms-2 text-sm text-slate-500 dark:text-slate-400">{l.exampleAr}</span>
                </span>
                <span>🔊</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <SoundSection title={t("phonics.digraphs")} desc={t("phonics.digraphsDesc")} groups={DIGRAPHS} rate={rate} />
      <SoundSection title={t("phonics.vowelTeams")} desc={t("phonics.vowelTeamsDesc")} groups={VOWEL_TEAMS} rate={rate} />
      <SoundSection title={t("phonics.blends")} desc={t("phonics.blendsDesc")} groups={BLENDS} rate={rate} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="font-bold">{t("phonics.practice")}</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("phonics.practiceDesc")}</p>
        <Link
          href="/pronounce"
          className="mt-4 inline-block rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          🎙️ {t("nav.pronounce")}
        </Link>
      </section>
    </div>
  );
}

function SoundSection({
  title,
  desc,
  groups,
  rate,
}: {
  title: string;
  desc: string;
  groups: SoundGroup[];
  rate: number;
}) {
  return (
    <section>
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {groups.map((g, i) => (
          <button
            key={`${g.sound}-${i}`}
            onClick={() => speak(g.example, { rate })}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-start transition-colors hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{g.sound}</span>
              <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{g.ipa}</span>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{g.example}</span>
              <span className="ms-2 text-slate-500 dark:text-slate-400">{g.exampleAr}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
