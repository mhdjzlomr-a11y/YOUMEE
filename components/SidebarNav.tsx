"use client";

import {
  BarChart3,
  Bell,
  CalendarDays,
  Home,
  LayoutGrid,
  Plus,
  RotateCcw,
  User,
} from "lucide-react";
import type { MobileTab } from "@/lib/types";

interface SidebarNavProps {
  activeTab: MobileTab;
  unreadRemindersCount: number;
  onSelectTab: (tab: MobileTab) => void;
  onOpenNotifications: () => void;
  onOpenNewTask: () => void;
  onRestoreDefaults: () => void;
}

export function SidebarNav({
  activeTab,
  unreadRemindersCount,
  onSelectTab,
  onOpenNotifications,
  onOpenNewTask,
  onRestoreDefaults,
}: SidebarNavProps) {
  return (
    <>
      {/* Desktop / Tablet Vertical Cobalt Blue Rail */}
      <aside className="hidden lg:flex lg:w-[76px] lg:shrink-0 lg:flex-col lg:items-center lg:justify-between lg:rounded-[28px] lg:bg-gradient-to-b lg:from-[#3d68f7] lg:to-[#2952e3] lg:py-6 lg:text-white lg:shadow-lg lg:shadow-blue-600/20">
        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => onSelectTab("today")}
            className="text-center leading-tight tracking-tight"
          >
            <span className="block text-xs font-extrabold tracking-wider text-white">
              YOU
            </span>
            <span className="block text-xs font-extrabold tracking-wider text-blue-200">
              MEE
            </span>
          </button>

          <nav
            aria-label="Primary navigation"
            className="flex flex-col items-center gap-3"
          >
            <button
              type="button"
              onClick={() => onSelectTab("today")}
              aria-label="Dashboard Home"
              title="Dashboard Home"
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                activeTab === "today"
                  ? "bg-white text-[#2f5cf0] shadow-md"
                  : "text-blue-100 hover:bg-white/15"
              }`}
            >
              <Home className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("stats")}
              aria-label="Plans and Progress"
              title="Plans and Progress"
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                activeTab === "stats"
                  ? "bg-white text-[#2f5cf0] shadow-md"
                  : "text-blue-100 hover:bg-white/15"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Reminders and Push Notifications"
              title="Reminders and Push Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-blue-100 transition hover:bg-white/15"
            >
              <Bell className="h-5 w-5" />
              {unreadRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[10px] font-bold text-slate-900">
                  {unreadRemindersCount > 9 ? "9+" : unreadRemindersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("calendar")}
              aria-label="Calendar and Schedule"
              title="Calendar and Schedule"
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                activeTab === "calendar"
                  ? "bg-white text-[#2f5cf0] shadow-md"
                  : "text-blue-100 hover:bg-white/15"
              }`}
            >
              <CalendarDays className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onOpenNewTask}
              aria-label="Add New Task"
              title="Add New Task"
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-blue-100 transition hover:bg-white/15"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("profile")}
              aria-label="My Profile"
              title="My Profile"
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                activeTab === "profile"
                  ? "bg-white text-[#2f5cf0] shadow-md"
                  : "text-blue-100 hover:bg-white/15"
              }`}
            >
              <User className="h-5 w-5" />
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={onRestoreDefaults}
          aria-label="Restore default daily routine"
          title="Restore default daily routine"
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-blue-100 transition hover:bg-white/15"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-blue-100 bg-white/95 backdrop-blur-md pb-safe lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          <button
            type="button"
            onClick={() => onSelectTab("today")}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold transition ${
              activeTab === "today" ? "text-[#2f5cf0]" : "text-slate-400"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Today</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("stats")}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold transition ${
              activeTab === "stats" ? "text-[#2f5cf0]" : "text-slate-400"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Plans</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTask}
            aria-label="Add new task"
            className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3d68f7] to-[#2952e3] text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("calendar")}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold transition ${
              activeTab === "calendar" ? "text-[#2f5cf0]" : "text-slate-400"
            }`}
          >
            <CalendarDays className="h-5 w-5" />
            <span>Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("profile")}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold transition ${
              activeTab === "profile" ? "text-[#2f5cf0]" : "text-slate-400"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
