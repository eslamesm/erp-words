"use client";

import { useAuth, useOnline } from "@/hooks/useSync";

export function CloudSync() {
  useAuth();
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      📴 أنت غير متصل — التطبيق يعمل محليًا، وستتم المزامنة تلقائيًا عند عودة الاتصال.
    </div>
  );
}
