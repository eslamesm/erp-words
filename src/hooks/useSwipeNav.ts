"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";

interface SwipeOptions {
  onNext?: () => void;
  onPrev?: () => void;
  enabled?: boolean;
  threshold?: number;
}

export interface SwipeHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: () => void;
}

// تنقّل أفقي باللمس/الفأرة: السحب لليسار = التالي، ولليمين = السابق.
// يتجاهل السحب العمودي حتى لا يتعارض مع تمرير الصفحة.
export function useSwipeNav({
  onNext,
  onPrev,
  enabled = true,
  threshold = 50,
}: SwipeOptions): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown(e) {
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp(e) {
      const s = start.current;
      start.current = null;
      if (!s || !enabled) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx > 0) onPrev?.();
      else onNext?.();
    },
    onPointerCancel() {
      start.current = null;
    },
  };
}
