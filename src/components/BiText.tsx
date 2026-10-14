"use client";

import { useState } from "react";
import { useT } from "@/hooks/useT";

export function BiText({
  en,
  ar,
  className = "",
  arClassName = "",
}: {
  en: string;
  ar?: string;
  className?: string;
  arClassName?: string;
}) {
  const { t } = useT();
  const [showAr, setShowAr] = useState(false);
  const hasAr = Boolean(ar) && ar !== en;

  return (
    <span
      className={`${hasAr ? "cursor-pointer " : ""}${className}`}
      onDoubleClick={hasAr ? () => setShowAr((v) => !v) : undefined}
      title={hasAr ? t("paths.dblHint") : undefined}
    >
      {en}
      {hasAr && showAr ? (
        <span dir="rtl" className={`block ${arClassName}`}>
          {ar}
        </span>
      ) : null}
    </span>
  );
}
