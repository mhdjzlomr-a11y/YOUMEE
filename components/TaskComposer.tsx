"use client";

import { useState } from "react";
import { Bell, Clock, Repeat, Tag, X } from "lucide-react";
import { CATEGORY_META } from "@/lib/storage";
import type { DailyTask, TaskCategory } from "@/lib/types";

export interface TaskFormValues {
  title: string;
  time: string;
  category: TaskCategory;
  repeatDaily: boolean;
  note: string;
  targetCount?: number;
  reminderEnabled: boolean;
}

interface TaskComposerProps {
  open: boolean;
  editingTask: DailyTask | null;
  defaultCategory?: TaskCategory;
  selectedDateLabel: string;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
}

const QUICK_TIMES = [
  { label: "04:30", value: "04:30" },
  { label: "06:30", value: "06:30" },
  { label: "09:00", value: "09:00" },
  { label: "13:15", value: "13:15" },
  { label: "18:30", value: "18:30" },
  { label: "21:00", value: "21:00" },
];

const CATEGORIES: TaskCategory[] = ["salah", "zikr", "quran", "personal"];

function getDefaultTimeSoon(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function TaskComposer({
  open,
  editingTask,
  defaultCategory,
  selectedDateLabel,
  onClose,
  onSave,
}: TaskComposerProps) {
  if (!open) return null;

  return (
    <TaskComposerForm
      key={editingTask?.id || `new-${defaultCategory || "personal"}`}
      editingTask={editingTask}
      defaultCategory={defaultCategory}
      selectedDateLabel={selectedDateLabel}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function TaskComposerForm({
  editingTask,
  defaultCategory,
  selectedDateLabel,
  onClose,
  onSave,
}: Omit<TaskComposerProps, "open">) {
  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [time, setTime] = useState(
    () => editingTask?.time ?? getDefaultTimeSoon()
  );
  const [category, setCategory] = useState<TaskCategory>(
    editingTask?.category ?? defaultCategory ?? "salah"
  );
  const [repeatDaily, setRepeatDaily] = useState(
    editingTask?.repeatDaily ?? true
  );
  const [note, setNote] = useState(editingTask?.note ?? "");
  const [targetInput, setTargetInput] = useState(
    editingTask?.targetCount ? String(editingTask.targetCount) : ""
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    editingTask?.reminderEnabled ?? true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const parsedTarget = Number.parseInt(targetInput.trim(), 10);
    const targetCount =
      Number.isFinite(parsedTarget) && parsedTarget > 0
        ? parsedTarget
        : undefined;

    onSave({
      title: trimmed,
      time: time || "09:00",
      category,
      repeatDaily,
      note: note.trim(),
      targetCount,
      reminderEnabled,
    });
  };

  const applyOffsetMinutes = (minsToAdd: number) => {
    const dt = new Date();
    dt.setMinutes(dt.getMinutes() + minsToAdd);
    setTime(
      `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-composer-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl pb-safe sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="task-composer-title"
            className="text-lg font-bold text-slate-900"
          >
            {editingTask ? "Edit Task" : "Add Plan / Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task form"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label
              htmlFor="task-title-input"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Task Name
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder="e.g., Zuha namaz, Salath 1000, Yaseen..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-base text-slate-900 outline-hidden transition focus:border-[#3461f5] focus:bg-white focus:ring-2 focus:ring-[#3461f5]/15"
            />
          </div>

          {/* Specific Time */}
          <div>
            <label
              htmlFor="task-time-input"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              <Clock className="h-3.5 w-3.5" />
              Scheduled Time
            </label>
            <input
              id="task-time-input"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 font-mono text-base font-semibold text-slate-900 outline-hidden transition focus:border-[#3461f5] focus:bg-white focus:ring-2 focus:ring-[#3461f5]/15"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyOffsetMinutes(15)}
                className="min-h-[32px] rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2f5cf0] transition active:scale-95 hover:bg-blue-100"
              >
                +15m
              </button>
              <button
                type="button"
                onClick={() => applyOffsetMinutes(60)}
                className="min-h-[32px] rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2f5cf0] transition active:scale-95 hover:bg-blue-100"
              >
                +1h
              </button>
              {QUICK_TIMES.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTime(preset.value)}
                  className={`min-h-[32px] rounded-xl border px-2.5 py-1 font-mono text-xs font-medium transition active:scale-95 ${
                    time === preset.value
                      ? "border-[#3461f5] bg-[#3461f5] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Tag className="h-3.5 w-3.5" />
              Category
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex min-h-[42px] items-center gap-2 rounded-2xl border px-3 text-xs font-semibold transition ${
                      selected
                        ? "border-[#3461f5] bg-blue-50 text-[#2f5cf0]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`}
                    />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repeat Schedule */}
          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Repeat className="h-3.5 w-3.5" />
              Schedule
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepeatDaily(true)}
                className={`min-h-[42px] rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                  repeatDaily
                    ? "border-[#3461f5] bg-blue-50 text-[#2f5cf0]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Repeat every day
              </button>
              <button
                type="button"
                onClick={() => setRepeatDaily(false)}
                className={`min-h-[42px] rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                  !repeatDaily
                    ? "border-[#3461f5] bg-blue-50 text-[#2f5cf0]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Only {selectedDateLabel}
              </button>
            </div>
          </div>

          {/* Optional Note + Counter Target */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="task-note-input"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Note (optional)
              </label>
              <input
                id="task-note-input"
                type="text"
                maxLength={80}
                placeholder="e.g., Morning, After Maghrib"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-hidden focus:border-[#3461f5] focus:bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="task-target-input"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Count Target
              </label>
              <input
                id="task-target-input"
                type="number"
                min={1}
                max={100000}
                inputMode="numeric"
                placeholder="e.g. 33"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900 outline-hidden focus:border-[#3461f5] focus:bg-white"
              />
            </div>
          </div>

          {/* Reminder Toggle */}
          <label className="flex min-h-[48px] cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Bell className="h-4 w-4 text-[#3461f5]" />
              Remind me at scheduled time
            </span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="h-5 w-5 rounded-md accent-[#3461f5]"
            />
          </label>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-[2] rounded-2xl bg-[#3461f5] px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-[#2952e3]"
            >
              {editingTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
