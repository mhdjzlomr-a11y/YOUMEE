import test from "node:test";
import assert from "node:assert/strict";
import { createSeedTasks } from "../lib/defaultTasks";
import { isValidPushSubscription, withBasePath } from "../lib/notifications";
import {
  computeCategoryStats,
  countActiveStreak,
  filterResolvedTasks,
  formatDateLabel,
  formatTime12h,
  getWeekDateKeys,
  parseTimeMinutes,
  resolveTasksForDate,
  shiftDateKey,
  sortTasksByTime,
} from "../lib/storage";
import type { TaskStore } from "../lib/types";

test("createSeedTasks includes all 14 daily routine tasks in chronological order", () => {
  const seeds = createSeedTasks("2026-11-11T00:00:00.000Z");
  assert.equal(seeds.length, 14);
  assert.deepEqual(
    seeds.map((t) => t.title),
    [
      "Thahajud",
      "Qirath 1 juza'a",
      "Zikr shaduli",
      "Zuha namaz",
      "Salath 1000",
      "Thasbeeh 33",
      "Awwabeen namaz",
      "Zikr shaduli",
      "Haddad",
      "Withr namaz",
      "Yaseen",
      "Mulk",
      "Waqia'a",
      "Muzammil",
    ]
  );

  const sorted = sortTasksByTime(seeds);
  assert.deepEqual(
    sorted.map((t) => t.id),
    seeds.map((t) => t.id)
  );
  assert.equal(
    seeds.find((t) => t.title === "Salath 1000")?.targetCount,
    1000
  );
  assert.equal(seeds.find((t) => t.title === "Thasbeeh 33")?.targetCount, 33);
});

test("time parsing and 12h formatting handle edge hours cleanly", () => {
  assert.equal(parseTimeMinutes("00:05"), 5);
  assert.equal(parseTimeMinutes("04:30"), 270);
  assert.equal(parseTimeMinutes("22:00"), 1320);

  assert.equal(formatTime12h("00:05"), "12:05 am");
  assert.equal(formatTime12h("04:30"), "4:30 am");
  assert.equal(formatTime12h("12:00"), "12:00 pm");
  assert.equal(formatTime12h("18:30"), "6:30 pm");
});

test("date shifting, week strip, and labels work across month boundaries", () => {
  assert.equal(shiftDateKey("2026-11-01", -1), "2026-10-31");
  assert.equal(shiftDateKey("2026-11-30", 1), "2026-12-01");

  const week = getWeekDateKeys("2026-11-11");
  assert.equal(week.length, 7);
  assert.equal(week[0].weekdayShort, "Sun");
  assert.equal(week[6].weekdayShort, "Sat");

  assert.equal(formatDateLabel("2026-11-11", "2026-11-11").badge, "Today");
  assert.equal(formatDateLabel("2026-11-10", "2026-11-11").badge, "Yesterday");
  assert.equal(formatDateLabel("2026-11-12", "2026-11-11").badge, "Tomorrow");
});

test("resolveTasksForDate merges repeating tasks, single-date tasks, and per-day completions", () => {
  const store: TaskStore = {
    seeded: true,
    tasks: [
      {
        id: "t1",
        title: "Thahajud",
        time: "04:30",
        category: "salah",
        repeatDaily: true,
        reminderEnabled: true,
        createdAt: "2026-11-11T00:00:00Z",
      },
      {
        id: "t2",
        title: "Doctor appointment",
        time: "15:00",
        category: "personal",
        repeatDaily: false,
        date: "2026-11-11",
        reminderEnabled: true,
        createdAt: "2026-11-11T01:00:00Z",
      },
      {
        id: "t3",
        title: "Salath 1000",
        time: "10:30",
        category: "zikr",
        repeatDaily: true,
        targetCount: 1000,
        reminderEnabled: true,
        createdAt: "2026-11-11T00:00:00Z",
      },
    ],
    completionsByDate: {
      "2026-11-11": {
        t1: { completed: true, completedAt: "2026-11-11T05:00:00Z" },
        t3: { completed: false, count: 400 },
      },
    },
  };

  const nov11 = resolveTasksForDate(store, "2026-11-11");
  assert.deepEqual(
    nov11.map((t) => t.id),
    ["t1", "t3", "t2"]
  );
  assert.equal(nov11[0].completed, true);
  assert.equal(nov11[1].count, 400);
  assert.equal(filterResolvedTasks(nov11, "completed").length, 1);
  assert.equal(filterResolvedTasks(nov11, "active").length, 2);

  const stats = computeCategoryStats(nov11);
  assert.equal(stats.salah.percentage, 100);
  assert.equal(stats.zikr.percentage, 0);
  assert.equal(stats.personal.total, 1);

  // Next day should exclude one-off task t2 and show fresh unchecked t1/t3
  const nov12 = resolveTasksForDate(store, "2026-11-12");
  assert.deepEqual(
    nov12.map((t) => t.id),
    ["t1", "t3"]
  );
  assert.equal(nov12[0].completed, false);
  assert.equal(nov12[1].count, 0);
});

test("countActiveStreak counts consecutive active days", () => {
  const store: TaskStore = {
    seeded: true,
    tasks: [],
    completionsByDate: {
      "2026-11-09": { t1: { completed: true } },
      "2026-11-10": { t1: { completed: true } },
      "2026-11-11": { t1: { completed: false } },
    },
  };

  assert.equal(countActiveStreak(store, "2026-11-11"), 2);
  store.completionsByDate["2026-11-11"].t1.completed = true;
  assert.equal(countActiveStreak(store, "2026-11-11"), 3);
});

test("isValidPushSubscription validates HTTPS endpoint and VAPID keys", () => {
  assert.equal(
    isValidPushSubscription({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "key1", auth: "key2" },
    }),
    true
  );
  assert.equal(
    isValidPushSubscription({
      endpoint: "http://insecure.example/push",
      keys: { p256dh: "key1", auth: "key2" },
    }),
    false
  );
  assert.equal(isValidPushSubscription({ endpoint: "https://ok" }), false);
  assert.equal(withBasePath("/sw.js").endsWith("/sw.js"), true);
});
