export type TaskPeriod = "dawn" | "morning" | "afternoon" | "evening" | "night";

export type TaskCategory = "salah" | "zikr" | "quran" | "personal";

export type TaskFilter = "all" | "active" | "completed";

export type MobileTab = "today" | "stats" | "calendar" | "profile";

export interface DailyTask {
  id: string;
  title: string;
  /** 24-hour time formatted as "HH:mm" */
  time: string;
  category: TaskCategory;
  /** Repeats automatically every day when true; single-date task when false */
  repeatDaily: boolean;
  /** Local date key "YYYY-MM-DD" used when repeatDaily is false */
  date?: string;
  /** Optional short label or reflection note */
  note?: string;
  /** Optional tap-counter target (e.g. 1000 for Salath, 33 for Thasbeeh) */
  targetCount?: number;
  /** Whether reminder notifications should fire at the scheduled time */
  reminderEnabled: boolean;
  createdAt: string;
}

export interface DayTaskState {
  completed: boolean;
  completedAt?: string;
  count?: number;
}

/** Map of dateKey ("YYYY-MM-DD") -> taskId -> DayTaskState */
export type CompletionsByDate = Record<string, Record<string, DayTaskState>>;

export interface NotificationPrefs {
  remindersEnabled: boolean;
  /** Minutes before scheduled time to trigger a reminder (0 = exact time) */
  leadMinutes: 0 | 5 | 10;
}

export interface UserProfile {
  name: string;
  subtitle: string;
  location: string;
  routineHours: string;
}

export interface TaskStore {
  tasks: DailyTask[];
  completionsByDate: CompletionsByDate;
  seeded: boolean;
}

export interface ResolvedDailyTask extends DailyTask {
  completed: boolean;
  completedAt?: string;
  count: number;
  period: TaskPeriod;
}

export interface SerializedPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}
