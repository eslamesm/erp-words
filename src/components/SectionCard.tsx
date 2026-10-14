"use client";

import Link from "next/link";

export function SectionCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-900 dark:text-white">{title}</span>
        {desc && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{desc}</span>}
      </span>
      <span className="self-center text-slate-300 dark:text-slate-600">‹</span>
    </Link>
  );
}
