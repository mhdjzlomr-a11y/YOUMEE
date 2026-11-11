"use client";

import { Plus } from "lucide-react";
import { CATEGORY_META } from "@/lib/storage";
import type { TaskCategory } from "@/lib/types";

interface ChartsRowProps {
  dateBadge: string;
  completedCount: number;
  totalCount: number;
  stats: Record<
    TaskCategory,
    { total: number; completed: number; percentage: number }
  >;
  onAddTask: () => void;
}

export function ChartsRow({
  dateBadge,
  completedCount,
  totalCount,
  stats,
  onAddTask,
}: ChartsRowProps) {
  const overallPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Multi-segment donut math
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const allSegments: Array<{ key: TaskCategory; color: string; count: number }> =
    [
      { key: "salah", color: "#6366f1", count: stats.salah.total },
      { key: "zikr", color: "#34d399", count: stats.zikr.total },
      { key: "quran", color: "#fb7185", count: stats.quran.total },
      { key: "personal", color: "#f472b6", count: stats.personal.total },
    ];
  const segments = allSegments.filter((s) => s.count > 0);

  const segmentTotal = segments.reduce((sum, s) => sum + s.count, 0) || 1;
  let cumulativeOffset = 0;

  const progressBars: TaskCategory[] = ["salah", "zikr", "quran"];
  if (stats.personal.total > 0) {
    progressBars.push("personal");
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Left Card: Donut Breakdown */}
      <div className="rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(37,99,235,0.05)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            MY SCHEDULED TASKS
          </h2>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {dateBadge}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          {/* Multi-color SVG Donut Ring */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg
              viewBox="0 0 112 112"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              {segments.map((seg) => {
                const dashLen = (seg.count / segmentTotal) * circumference;
                const dashArray = `${Math.max(0, dashLen - 3)} ${circumference}`;
                const dashOffset = -cumulativeOffset;
                cumulativeOffset += dashLen;
                return (
                  <circle
                    key={seg.key}
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {overallPct}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Done
              </span>
            </div>
          </div>

          {/* Right Counts Column */}
          <div className="flex-1 space-y-2.5">
            {(["salah", "zikr", "quran"] as TaskCategory[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${CATEGORY_META[key].dotClass}`}
                  />
                  <span className="text-xs text-slate-500">
                    {CATEGORY_META[key].label}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {stats[key].total}
                </span>
              </div>
            ))}
            {stats.personal.total > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${CATEGORY_META.personal.dotClass}`}
                  />
                  <span className="text-xs text-slate-500">
                    {CATEGORY_META.personal.label}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {stats.personal.total}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Card: MY PLANS DONE + Dashed Add Task */}
      <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(37,99,235,0.05)]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              MY PLANS DONE
            </h2>
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {dateBadge}
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {progressBars.map((cat) => {
              const meta = CATEGORY_META[cat];
              const stat = stats[cat];
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {meta.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${meta.barClass}`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-2 text-xs font-semibold text-[#2f5cf0] transition hover:border-[#3b66f5] hover:bg-blue-50/50"
        >
          <span>Add plan</span>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
