"use client";

import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Repeat,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  CATEGORY_META,
  formatTime12h,
  getWeekDateKeys,
  parseTimeMinutes,
} from "@/lib/storage";
import type { ResolvedDailyTask, TaskFilter } from "@/lib/types";

interface CalendarScheduleCardProps {
  selectedDate: string;
  todayKey: string;
  monthName: string;
  dateFull: string;
  tasks: ResolvedDailyTask[];
  totalCount: number;
  activeCount: number;
  completedCount: number;
  filter: TaskFilter;
  nowMinutes: number;
  onSelectDate: (dateKey: string) => void;
  onShiftWeek: (deltaDays: number) => void;
  onFilterChange: (filter: TaskFilter) => void;
  onToggle: (taskId: string) => void;
  onIncrementCount: (taskId: string, delta: number) => void;
  onResetCount: (taskId: string) => void;
  onEdit: (task: ResolvedDailyTask) => void;
  onDelete: (taskId: string) => void;
  onClearCompleted: () => void;
  onRestoreDefaults: () => void;
  onOpenNewTask: () => void;
}

function getCounterSteps(targetCount: number): number[] {
  if (targetCount >= 500) return [1, 10, 100];
  if (targetCount >= 30) return [1, 11];
  return [1];
}

export function CalendarScheduleCard({
  selectedDate,
  todayKey,
  monthName,
  dateFull,
  tasks,
  totalCount,
  activeCount,
  completedCount,
  filter,
  nowMinutes,
  onSelectDate,
  onShiftWeek,
  onFilterChange,
  onToggle,
  onIncrementCount,
  onResetCount,
  onEdit,
  onDelete,
  onClearCompleted,
  onRestoreDefaults,
  onOpenNewTask,
}: CalendarScheduleCardProps) {
  const weekDays = getWeekDateKeys(selectedDate);
  const isToday = selectedDate === todayKey;

  const filters: Array<{ id: TaskFilter; label: string; count: number }> = [
    { id: "all", label: "All", count: totalCount },
    { id: "active", label: "To Do", count: activeCount },
    { id: "completed", label: "Done", count: completedCount },
  ];

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_28px_rgba(37,99,235,0.06)]">
      {/* Cobalt Blue Card Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#3461f5] to-[#4b75ff] px-5 py-3.5 text-white">
        <h2 className="text-xs font-bold uppercase tracking-wider">
          MY CALENDAR
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onShiftWeek(-7)}
            aria-label="Previous week"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(todayKey)}
            className="rounded-xl bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30"
          >
            {isToday ? monthName : "Today"}
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(7)}
            aria-label="Next week"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Day Week Strip matching reference model */}
      <div className="border-b border-slate-100 px-3 py-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day) => {
            const selected = day.dateKey === selectedDate;
            const currentToday = day.dateKey === todayKey;
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => onSelectDate(day.dateKey)}
                className={`flex min-h-[54px] flex-col items-center justify-center rounded-2xl py-1.5 transition active:scale-95 ${
                  selected
                    ? "bg-[#3461f5] text-white shadow-md shadow-blue-600/25"
                    : currentToday
                      ? "bg-blue-50 text-[#2f5cf0]"
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`text-[10px] font-medium ${
                    selected ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {day.weekdayShort}
                </span>
                <span className="mt-0.5 font-mono text-sm font-bold">
                  {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Subtitle + Filter Pills */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {dateFull}
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-[11px] font-semibold text-slate-400 transition hover:text-[#2f5cf0]"
            >
              Uncheck done
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter scheduled tasks"
          className="mt-2.5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1"
        >
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(item.id)}
                className={`min-h-[34px] rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-white text-[#2f5cf0] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label} ({item.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronological Daily Schedule Timeline */}
      <div className="px-4 pt-2 pb-5">
        {tasks.length === 0 ? (
          <div className="my-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
            <p className="text-xs font-semibold text-slate-700">
              {totalCount === 0
                ? "No tasks on this day"
                : filter === "active"
                  ? "All tasks ticked off!"
                  : "No completed tasks yet"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {totalCount === 0 && (
                <button
                  type="button"
                  onClick={onRestoreDefaults}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Load Default Routine
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNewTask}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#3461f5] px-3 text-xs font-semibold text-white hover:bg-[#2952e3]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const catMeta = CATEGORY_META[task.category];
              const scheduledMins = parseTimeMinutes(task.time);
              const diff = scheduledMins - nowMinutes;
              const isDueSoon =
                isToday && !task.completed && diff >= 0 && diff <= 30;
              const hasTarget =
                typeof task.targetCount === "number" && task.targetCount > 0;
              const target = task.targetCount ?? 0;
              const pct = hasTarget
                ? Math.min(100, Math.round((task.count / target) * 100))
                : 0;

              return (
                <li
                  key={task.id}
                  className={`py-3 transition-colors ${
                    isDueSoon
                      ? "rounded-2xl bg-blue-50/60 px-2.5 -mx-2.5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Tactile Check-off Circle */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={task.completed}
                      aria-label={
                        task.completed
                          ? `Mark ${task.title} incomplete`
                          : `Mark ${task.title} complete`
                      }
                      onClick={() => onToggle(task.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition active:scale-90"
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          task.completed
                            ? "border-[#3461f5] bg-[#3461f5] text-white"
                            : isDueSoon
                              ? "border-[#3461f5] bg-white"
                              : "border-slate-300 bg-white hover:border-[#3461f5]"
                        }`}
                      >
                        {task.completed && (
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        )}
                      </span>
                    </button>

                    {/* Time • Colored Dot + Title */}
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {formatTime12h(task.time)}
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${catMeta.dotClass}`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            task.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-800"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        {task.note && <span>{task.note}</span>}
                        {isDueSoon && (
                          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-[#2f5cf0]">
                            Up next
                          </span>
                        )}
                        {task.repeatDaily && (
                          <span className="inline-flex items-center gap-0.5">
                            <Repeat className="h-2.5 w-2.5" />
                            Daily
                          </span>
                        )}
                        {task.reminderEnabled && !task.completed && (
                          <Bell className="h-2.5 w-2.5 text-[#3461f5]/70" />
                        )}
                      </div>

                      {/* Optional Tasbeeh / Salawat Counter */}
                      {hasTarget && (
                        <div className="mt-2 rounded-xl bg-slate-50 p-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-slate-700">
                              {task.count.toLocaleString()} /{" "}
                              {target.toLocaleString()}
                            </span>
                            <span className="font-mono font-semibold text-[#2f5cf0]">
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#3461f5] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            {getCounterSteps(target).map((step) => (
                              <button
                                key={step}
                                type="button"
                                onClick={() => onIncrementCount(task.id, step)}
                                className="min-h-[30px] rounded-lg border border-blue-200 bg-white px-2 font-mono text-[11px] font-bold text-[#2f5cf0] transition active:scale-95 hover:bg-blue-50"
                              >
                                +{step}
                              </button>
                            ))}
                            {task.count > 0 && (
                              <button
                                type="button"
                                onClick={() => onResetCount(task.id)}
                                className="ml-auto rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div className="flex shrink-0 items-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        aria-label={`Edit ${task.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
