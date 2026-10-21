"use client";

import type { MeetingDialogue as DialogueData, MeetingParticipant } from "@/types";
import { speak } from "@/lib/speech";
import { useT } from "@/hooks/useT";

// حوار الاجتماع: سطر لكل مشاركة مع اسمها ودورها وزر استماع.
// showAr = إظهار السطر العربي أسفله (يُستخدم في قسم الترجمة).
export function MeetingDialogue({
  dialogue,
  participants,
  showAr = false,
}: {
  dialogue: DialogueData;
  participants: MeetingParticipant[];
  showAr?: boolean;
}) {
  const { t, lang } = useT();
  const byId = new Map(participants.map((p) => [p.id, p]));

  return (
    <ol className="flex flex-col gap-3">
      {dialogue.lines.map((line, i) => {
        const speaker = byId.get(line.speaker);
        return (
          <li
            key={`${dialogue.id}-${i}`}
            className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {speaker ? (lang === "en" ? speaker.nameEn : speaker.nameAr) : line.speaker}
                </span>
                {speaker && (
                  <span className="me-2 text-[11px] text-slate-400">
                    {" · "}
                    {lang === "en" ? speaker.roleEn : speaker.roleAr}
                  </span>
                )}
              </div>
              <button
                onClick={() => speak(line.en)}
                aria-label={t("mtg.playLine")}
                className="shrink-0 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                🔊
              </button>
            </div>
            <p
              className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100"
              dir="ltr"
            >
              {line.en}
            </p>
            {showAr && (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300" dir="rtl">
                {line.ar}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
