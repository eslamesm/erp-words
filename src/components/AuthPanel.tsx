"use client";

import { useState } from "react";
import { sendReset, signIn, signUp } from "@/lib/auth";

type Mode = "signin" | "signup" | "reset";

interface Props {
  onLoggedIn?: () => void;
}

export function AuthPanel({ onLoggedIn }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const title =
    mode === "signin" ? "تسجيل الدخول" : mode === "signup" ? "إنشاء حساب" : "استعادة كلمة المرور";

  async function submit() {
    if (pending) return;
    setMsg(null);
    if (!email.trim()) {
      setMsg({ kind: "err", text: "أدخل البريد الإلكتروني." });
      return;
    }
    if (mode !== "reset" && password.length < 6) {
      setMsg({ kind: "err", text: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        const res = await signUp(email, password);
        if (!res.ok) {
          setMsg({ kind: "err", text: res.error ?? "تعذّر إنشاء الحساب." });
        } else if (res.needsConfirm) {
          setMsg({
            kind: "ok",
            text: "تم إنشاء حسابك ✓ تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.",
          });
          setMode("signin");
        } else {
          setMsg({ kind: "ok", text: "تم إنشاء حسابك وتسجيل الدخول ✓" });
          onLoggedIn?.();
        }
      } else if (mode === "signin") {
        const res = await signIn(email, password);
        if (!res.ok) {
          setMsg({ kind: "err", text: res.error ?? "تعذّر تسجيل الدخول." });
        } else {
          setMsg({ kind: "ok", text: "تم تسجيل الدخول ✓" });
          onLoggedIn?.();
        }
      } else {
        const res = await sendReset(email);
        setMsg(
          res.ok
            ? { kind: "ok", text: "أرسلنا رابط إعادة التعيين إلى بريدك ✓" }
            : { kind: "err", text: res.error ?? "تعذّر الإرسال." }
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <h3 className="text-lg font-bold">
          {mode === "signin" ? "🔐" : mode === "signup" ? "🆕" : "🔑"} {title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          مزامنة تقدّمك بين الجوال والحاسوب.
        </p>
      </div>

      <input
        type="email"
        inputMode="email"
        dir="ltr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-left outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />

      {mode !== "reset" && (
        <input
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-left outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      )}

      <button
        onClick={submit}
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "جارٍ…" : title}
      </button>

      {msg && (
        <p
          className={`text-center text-xs font-semibold ${
            msg.kind === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {mode !== "signin" && (
          <button onClick={() => { setMode("signin"); setMsg(null); }} className="hover:underline">
            لديّ حساب
          </button>
        )}
        {mode !== "signup" && (
          <button onClick={() => { setMode("signup"); setMsg(null); }} className="hover:underline">
            حساب جديد
          </button>
        )}
        {mode !== "reset" && (
          <button onClick={() => { setMode("reset"); setMsg(null); }} className="hover:underline">
            نسيت كلمة المرور
          </button>
        )}
      </div>
    </div>
  );
}
