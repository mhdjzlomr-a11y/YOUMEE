"use client";

import { MoreHorizontal } from "lucide-react";
import type { TaskCategory } from "@/lib/types";

interface MetricCardsRowProps {
  stats: Record<
    TaskCategory,
    { total: number; completed: number; percentage: number }
  >;
  onSelectCategory?: (category: TaskCategory) => void;
}

export function MetricCardsRow({
  stats,
  onSelectCategory,
}: MetricCardsRowProps) {
  const cards: Array<{
    key: TaskCategory;
    title: string;
    subtitle: string;
    stroke: string;
    badgeBg: string;
    badgeText: string;
    path: string;
    dotCx: number;
    dotCy: number;
  }> = [
    {
      key: "salah",
      title: "PRAYERS & NAMAZ",
      subtitle: "daily salah & nawafil",
      stroke: "#f87171",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-500",
      path: "M4 28 C 18 10, 32 8, 46 22 C 58 32, 70 26, 76 16",
      dotCx: 76,
      dotCy: 16,
    },
    {
      key: "zikr",
      title: "ZIKR & SALAWAT",
      subtitle: "awrad & tasbeeh",
      stroke: "#2dd4bf",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-600",
      path: "M4 30 C 20 29, 36 26, 48 20 C 60 15, 68 10, 76 6",
      dotCx: 76,
      dotCy: 6,
    },
    {
      key: "quran",
      title: "QURAN & SURAHS",
      subtitle: "daily recitation",
      stroke: "#6366f1",
      badgeBg: "bg-indigo-50",
      badgeText: "text-indigo-500",
      path: "M4 20 L 34 20 L 44 20 L 76 20",
      dotCx: 44,
      dotCy: 20,
    },
  ];

  return (
    <section
      aria-label="Daily progress summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {cards.map((card) => {
        const item = stats[card.key];
        return (
          <div
            key={card.key}
            className="rounded-3xl bg-white p-4 shadow-[0_8px_28px_rgba(37,99,235,0.05)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory?.(card.key)}
                aria-label={`View ${card.title}`}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              {/* Mini SVG Sparkline matching reference model */}
              <svg
                width="80"
                height="36"
                viewBox="0 0 80 36"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d={card.path}
                  stroke={card.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx={card.dotCx}
                  cy={card.dotCy}
                  r="4"
                  fill={card.stroke}
                />
              </svg>

              <div className="text-right">
                <div className="font-mono text-xl font-bold text-slate-900">
                  {item.completed}
                  <span className="text-sm font-medium text-slate-400">
                    /{item.total}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{card.subtitle}</p>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <span
                className={`rounded-lg px-2.5 py-0.5 font-mono text-[11px] font-semibold ${card.badgeBg} ${card.badgeText}`}
              >
                {item.percentage}% completed
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
