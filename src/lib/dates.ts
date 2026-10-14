export const DAY_MS = 24 * 60 * 60 * 1000;

// مفتاح اليوم بصيغة YYYY-MM-DD (locale سويدي يضمن التنسيق)
export function dayKey(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("sv");
}

// إزاحة يوم محدد (حتمية، لا تعتمد على الوقت الحالي)
export function shiftDay(key: string, delta: number): string {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dt.toLocaleDateString("sv");
}

// مفتاح الأسبوع (حتمي لكل أسبوع) بصيغة W<n>
export function weekKey(offsetWeeks = 0): string {
  const d = new Date();
  if (offsetWeeks) d.setDate(d.getDate() + offsetWeeks * 7);
  const days = Math.floor(d.getTime() / DAY_MS);
  return `W${Math.floor(days / 7)}`;
}
