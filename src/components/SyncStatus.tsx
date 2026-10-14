"use client";

import { useAuth } from "@/hooks/useSync";
import { syncNow } from "@/lib/sync";

const LABELS: Record<string, string> = {
  off: "غير مربوط بحساب",
  connecting: "جارٍ الاتصال…",
  syncing: "جارٍ المزامنة…",
  synced: "متزامن",
  offline: "غير متصل",
  error: "تعذّرت المزامنة",
};

const ICONS: Record<string, string> = {
  off: "☁️",
  connecting: "⏳",
  syncing: "🔄",
  synced: "✅",
  offline: "📴",
  error: "⚠️",
};

export function SyncStatus({ showButton = false }: { showButton?: boolean }) {
  const { user, sync, enabled } = useAuth();
  if (!enabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <span>{ICONS[sync.status]}</span>
        {user ? LABELS[sync.status] : LABELS.off}
      </span>
      {showButton && user && (
        <button
          onClick={() => void syncNow()}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          زامن الآن
        </button>
      )}
    </div>
  );
}
