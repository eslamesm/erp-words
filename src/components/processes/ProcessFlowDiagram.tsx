"use client";

import type { ProcessStep } from "@/types";

// صورة استدلالية (SVG) تُولَّد من خطوات العملية — مخطط تدفّق رأسي بسيط.
// تُرسم بالكود (لا صور خارجية) وتدعم الوضع الليلي عبر أصناف Tailwind.
export function ProcessFlowDiagram({
  steps,
  acronym,
  titleEn,
}: {
  steps: Pick<ProcessStep, "titleAr" | "titleEn" | "order">[];
  acronym: string;
  titleEn: string;
}) {
  const width = 640;
  const rowH = 80;
  const padTop = 56;
  const height = padTop + steps.length * rowH + 8;
  const boxX = 74;
  const boxW = width - boxX - 20;
  const boxH = 58;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${acronym} — ${titleEn}`}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="pfd-accent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      <text x={boxX} y={26} className="fill-slate-900 dark:fill-white" fontSize={16} fontWeight={800}>
        {acronym}
      </text>
      <text
        x={boxX}
        y={44}
        className="fill-slate-500 dark:fill-slate-400"
        fontSize={12}
      >
        {titleEn}
      </text>

      {steps.length > 1 && (
        <line
          x1={34}
          y1={padTop + rowH / 2}
          x2={34}
          y2={padTop + (steps.length - 1) * rowH + rowH / 2}
          className="stroke-emerald-300 dark:stroke-emerald-800"
          strokeWidth={2}
        />
      )}

      {steps.map((s, i) => {
        const cy = padTop + i * rowH + rowH / 2;
        const boxY = cy - boxH / 2;
        return (
          <g key={s.order}>
            <circle cx={34} cy={cy} r={18} fill="url(#pfd-accent)" />
            <text
              x={34}
              y={cy + 5}
              textAnchor="middle"
              className="fill-white"
              fontSize={15}
              fontWeight={800}
            >
              {s.order}
            </text>

            <rect
              x={boxX}
              y={boxY}
              width={boxW}
              height={boxH}
              rx={14}
              className="fill-white stroke-emerald-200 dark:fill-slate-900 dark:stroke-emerald-900"
              strokeWidth={1.5}
            />

            <text x={boxX + 16} y={cy - 3} className="fill-slate-800 dark:fill-slate-100" fontSize={15} fontWeight={700}>
              {s.titleEn}
            </text>
            <text
              x={boxX + boxW - 16}
              y={cy + 16}
              textAnchor="end"
              direction="rtl"
              className="fill-slate-500 dark:fill-slate-400"
              fontSize={12}
            >
              {s.titleAr}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
