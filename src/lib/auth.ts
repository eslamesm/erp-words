import { getSupabase } from "@/lib/supabase";
import { clearProtectedContentCache } from "@/lib/protectedCache";

export interface AuthUser {
  id: string;
  email: string | null;
}

const ERROR_AR: Record<string, string> = {
  "Invalid login credentials": "البريد أو كلمة المرور غير صحيحة.",
  "Email not confirmed": "لم يتم تأكيد بريدك بعد. تحقق من صندوق الوارد.",
  "User already registered": "هذا البريد مسجّل بالفعل. جرّب تسجيل الدخول.",
  "Password should be at least 6 characters": "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
  "Signup requires a valid password": "أدخل كلمة مرور صالحة (6 أحرف على الأقل).",
  "New password should be different from the old password.": "كلمة المرور الجديدة يجب أن تختلف عن القديمة.",
  "Auth session missing!": "انتهت صلاحية رابط الاستعادة. اطلب رابطًا جديدًا.",
  "Unable to validate email address: invalid format": "صيغة البريد الإلكتروني غير صحيحة.",
};

function ar(message?: string): string {
  if (!message) return "حدث خطأ غير متوقع، حاول مرة أخرى.";
  return ERROR_AR[message] ?? message;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** عند التسجيل: صحيح إن كان يلزم تأكيد البريد قبل الدخول */
  needsConfirm?: boolean;
}

/** Public sign-up may only submit credentials; it can never submit role metadata. */
export function signUpCredentials(email: string, password: string) {
  return { email: email.trim(), password };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "المزامنة السحابية غير مهيأة." };
  const { data, error } = await sb.auth.signUp(signUpCredentials(email, password));
  if (error) return { ok: false, error: ar(error.message) };
  return { ok: true, needsConfirm: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "المزامنة السحابية غير مهيأة." };
  const { error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { ok: false, error: ar(error.message) };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  // Drop any cached admin HTML so a shared device cannot read it offline.
  clearProtectedContentCache();
}

export async function sendReset(email: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "المزامنة السحابية غير مهيأة." };
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined;
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) return { ok: false, error: ar(error.message) };
  return { ok: true };
}

/** يضبط كلمة مرور جديدة بعد فتح رابط الاستعادة (الجلسة المؤقتة تُنشأ تلقائيًا من الرابط). */
export async function updatePassword(password: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "المزامنة السحابية غير مهيأة." };
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { ok: false, error: ar(error.message) };
  return { ok: true };
}
