import type { ModuleId } from "@/types";
import { MODULE_MAP } from "@/data/modules";

export function ModuleBadge({ moduleId }: { moduleId: ModuleId }) {
  const m = MODULE_MAP[moduleId];
  if (!m) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.color}`}>
      <span>{m.icon}</span>
      {m.labelAr}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    A2: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    B1: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    B2: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    C1: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[level] ?? "bg-slate-100 text-slate-700"}`}>
      {level}
    </span>
  );
}

export function PoS({ pos }: { pos?: string }) {
  if (!pos) return null;
  const map: Record<string, string> = {
    noun: "اسم",
    verb: "فعل",
    "noun / verb": "اسم / فعل",
    adjective: "صفة",
    phrase: "عبارة",
  };
  return <span className="text-xs text-slate-500 dark:text-slate-400">{map[pos] ?? pos}</span>;
}