"use client";

import React from "react";
import { Logo } from "./Logo";

// شاشة البداية: الشعار في المنتصف + شريط تحميل.
// إن مُرّرت `children` (مثل رسالة الترحيب) تبقى حتى يضغط المستخدم، وإلا تختفي تلقائيًا.
export function SplashScreen({
  onDone,
  duration = 1400,
  interactive = false,
  children,
}: {
  onDone: () => void;
  duration?: number;
  interactive?: boolean;
  children?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (interactive) return;
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [onDone, duration, interactive]);

  const content = (
    <div className="erp-app splash" role="status" aria-label="Loading">
      <Logo variant="full" />
      {children}
      <div className="splash__bar" aria-hidden="true"><i /><i /></div>
    </div>
  );

  if (!interactive) return content;

  return (
    <button
      type="button"
      onClick={onDone}
      className="fixed inset-0 z-50 block w-full cursor-pointer border-0 bg-transparent p-0 text-start"
    >
      {content}
    </button>
  );
}
