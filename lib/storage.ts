import { createSeedTasks } from "./defaultTasks";
import type {
  DailyTask,
  DayTaskState,
  NotificationPrefs,
  ResolvedDailyTask,
  TaskCategory,
  TaskFilter,
  TaskPeriod,
  TaskStore,
  UserProfile,
} from "./types";

export const TASKS_STORAGE_KEY = "youmee_daily_tasks_v1";
export const NOTIF_PREFS_STORAGE_KEY = "youmee_notif_prefs_v1";
export const NOTIFIED_MAP_STORAGE_KEY = "youmee_notified_tasks_v1";
export const PROFILE_STORAGE_KEY = "youmee_user_profile_v1";

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  remindersEnabled: true,
  leadMinutes: 0,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "YOUMEE",
  subtitle: "DAILY ROUTINE TRACKER",
  location: "My Daily Plan",
  routineHours: "4:30am - 10pm",
};

export const CATEGORY_META: Record<
  TaskCategory,
  { label: string; dotClass: string; barClass: string; hex: string }
> = {
  salah: {
    label: "Prayers & Namaz",
    dotClass: "bg-indigo-500",
    barClass: "bg-indigo-500",
    hex: "#6366f1",
  },
  zikr: {
    label: "Zikr & Salawat",
    dotClass: "bg-emerald-500",
    barClass: "bg-emerald-400",
    hex: "#34d399",
  },
  quran: {
    label: "Quran & Surahs",
    dotClass: "bg-rose-400",
    barClass: "bg-rose-400",
    hex: "#fb7185",
  },
  personal: {
    label: "Personal Tasks",
    dotClass: "bg-pink-400",
    barClass: "bg-pink-400",
    hex: "#f472b6",
  },
};

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const dt = parseDateKey(dateKey);
  dt.setDate(dt.getDate() + deltaDays);
  return getLocalDateKey(dt);
}

export function getWeekDateKeys(anchorDateKey: string): Array<{
  dateKey: string;
  weekdayShort: string;
  dayNumber: number;
}> {
  const dt = parseDateKey(anchorDateKey);
  const sundayOffset = -dt.getDay();
  const sunday = new Date(dt);
  sunday.setDate(dt.getDate() + sundayOffset);

  const days: Array<{
    dateKey: string;
    weekdayShort: string;
    dayNumber: number;
  }> = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(sunday);
    current.setDate(sunday.getDate() + i);
    days.push({
      dateKey: getLocalDateKey(current),
      weekdayShort: current.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: current.getDate(),
    });
  }
  return days;
}

export function formatDateLabel(
  dateKey: string,
  todayKey: string = getLocalDateKey()
): { badge: string; full: string; monthName: string } {
  const dt = parseDateKey(dateKey);
  const full = dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const monthName = dt.toLocaleDateString("en-US", { month: "long" });

  if (dateKey === todayKey) return { badge: "Today", full, monthName };
  if (dateKey === shiftDateKey(todayKey, -1))
    return { badge: "Yesterday", full, monthName };
  if (dateKey === shiftDateKey(todayKey, 1))
    return { badge: "Tomorrow", full, monthName };
  return { badge: full, full, monthName };
}

export function parseTimeMinutes(hhmm: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return 24 * 60;
  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const mins = Math.min(59, Math.max(0, Number(match[2])));
  return hours * 60 + mins;
}

