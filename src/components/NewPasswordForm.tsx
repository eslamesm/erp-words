"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/auth";
import { endRecovery } from "@/hooks/useSync";
import { useT } from "@/hooks/useT";

/** نموذج كلمة مرور جديدة: يظهر بعد فتح رابط استعادة كلمة المرور من البريد. */
export function NewPasswordForm() {
  const { t } = useT();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit() {
    if (pending) return;
    setMsg(null);
    if (password.length < 6) {
      setMsg({ kind: "err", text: t("set.passwordTooShort") });
      return;
    }
    if (password !== confirm) {
      setMsg({ kind: "err", text: t("set.passwordMismatch") });
      return;
    }
    setPending(true);
    try {
      const res = await updatePassword(password);
      if (res.ok) {
        setMsg({ kind: "ok", text: t("set.passwordChanged") });
        setPassword("");
        setConfirm("");
        setTimeout(endRecovery, 1200);
      } else {
        setMsg({ kind: "err", text: res.error ?? t("set.passwordFailed") });
      }
    } finally {
      setPending(false);
    }
  }

  const input =
    "w-full rounded-xl border-2 border-slate-300 px-4 py-2.5 text-left outline-none transition-colors focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-center text-lg font-bold">{t("set.newPasswordTitle")}</h3>
      <label className="sr-only" htmlFor="new-password">{t("set.newPassword")}</label>
      <input
        id="new-password"
        type="password"
        dir="ltr"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("set.newPassword")}
        autoComplete="new-password"
        className={input}
      />
      <label className="sr-only" htmlFor="confirm-password">{t("set.confirmPassword")}</label>
      <input
        id="confirm-password"
        type="password"
        dir="ltr"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={t("set.confirmPassword")}
        autoComplete="new-password"
        className={input}
      />
      <button
        onClick={submit}
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? t("set.saving") : t("set.savePassword")}
      </button>
      {msg && (
        <p
          role="status"
          className={`text-center text-xs font-semibold ${
            msg.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {msg.text}
        </p>
      )}
      <button onClick={endRecovery} className="text-xs text-slate-500 hover:underline dark:text-slate-400">
        {t("set.skip")}
      </button>
    </div>
  );
}
