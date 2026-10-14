"use client";

import { useEffect, useMemo, useState } from "react";
import { speak, stop } from "@/lib/speech";
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from "@/lib/recognition";
import { useT } from "@/hooks/useT";
import { useSwipeNav } from "@/hooks/useSwipeNav";

export interface DictationItem {
  id: string;
  text: string;
  hint?: string;
}

interface Props {
  items: DictationItem[];
  voiceRate: number;
  onFinish: (result: { correct: number; total: number }) => void;
}

type Method = "type" | "voice";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function Dictation({ items, voiceRate, onFinish }: Props) {
  const { t } = useT();
  const list = useMemo(() => items, [items]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [method, setMethod] = useState<Method>("type");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const voiceSupported = isSpeechRecognitionSupported();

  const current = list[index];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => speak(current.text, { rate: voiceRate }), 350);
    return () => {
      clearTimeout(t);
      stop();
    };
  }, [current, voiceRate]);

  useEffect(
    () => () => {
      stop();
      stopListening();
    },
    []
  );

  const swipe = useSwipeNav({
    enabled: checked !== null,
    onNext: () => next(),
    onPrev: () => goPrev(),
  });

  if (!current) return null;

  function grade(ok: boolean) {
    if (checked !== null) return;
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  }

  function check() {
    if (checked !== null) return;
    if (method === "type") grade(normalize(input) === normalize(current.text));
    else grade(normalize(transcript) === normalize(current.text));
  }

  function startMic() {
    if (checked !== null) return;
    setMicError(null);
    setTranscript("");
    setListening(true);
    startListening({
      lang: "en-US",
      onTranscript: (t, final) => {
        setTranscript(t.trim());
        if (final) {
          setListening(false);
          grade(normalize(t) === normalize(current.text));
        }
      },
      onError: (err) => {
        setListening(false);
        setMicError(err === "unsupported" ? "المتصفح لا يدعم التعرف الصوتي" : "تعذّر التقاط الصوت — جرّب كتابةً");
      },
      onEnd: () => setListening(false),
    });
  }

  function next() {
    if (index + 1 < list.length) {
      setIndex((i) => i + 1);
      setInput("");
      setChecked(null);
      setListening(false);
      setTranscript("");
      setMicError(null);
    } else {
      const finalScore = score;
      setFinished(true);
      onFinish({ correct: finalScore, total: list.length });
    }
  }

  function goPrev() {
    stopListening();
    if (index > 0) {
      setIndex((i) => i - 1);
      setInput("");
      setChecked(null);
      setListening(false);
      setTranscript("");
      setMicError(null);
    }
  }

  function switchMethod(m: Method) {
    if (m !== method) {
      stopListening();
      setMethod(m);
      setTranscript("");
      setChecked(null);
      setListening(false);
      setMicError(null);
    }
  }

  if (finished) {
    const pct = Math.round((score / Math.max(1, list.length)) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-6xl">{pct >= 80 ? "🎧" : "💪"}</div>
        <h2 className="text-2xl font-bold">انتهى التفقيط</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          أصبت <strong className="text-emerald-600 dark:text-emerald-400">{score}</strong> من{" "}
          <strong>{list.length}</strong> ({pct}%)
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setScore(0);
            setInput("");
            setChecked(null);
            setListening(false);
            setTranscript("");
            setMicError(null);
            setFinished(false);
          }}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          🔄 إعادة
        </button>
      </div>
    );
  }

  return (
    <div {...swipe} className="flex touch-pan-y flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          الجملة {index + 1} من {list.length}
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">أصبت: {score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${((index + (checked !== null ? 1 : 0)) / list.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => switchMethod("type")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            method === "type"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          ⌨️ كتابة
        </button>
        <button
          onClick={() => switchMethod("voice")}
          disabled={!voiceSupported}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            method === "voice"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          title={voiceSupported ? "تحدّث بالإنجليزية بدل الكتابة" : "غير مدعوم في هذا المتصفح"}
        >
          🎙️ تكلّم (نطق)
        </button>
      </div>

      <div
        className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {method === "voice" ? "🎧 اسمع، تكلّم، وسيقارن تطبيق النطق" : "🎧 اسمع واكتب ما تسمعه"}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => speak(current.text, { rate: voiceRate })}
            className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 text-white shadow transition-transform hover:scale-105"
          >
            🔊 تشغيل
          </button>
          <button
            onClick={() => speak(current.text, { rate: Math.min(1, voiceRate * 0.75) })}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            🐢 أبطأ
          </button>
        </div>

        {method === "type" ? (
          <input
            dir="ltr"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (checked !== null ? next() : check())}
            disabled={checked !== null}
            placeholder="اكتب الجملة بالإنجليزية..."
            className="mt-6 w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg outline-none transition-colors focus:border-emerald-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        ) : (
          <div className="mt-6">
            <button
              onClick={listening ? stopListening : startMic}
              disabled={checked !== null}
              className={`rounded-full px-8 py-3 text-lg font-bold transition-all ${
                listening
                  ? "animate-pulse bg-rose-600 text-white"
                  : checked !== null
                    ? "cursor-not-allowed border border-slate-300 text-slate-300 dark:border-slate-700"
                    : "border-2 border-rose-400 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950"
              }`}
            >
              {listening ? "⏹ توقف" : "🎤 اضغط وتحدّث"}
            </button>
            <div
              dir="ltr"
              className={`mt-4 min-h-[3.5rem] rounded-xl border-2 px-4 py-3 text-center text-lg transition-colors ${
                transcript
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                  : "border-dashed border-slate-300 text-slate-400 dark:border-slate-700"
              }`}
            >
              {transcript || (listening ? "…أسمعك، تكلّم بالإنجليزية" : "ستظهر كلماتك هنا")}
            </div>
            {micError && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{micError}</p>}
            {!voiceSupported && (
              <p className="mt-2 text-xs text-slate-400">هذا المتصفح لا يدعم التعرف الصوتي — استخدم وضع الكتابة.</p>
            )}
          </div>
        )}

        {checked !== null && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              checked
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            <div className="font-semibold">{checked ? "✓ أحسنت!" : "✗ الصحيح هو:"}</div>
            {!checked && (
              <p className="mt-1 font-medium" dir="ltr">
                {current.text}
              </p>
            )}
          </div>
        )}
      </div>

      {checked !== null && (
        <p className="text-center text-xs text-slate-400">{t("common.swipeNext")}</p>
      )}

      <div className="flex justify-center">
        <button
          onClick={checked !== null ? next : check}
          disabled={
            checked === null &&
            (method === "type" ? !input.trim() : !transcript.trim())
          }
          className="rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {checked !== null ? (index + 1 < list.length ? "التالي ←" : "إنهاء") : "تحقق"}
        </button>
      </div>
    </div>
  );
}