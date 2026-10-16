// دوال خالصة للتذكير اليومي (قابلة للاختبار بلا متصفح).
import type { WordProgress } from "@/types";
import { isDue } from "@/lib/srs";

// عدد الكلمات المستحقة الآن (جديدة لم تُراجع، أو حلّ موعد مراجعتها).
export function countDueWords(progress: Record<string, WordProgress> | null | undefined): number {
  if (!progress) return 0;
  return Object.values(progress).filter((p) => !p.reps || isDue(p)).length;
}

// دقائق من منتصف الليل للوقت الحالي.
export function minutesOfDay(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

// يحوّل "HH:MM" إلى دقائق من منتصف الليل، أو NaN عند القيمة غير الصالحة.
export function parseTime(hhmm: string | undefined): number {
  if (!hhmm || !hhmm.includes(":")) return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h)) return NaN;
  return (h % 24) * 60 + (Number.isFinite(m) ? m : 0);
}

// هل الوقت الحالي داخل نافذة التنبيه [البداية، البداية + المدة)؟ (تدعم عبور منتصف الليل)
export function inScheduleWindow(cur: number, start: number, duration: number): boolean {
  if (!Number.isFinite(start)) return false;
  const dur = Math.max(1, duration || 0);
  const end = start + dur;
  return end <= 1440 ? cur >= start && cur < end : cur >= start || cur < end - 1440;
}

// هل تجاوزنا وقت البداية اليوم؟ (للالتقاط إن فات الموعد والتطبيق مغلق)
export function atOrAfterStart(cur: number, start: number): boolean {
  return Number.isFinite(start) && cur >= start;
}
