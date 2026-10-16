"use client";

import React from "react";

// إن وُجد ملف الشعار الرسمي في public/brand/logo.svg يُستخدم تلقائيًا،
// وإلا يظهر الرسم المدمج بالأسفل.
const LOGO_SRC = "/brand/logo.svg";

type Variant = "icon" | "compact" | "full";

export function LogoMark({ size = 56 }: { size?: number }) {
  const [useFile, setUseFile] = React.useState(true);
  if (useFile) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={LOGO_SRC} width={size} height={size} alt="" onError={() => setUseFile(false)} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="ERP Words">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="lg-book" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path d="M8 84 L60 98 L112 84 L112 94 L60 112 L8 94 Z" fill="url(#lg-book)" />
      <path d="M14 78 L60 92 L106 78" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 30 C88 30 104 46 104 62 C104 80 86 90 66 90 L58 102 L52 90 C30 88 16 76 16 62 C16 44 34 30 60 30 Z" fill="url(#lg-ring)" />
      <path d="M60 38 C82 38 96 50 96 62 C96 76 82 84 64 84 L58 92 L54 84 C36 82 24 74 24 62 C24 50 38 38 60 38 Z" fill="#fff" />
      <rect x="34" y="46" width="52" height="34" rx="14" fill="#0b2e7a" />
      <path d="M45 63 Q50 56 55 63" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M65 63 Q70 56 75 63" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M60 8 L100 24 L60 38 L20 24 Z" fill="#0b2e7a" />
      <path d="M38 32 L38 42 Q60 50 82 42 L82 32 L60 40 Z" fill="#1d4ed8" />
      <line x1="94" y1="26" x2="94" y2="42" stroke="#0b2e7a" strokeWidth="3" />
      <circle cx="94" cy="44" r="3" fill="#0b2e7a" />
    </svg>
  );
}

export function Logo({ variant = "compact", tagline = "Learn English. Master ERP." }: { variant?: Variant; tagline?: string }) {
  if (variant === "icon") return <LogoMark size={40} />;

  if (variant === "compact") {
    return (
      <span className="logo logo--compact" dir="ltr">
        <LogoMark size={40} />
        <span className="logo__text">
          <span className="logo__word"><span className="erp">ERP</span> <span className="words">Words</span></span>
          <span className="logo__tag">{tagline}</span>
        </span>
      </span>
    );
  }

  return (
    <span className="logo logo--full" dir="ltr">
      <LogoMark size={150} />
      <span className="logo__word"><span className="erp">ERP</span> <span className="words">Words</span></span>
      <span className="logo__tag">{tagline}</span>
    </span>
  );
}
