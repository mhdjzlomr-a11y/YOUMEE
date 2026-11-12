"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Bell,
  BellOff,
  Download,
  Plus,
  RotateCcw,
  Search,
  Settings,
  X,
} from "lucide-react";
import { createSeedTasks } from "@/lib/defaultTasks";
import {
  getExistingPushSubscription,
  getNotificationEnvironment,
  registerServiceWorker,
  showLocalNotification,
  subscribeDeviceToPush,
  unsubscribeDeviceFromPush,
  type NotificationEnvironment,
} from "@/lib/notifications";
import {
  NOTIF_PREFS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  computeCategoryStats,
  countActiveStreak,
  filterResolvedTasks,
  formatDateLabel,
  formatTime12h,
  getLocalDateKey,
  loadNotificationPrefs,
  loadNotifiedMap,
  loadTaskStore,
  loadUserProfile,
  parseTimeMinutes,
  resolveTasksForDate,
  saveNotificationPrefs,
  saveNotifiedMap,
  saveTaskStore,
  saveUserProfile,
  shiftDateKey,
} from "@/lib/storage";
import type {
  DailyTask,
  MobileTab,
  NotificationPrefs,
  ResolvedDailyTask,
  TaskCategory,
  TaskFilter,
  TaskStore,
  UserProfile,
} from "@/lib/types";
import { CalendarScheduleCard } from "./CalendarScheduleCard";
import { ChartsRow } from "./ChartsRow";
import { HeroBanner } from "./HeroBanner";
import { InstallBanner } from "./InstallBanner";
import { MetricCardsRow } from "./MetricCardsRow";
import { NotificationSheet } from "./NotificationSheet";
import { ProfileCard } from "./ProfileCard";
import { SidebarNav } from "./SidebarNav";
import { TaskComposer, type TaskFormValues } from "./TaskComposer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const emptySubscribe = () => () => {};

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatCurrentTimeLabel(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DailyTrackerApp() {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isHydrated) {
    return <DashboardSkeleton />;
  }

  return <DailyTrackerClient />;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-[#eef2fb] p-3 sm:p-5">
      <div className="mx-auto flex max-w-7xl gap-5">
        <div className="hidden h-[640px] w-[76px] rounded-[28px] bg-[#3461f5]/25 lg:block" />
        <div className="flex-1 space-y-4">
          <div className="h-12 rounded-2xl bg-white/80" />
          <div className="h-44 rounded-3xl bg-[#3461f5]/20" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-32 rounded-3xl bg-white" />
            <div className="h-32 rounded-3xl bg-white" />
            <div className="h-32 rounded-3xl bg-white" />
          </div>
        </div>
        <div className="hidden w-[340px] space-y-4 lg:block">
          <div className="h-56 rounded-3xl bg-white" />
          <div className="h-96 rounded-3xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function DailyTrackerClient() {
  const [store, setStore] = useState<TaskStore>(() => loadTaskStore());
  const [prefs, setPrefs] = useState<NotificationPrefs>(() =>
    loadNotificationPrefs()
  );
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [todayKey, setTodayKey] = useState<string>(() => getLocalDateKey());
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getLocalDateKey()
  );
  const [nowMinutes, setNowMinutes] = useState<number>(() =>
    getCurrentMinutes()
  );
  const [clockLabel, setClockLabel] = useState<string>(() =>
    formatCurrentTimeLabel()
  );

  const [activeTab, setActiveTab] = useState<MobileTab>("today");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [defaultCategory, setDefaultCategory] =
    useState<TaskCategory>("salah");
  const [notifOpen, setNotifOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [notifEnv, setNotifEnv] = useState<NotificationEnvironment>(() =>
    getNotificationEnvironment()
  );
  const [hasPushSubscription, setHasPushSubscription] = useState(false);

  const updateStore = useCallback(
    (updater: (prev: TaskStore) => TaskStore) => {
      setStore((prev) => {
        const next = updater(prev);
        saveTaskStore(next);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    registerServiceWorker().then(async () => {
      const sub = await getExistingPushSubscription();
      if (mounted) {
        setHasPushSubscription(Boolean(sub));
        setNotifEnv(getNotificationEnvironment());
      }
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setNotifEnv(getNotificationEnvironment());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TASKS_STORAGE_KEY) {
        setStore(loadTaskStore());
      } else if (event.key === NOTIF_PREFS_STORAGE_KEY) {
        setPrefs(loadNotificationPrefs());
      } else if (event.key === PROFILE_STORAGE_KEY) {
        setProfile(loadUserProfile());
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const checkDueReminders = async () => {
      const currentDayKey = getLocalDateKey();
      const currentMins = getCurrentMinutes();
      setTodayKey((prev) => (prev === currentDayKey ? prev : currentDayKey));
      setNowMinutes(currentMins);
      setClockLabel(formatCurrentTimeLabel());

      if (!prefs.remindersEnabled) return;
      if (
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const todayTasks = resolveTasksForDate(store, currentDayKey);
      const notifiedMap = loadNotifiedMap();
      let changed = false;

      for (const task of todayTasks) {
        if (task.completed || !task.reminderEnabled) continue;
        const triggerMin = parseTimeMinutes(task.time) - prefs.leadMinutes;
        if (currentMins >= triggerMin && currentMins <= triggerMin + 2) {
          const dedupeKey = `${currentDayKey}::${task.id}::${task.time}::${prefs.leadMinutes}`;
          if (!notifiedMap[dedupeKey]) {
            const whenText =
              prefs.leadMinutes > 0
                ? `Scheduled in ${prefs.leadMinutes}m (${formatTime12h(task.time)})`
                : `Scheduled for ${formatTime12h(task.time)}`;
            const body = task.note ? `${whenText} · ${task.note}` : whenText;
            const sent = await showLocalNotification({
              title: `YOUMEE: ${task.title}`,
              body,
              tag: `youmee-task-${task.id}-${currentDayKey}`,
            });
            if (sent) {
              notifiedMap[dedupeKey] = new Date().toISOString();
              changed = true;
            }
          }
        }
      }

      if (changed) {
        saveNotifiedMap(notifiedMap);
      }
    };

    void checkDueReminders();
    const intervalId = window.setInterval(() => {
      void checkDueReminders();
    }, 20_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkDueReminders();
        setNotifEnv(getNotificationEnvironment());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [store, prefs]);

  const resolvedTasks = useMemo(
    () => resolveTasksForDate(store, selectedDate),
    [store, selectedDate]
  );

  const searchedTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resolvedTasks;
    return resolvedTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.note && task.note.toLowerCase().includes(q))
    );
  }, [resolvedTasks, searchQuery]);

  const filteredTasks = useMemo(
    () => filterResolvedTasks(searchedTasks, filter),
    [searchedTasks, filter]
  );

  const categoryStats = useMemo(
    () => computeCategoryStats(resolvedTasks),
    [resolvedTasks]
  );

  const completedCount = useMemo(
    () => resolvedTasks.filter((t) => t.completed).length,
    [resolvedTasks]
  );

  const totalCount = resolvedTasks.length;
  const activeCount = totalCount - completedCount;

  const filteredTotal = searchedTasks.length;
  const filteredCompleted = searchedTasks.filter((t) => t.completed).length;
  const filteredActive = filteredTotal - filteredCompleted;

  const streakDays = useMemo(
    () => countActiveStreak(store, todayKey),
    [store, todayKey]
  );

  const isToday = selectedDate === todayKey;
  const {
    badge: dateBadge,
    full: dateFull,
    monthName,
  } = useMemo(
    () => formatDateLabel(selectedDate, todayKey),
    [selectedDate, todayKey]
  );

  const nextTaskLabel = useMemo(() => {
    if (!isToday) return null;
    const next = resolvedTasks.find(
      (t) => !t.completed && parseTimeMinutes(t.time) >= nowMinutes
    );
    const fallback = next || resolvedTasks.find((t) => !t.completed);
    return fallback ? `${fallback.title} (${formatTime12h(fallback.time)})` : null;
  }, [isToday, resolvedTasks, nowMinutes]);

  const handleToggleTask = useCallback(
    (taskId: string) => {
      updateStore((prev) => {
        const dayMap = prev.completionsByDate[selectedDate] || {};
        const current = dayMap[taskId];
        const taskDef = prev.tasks.find((t) => t.id === taskId);
        const nextCompleted = !current?.completed;
        const target = taskDef?.targetCount;

        const nextCount = target
          ? nextCompleted
            ? Math.max(current?.count ?? 0, target)
            : 0
          : current?.count;

        return {
          ...prev,
          completionsByDate: {
            ...prev.completionsByDate,
            [selectedDate]: {
              ...dayMap,
              [taskId]: {
                completed: nextCompleted,
                completedAt: nextCompleted
                  ? new Date().toISOString()
                  : undefined,
                count: nextCount,
              },
            },
          },
        };
      });
    },
    [selectedDate, updateStore]
  );

  const handleIncrementCount = useCallback(
    (taskId: string, delta: number) => {
      updateStore((prev) => {
        const dayMap = prev.completionsByDate[selectedDate] || {};
        const current = dayMap[taskId];
        const taskDef = prev.tasks.find((t) => t.id === taskId);
        const target = taskDef?.targetCount ?? 0;
        const nextCount = Math.max(0, (current?.count ?? 0) + delta);
        const reachedTarget = target > 0 && nextCount >= target;
        const completed = Boolean(current?.completed || reachedTarget);

        return {
          ...prev,
          completionsByDate: {
            ...prev.completionsByDate,
            [selectedDate]: {
              ...dayMap,
              [taskId]: {
                completed,
                completedAt: completed
                  ? current?.completedAt || new Date().toISOString()
                  : undefined,
                count: nextCount,
              },
            },
          },
        };
      });
    },
    [selectedDate, updateStore]
  );

  const handleResetCount = useCallback(
    (taskId: string) => {
      updateStore((prev) => {
        const dayMap = prev.completionsByDate[selectedDate] || {};
        return {
          ...prev,
          completionsByDate: {
            ...prev.completionsByDate,
            [selectedDate]: {
              ...dayMap,
              [taskId]: {
                completed: false,
                completedAt: undefined,
                count: 0,
              },
            },
          },
        };
      });
    },
    [selectedDate, updateStore]
  );

  const handleSaveTask = useCallback(
    (values: TaskFormValues) => {
      const nowIso = new Date().toISOString();

      if (editingTask) {
        updateStore((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === editingTask.id
              ? {
                  ...t,
                  title: values.title,
                  time: values.time,
                  category: values.category,
                  repeatDaily: values.repeatDaily,
                  date: values.repeatDaily
                    ? undefined
                    : t.date || selectedDate,
                  note: values.note || undefined,
                  targetCount: values.targetCount,
                  reminderEnabled: values.reminderEnabled,
                }
              : t
          ),
        }));
      } else {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const created: DailyTask = {
          id,
          title: values.title,
          time: values.time,
          category: values.category,
          repeatDaily: values.repeatDaily,
          date: values.repeatDaily ? undefined : selectedDate,
          note: values.note || undefined,
          targetCount: values.targetCount,
          reminderEnabled: values.reminderEnabled,
          createdAt: nowIso,
        };

        updateStore((prev) => ({
          ...prev,
          tasks: [...prev.tasks, created],
        }));
      }

      setComposerOpen(false);
      setEditingTask(null);
    },
    [editingTask, selectedDate, updateStore]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      updateStore((prev) => {
        const nextCompletions = { ...prev.completionsByDate };
        for (const key of Object.keys(nextCompletions)) {
          if (nextCompletions[key]?.[taskId]) {
            const copy = { ...nextCompletions[key] };
            delete copy[taskId];
            nextCompletions[key] = copy;
          }
        }
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
          completionsByDate: nextCompletions,
        };
      });
    },
    [updateStore]
  );

  const handleClearCompleted = useCallback(() => {
    updateStore((prev) => {
      const dayMap = { ...(prev.completionsByDate[selectedDate] || {}) };
      for (const taskId of Object.keys(dayMap)) {
        if (dayMap[taskId]?.completed) {
          dayMap[taskId] = {
            ...dayMap[taskId],
            completed: false,
            completedAt: undefined,
          };
        }
      }
      return {
        ...prev,
        completionsByDate: {
          ...prev.completionsByDate,
          [selectedDate]: dayMap,
        },
      };
    });
  }, [selectedDate, updateStore]);

  const handleRestoreDefaults = useCallback(
    (replaceExisting: boolean) => {
      const seeds = createSeedTasks();
      updateStore((prev) => {
        if (replaceExisting || prev.tasks.length === 0) {
          return {
            ...prev,
            tasks: seeds,
            seeded: true,
          };
        }
        const existingIds = new Set(prev.tasks.map((t) => t.id));
        const missing = seeds.filter((s) => !existingIds.has(s.id));
        return {
          ...prev,
          tasks: [...prev.tasks, ...missing],
          seeded: true,
        };
      });
      setResetConfirmOpen(false);
    },
    [updateStore]
  );

  const handleTriggerInstall = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPromptEvent(null);
    }
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotifEnv(getNotificationEnvironment());
    if (permission !== "granted") return;

    const reg = await registerServiceWorker();
    if (reg) {
      const result = await subscribeDeviceToPush();
      setHasPushSubscription(result.ok);
    }
  };

  const handleDisablePush = async () => {
    await unsubscribeDeviceFromPush();
    setHasPushSubscription(false);
  };

  const handleSendLocalTest = async (): Promise<boolean> => {
    return showLocalNotification({
      title: "YOUMEE Daily — Reminder Active",
      body: "Notifications are working! You'll get alerts at your scheduled task times.",
      tag: "youmee-test-notification",
    });
  };

  const handleCopyPushSubscription = async (): Promise<boolean> => {
    try {
      const sub = await getExistingPushSubscription();
      if (!sub || !navigator.clipboard) return false;
      await navigator.clipboard.writeText(JSON.stringify(sub, null, 2));
      return true;
    } catch {
      return false;
    }
  };

  const handlePrefsChange = (next: NotificationPrefs) => {
    setPrefs(next);
    saveNotificationPrefs(next);
  };

  const handleSaveProfile = (next: UserProfile) => {
    setProfile(next);
    saveUserProfile(next);
  };

  const showInstallBanner =
    !bannerDismissed &&
    !notifEnv.isStandalone &&
    (Boolean(installPromptEvent) || notifEnv.isIOS);

  const notifActive =
    notifEnv.permission === "granted" && prefs.remindersEnabled;
  const notifBlocked = notifEnv.permission === "denied";

  const openNewTaskModal = (cat: TaskCategory = "salah") => {
    setEditingTask(null);
    setDefaultCategory(cat);
    setComposerOpen(true);
  };

  return (
    <div className="min-h-dvh bg-[#eef2fb] pt-safe">
      <div className="mx-auto flex max-w-[1380px] gap-5 p-3 pb-24 sm:p-5 lg:pb-6">
        {/* Left Cobalt Sidebar (Desktop) + Bottom Nav (Mobile) */}
        <SidebarNav
          activeTab={activeTab}
          unreadRemindersCount={activeCount}
          onSelectTab={setActiveTab}
          onOpenNotifications={() => {
            setNotifEnv(getNotificationEnvironment());
            setNotifOpen(true);
          }}
          onOpenNewTask={() => openNewTaskModal()}
          onRestoreDefaults={() => {
            if (store.tasks.length === 0) {
              handleRestoreDefaults(true);
            } else {
              setResetConfirmOpen(true);
            }
          }}
        />

        {/* Center Dashboard Column */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Top Search & Action Header matching reference model */}
          <header className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, namaz, zikr, surah..."
                aria-label="Search daily tasks"
                className="min-h-[46px] w-full rounded-2xl bg-white pr-9 pl-11 text-sm text-slate-800 shadow-[0_6px_22px_rgba(37,99,235,0.05)] outline-hidden transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#3461f5]/25"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {installPromptEvent && (
              <button
                type="button"
                onClick={handleTriggerInstall}
                className="hidden min-h-[46px] items-center gap-1.5 rounded-2xl bg-[#3461f5] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2952e3] sm:inline-flex"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setNotifEnv(getNotificationEnvironment());
                setNotifOpen(true);
              }}
              aria-label="Notification settings"
              title="Notification settings"
              className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-[0_6px_22px_rgba(37,99,235,0.05)] transition hover:bg-blue-50"
            >
              {notifBlocked ? (
                <BellOff className="h-4 w-4 text-rose-500" />
              ) : (
                <Bell className="h-4 w-4 text-[#3461f5]" />
              )}
              <span
                className={`absolute top-3 right-3 h-2 w-2 rounded-full ring-2 ring-white ${
                  notifActive
                    ? "bg-emerald-500"
                    : notifBlocked
                      ? "bg-rose-500"
                      : "bg-amber-400"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              aria-label="Routine settings"
              title="Restore default routine"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-[0_6px_22px_rgba(37,99,235,0.05)] transition hover:bg-blue-50 hover:text-[#3461f5]"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => openNewTaskModal()}
              className="hidden min-h-[46px] items-center gap-1.5 rounded-2xl bg-[#3461f5] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2952e3] lg:inline-flex"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </header>

          <InstallBanner
            visible={showInstallBanner}
            isIOS={notifEnv.isIOS}
            canPromptInstall={Boolean(installPromptEvent)}
            onInstall={handleTriggerInstall}
            onDismiss={() => setBannerDismissed(true)}
          />

          {/* Mobile Tab: Today (Banner + Calendar/Tasks) | Desktop: Always visible */}
          <div
            className={
              activeTab === "today" ? "block space-y-4" : "hidden lg:block lg:space-y-4"
            }
          >
            <HeroBanner
              userName={profile.name}
              dateTimeLabel={`${dateFull} · ${clockLabel}`}
              completedCount={completedCount}
              totalCount={totalCount}
              nextTaskLabel={nextTaskLabel}
            />
          </div>

          {/* Mobile Tab: Stats/Plans | Desktop: Always visible */}
          <div
            className={
              activeTab === "stats"
                ? "block space-y-4"
                : "hidden lg:block lg:space-y-4"
            }
          >
            <MetricCardsRow
              stats={categoryStats}
              onSelectCategory={(cat) => openNewTaskModal(cat)}
            />
            <ChartsRow
              dateBadge={dateBadge}
              completedCount={completedCount}
              totalCount={totalCount}
              stats={categoryStats}
              onAddTask={() => openNewTaskModal()}
            />
          </div>

          {/* Mobile inline Calendar & Checklist when on "today" or "calendar" tab */}
          <div
            className={
              activeTab === "today" || activeTab === "calendar"
                ? "block lg:hidden"
                : "hidden"
            }
          >
            <CalendarScheduleCard
              selectedDate={selectedDate}
              todayKey={todayKey}
              monthName={monthName}
              dateFull={dateFull}
              tasks={filteredTasks}
              totalCount={filteredTotal}
              activeCount={filteredActive}
              completedCount={filteredCompleted}
              filter={filter}
              nowMinutes={nowMinutes}
              onSelectDate={setSelectedDate}
              onShiftWeek={(delta) =>
                setSelectedDate((prev) => shiftDateKey(prev, delta))
              }
              onFilterChange={setFilter}
              onToggle={handleToggleTask}
              onIncrementCount={handleIncrementCount}
              onResetCount={handleResetCount}
              onEdit={(task: ResolvedDailyTask) => {
                setEditingTask(task);
                setComposerOpen(true);
              }}
              onDelete={handleDeleteTask}
              onClearCompleted={handleClearCompleted}
              onRestoreDefaults={() => handleRestoreDefaults(false)}
              onOpenNewTask={() => openNewTaskModal()}
            />
          </div>

          {/* Mobile Profile Tab */}
          <div className={activeTab === "profile" ? "block space-y-4 lg:hidden" : "hidden"}>
            <ProfileCard
              profile={profile}
              streakDays={streakDays}
              completedCount={completedCount}
              totalCount={totalCount}
              onSaveProfile={handleSaveProfile}
            />

            <div className="rounded-3xl bg-white p-5 shadow-[0_8px_28px_rgba(37,99,235,0.05)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                APP CONTROLS
              </h3>
              <button
                type="button"
                onClick={() => {
                  setNotifEnv(getNotificationEnvironment());
                  setNotifOpen(true);
                }}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#3461f5] px-4 text-sm font-semibold text-white"
              >
                <Bell className="h-4 w-4" />
                Push & Reminder Settings
              </button>
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Restore 14-Item Default Routine
              </button>
            </div>
          </div>
        </div>

        {/* Right Profile & Calendar Column (Desktop matching reference model) */}
        <aside className="hidden lg:flex lg:w-[350px] lg:shrink-0 lg:flex-col lg:gap-4">
          <ProfileCard
            profile={profile}
            streakDays={streakDays}
            completedCount={completedCount}
            totalCount={totalCount}
            onSaveProfile={handleSaveProfile}
          />
          <CalendarScheduleCard
            selectedDate={selectedDate}
            todayKey={todayKey}
            monthName={monthName}
            dateFull={dateFull}
            tasks={filteredTasks}
            totalCount={filteredTotal}
            activeCount={filteredActive}
            completedCount={filteredCompleted}
            filter={filter}
            nowMinutes={nowMinutes}
            onSelectDate={setSelectedDate}
            onShiftWeek={(delta) =>
              setSelectedDate((prev) => shiftDateKey(prev, delta))
            }
            onFilterChange={setFilter}
            onToggle={handleToggleTask}
            onIncrementCount={handleIncrementCount}
            onResetCount={handleResetCount}
            onEdit={(task: ResolvedDailyTask) => {
              setEditingTask(task);
              setComposerOpen(true);
            }}
            onDelete={handleDeleteTask}
            onClearCompleted={handleClearCompleted}
            onRestoreDefaults={() => handleRestoreDefaults(false)}
            onOpenNewTask={() => openNewTaskModal()}
          />
        </aside>
      </div>

      {/* Add / Edit Task Sheet */}
      <TaskComposer
        open={composerOpen}
        editingTask={editingTask}
        defaultCategory={defaultCategory}
        selectedDateLabel={dateBadge}
        onClose={() => {
          setComposerOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Push & Reminder Sheet */}
      <NotificationSheet
        open={notifOpen}
        env={notifEnv}
        prefs={prefs}
        hasPushSubscription={hasPushSubscription}
        onClose={() => setNotifOpen(false)}
        onEnableNotifications={handleEnableNotifications}
        onDisablePush={handleDisablePush}
        onSendLocalTest={handleSendLocalTest}
        onCopyPushSubscription={handleCopyPushSubscription}
        onPrefsChange={handlePrefsChange}
      />

      {/* Restore Default Routine Confirmation Sheet */}
      {resetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-routine-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-xs sm:items-center sm:p-4"
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl pb-safe sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#2f5cf0]">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <h2
                  id="restore-routine-title"
                  className="text-base font-bold text-slate-900"
                >
                  Restore Default Routine
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Restore your 14 daily items (Thahajud, Qirath 1 juza&apos;a, Zikr
              shaduli, Zuha namaz, Salath 1000, Thasbeeh 33, Awwabeen namaz,
              Haddad, Withr namaz, Yaseen, Mulk, Waqia&apos;a, Muzammil).
            </p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleRestoreDefaults(false)}
                className="min-h-[46px] w-full rounded-2xl bg-[#3461f5] px-4 text-sm font-semibold text-white transition hover:bg-[#2952e3]"
              >
                Add Missing Default Tasks (Keep Custom)
              </button>
              <button
                type="button"
                onClick={() => handleRestoreDefaults(true)}
                className="min-h-[44px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset Full List to Default 14 Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