export function formatTime12h(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return hhmm;
  const h24 = Math.min(23, Math.max(0, Number(match[1])));
  const mins = match[2];
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins} ${period}`;
}

export function getPeriodForTime(hhmm: string): TaskPeriod {
  const mins = parseTimeMinutes(hhmm);
  if (mins < 5 * 60 + 30) return "dawn";
  if (mins < 12 * 60) return "morning";
  if (mins < 17 * 60) return "afternoon";
  if (mins < 20 * 60) return "evening";
  return "night";
}

export function inferCategoryFromTitle(title: string): TaskCategory {
  const lower = title.toLowerCase();
  if (
    lower.includes("namaz") ||
    lower.includes("thahajud") ||
    lower.includes("tahajjud") ||
    lower.includes("zuha") ||
    lower.includes("awwabeen") ||
    lower.includes("withr") ||
    lower.includes("salah")
  ) {
    return "salah";
  }
  if (
    lower.includes("zikr") ||
    lower.includes("salath") ||
    lower.includes("thasbeeh") ||
    lower.includes("tasbeeh") ||
    lower.includes("haddad")
  ) {
    return "zikr";
  }
  if (
    lower.includes("qirath") ||
    lower.includes("quran") ||
    lower.includes("yaseen") ||
    lower.includes("mulk") ||
    lower.includes("waqia") ||
    lower.includes("muzammil")
  ) {
    return "quran";
  }
  return "personal";
}

export function sortTasksByTime<
  T extends Pick<DailyTask, "time" | "createdAt" | "id">,
>(tasks: ReadonlyArray<T>): T[] {
  return [...tasks].sort((a, b) => {
    const diff = parseTimeMinutes(a.time) - parseTimeMinutes(b.time);
    if (diff !== 0) return diff;
    const createdDiff = a.createdAt.localeCompare(b.createdAt);
    if (createdDiff !== 0) return createdDiff;
    return a.id.localeCompare(b.id);
  });
}

export function resolveTasksForDate(
  store: TaskStore,
  dateKey: string
): ResolvedDailyTask[] {
  const dayCompletions = store.completionsByDate[dateKey] || {};
  const matching = store.tasks.filter(
    (task) => task.repeatDaily || task.date === dateKey
  );

  return sortTasksByTime(matching).map((task) => {
    const state: DayTaskState | undefined = dayCompletions[task.id];
    const count = Math.max(0, state?.count ?? 0);
    return {
      ...task,
      category: task.category || inferCategoryFromTitle(task.title),
      completed: Boolean(state?.completed),
      completedAt: state?.completedAt,
      count,
      period: getPeriodForTime(task.time),
    };
  });
}

export function filterResolvedTasks(
  tasks: ReadonlyArray<ResolvedDailyTask>,
  filter: TaskFilter
): ResolvedDailyTask[] {
  if (filter === "active") return tasks.filter((t) => !t.completed);
  if (filter === "completed") return tasks.filter((t) => t.completed);
  return [...tasks];
}

export function computeCategoryStats(
  tasks: ReadonlyArray<ResolvedDailyTask>
): Record<
  TaskCategory,
  { total: number; completed: number; percentage: number }
> {
  const base: Record<
    TaskCategory,
    { total: number; completed: number; percentage: number }
  > = {
    salah: { total: 0, completed: 0, percentage: 0 },
    zikr: { total: 0, completed: 0, percentage: 0 },
    quran: { total: 0, completed: 0, percentage: 0 },
    personal: { total: 0, completed: 0, percentage: 0 },
  };

  for (const task of tasks) {
    const bucket = base[task.category];
    bucket.total += 1;
    if (task.completed) bucket.completed += 1;
  }

  for (const key of Object.keys(base) as TaskCategory[]) {
    const item = base[key];
    item.percentage =
      item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
  }

  return base;
}

export function countActiveStreak(
  store: TaskStore,
  todayKey: string = getLocalDateKey()
): number {
  let streak = 0;
  const hasAnyCompletedOn = (key: string): boolean => {
    const dayMap = store.completionsByDate[key];
    if (!dayMap) return false;
    return Object.values(dayMap).some((entry) => entry.completed);
  };

  let cursor = hasAnyCompletedOn(todayKey)
    ? todayKey
    : shiftDateKey(todayKey, -1);

  for (let i = 0; i < 365; i++) {
    if (!hasAnyCompletedOn(cursor)) break;
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function createInitialTaskStore(): TaskStore {
  return {
    tasks: createSeedTasks(),
    completionsByDate: {},
    seeded: true,
  };
}

export function loadTaskStore(): TaskStore {
  if (!isBrowser()) {
    return createInitialTaskStore();
  }

  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialTaskStore();
      saveTaskStore(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<TaskStore>;
    if (!parsed || !Array.isArray(parsed.tasks)) {
      const initial = createInitialTaskStore();
      saveTaskStore(initial);
      return initial;
    }

    return {
      tasks: parsed.tasks.map((task) => ({
        ...task,
        category: task.category || inferCategoryFromTitle(task.title),
      })),
      completionsByDate:
        parsed.completionsByDate && typeof parsed.completionsByDate === "object"
          ? parsed.completionsByDate
          : {},
      seeded: parsed.seeded ?? true,
    };
  } catch {
    return createInitialTaskStore();
  }
}

export function saveTaskStore(store: TaskStore): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function loadNotificationPrefs(): NotificationPrefs {
  if (!isBrowser()) return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    const lead = parsed.leadMinutes;
    return {
      remindersEnabled: parsed.remindersEnabled ?? true,
      leadMinutes: lead === 5 || lead === 10 ? lead : 0,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

export function loadNotifiedMap(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(NOTIFIED_MAP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveNotifiedMap(map: Record<string, string>): void {
  if (!isBrowser()) return;
  try {
    const entries = Object.entries(map).slice(-200);
    window.localStorage.setItem(
      NOTIFIED_MAP_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(entries))
    );
  } catch {
    // Ignore storage errors
  }
}

export function loadUserProfile(): UserProfile {
  if (!isBrowser()) return DEFAULT_USER_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      name: parsed.name?.trim() || DEFAULT_USER_PROFILE.name,
      subtitle: parsed.subtitle?.trim() || DEFAULT_USER_PROFILE.subtitle,
      location: parsed.location?.trim() || DEFAULT_USER_PROFILE.location,
      routineHours:
        parsed.routineHours?.trim() || DEFAULT_USER_PROFILE.routineHours,
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors
  }
}
