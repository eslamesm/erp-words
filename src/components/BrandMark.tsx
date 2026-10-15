"use client";

import { useId } from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  withBackground?: boolean;
}

// شعار «ERP Words» — دمج الحرفين E و W بتصميم هندسي حديث.
export function BrandMark({ size = 40, className, withBackground = false }: BrandMarkProps) {
  const gradientId = useId();
  const stroke = withBackground ? "#FFFFFF" : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ERP Words"
      className={className}
    >
      {withBackground && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0F2C4D" />
              <stop offset="1" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
        </>
      )}
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18 L15 46" />
        <path d="M15 18 L30 18" />
        <path d="M15 32 L27 32" />
        <path d="M15 46 L30 46" />
        <path d="M33 18 L37.5 46 L42 31 L46.5 46 L51 18" />
      </g>
    </svg>
  );
}
