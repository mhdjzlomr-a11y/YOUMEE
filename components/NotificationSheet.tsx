"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Copy,
  Send,
  Share,
  ShieldAlert,
  X,
} from "lucide-react";
import type { NotificationEnvironment } from "@/lib/notifications";
import type { NotificationPrefs } from "@/lib/types";

interface NotificationSheetProps {
  open: boolean;
  env: NotificationEnvironment;
  prefs: NotificationPrefs;
  hasPushSubscription: boolean;
  onClose: () => void;
  onEnableNotifications: () => Promise<void>;
  onDisablePush: () => Promise<void>;
  onSendLocalTest: () => Promise<boolean>;
  onCopyPushSubscription: () => Promise<boolean>;
  onPrefsChange: (next: NotificationPrefs) => void;
}

export function NotificationSheet({
  open,
  env,
  prefs,
  hasPushSubscription,
  onClose,
  onEnableNotifications,
  onDisablePush,
  onSendLocalTest,
  onCopyPushSubscription,
  onPrefsChange,
}: NotificationSheetProps) {
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const needsIOSInstall = env.isIOS && !env.isStandalone;

  const handleEnable = async () => {
    setBusy(true);
    setStatusMessage("");
    try {
      await onEnableNotifications();
      setStatusMessage("Notification permissions updated.");
    } finally {
      setBusy(false);
    }
  };

  const handleLocalTest = async () => {
    setBusy(true);
    setStatusMessage("");
    try {
      const ok = await onSendLocalTest();
      setStatusMessage(
        ok
          ? "Test notification sent to your device!"
          : "Please allow notifications first to preview alerts."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCopySubscription = async () => {
    setBusy(true);
    setStatusMessage("");
    try {
      const ok = await onCopyPushSubscription();
      setStatusMessage(
        ok
          ? "Web Push subscription JSON copied to clipboard!"
          : "No active push subscription found."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl pb-safe sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#2f5cf0]">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="notif-sheet-title"
                className="text-base font-bold text-slate-900"
              >
                Push & Task Reminders
              </h2>
              <p className="text-xs text-slate-500">
                Alerts at each task&apos;s scheduled time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {needsIOSInstall ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
              <p className="font-semibold">Install on iPhone first</p>
              <p className="mt-1 text-amber-900">
                Safari on iOS requires installing the PWA before enabling push
                notifications. Tap{" "}
                <span className="inline-flex items-center gap-0.5 font-semibold">
                  Share <Share className="inline h-3 w-3" />
                </span>{" "}
                → <span className="font-semibold">Add to Home Screen</span>, then
                open YOUMEE from your Home Screen.
              </p>
            </div>
          ) : env.permission === "denied" ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Notifications are blocked</p>
                <p className="mt-0.5 text-rose-800">
                  Enable notifications for this site in your browser or phone
                  settings, then reload.
                </p>
              </div>
            </div>
          ) : env.permission === "granted" ? (
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2f5cf0]" />
                <div>
                  <p className="font-semibold">Notifications enabled</p>
                  <p className="text-slate-600">
                    {hasPushSubscription
                      ? "Web Push subscription active on this device."
                      : env.vapidConfigured
                        ? "Tap below to register Web Push subscription."
                        : "Local Service Worker reminders active."}
                  </p>
                </div>
              </div>
              {hasPushSubscription && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onDisablePush}
                  className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f5cf0] hover:bg-blue-50"
                >
                  Unsubscribe
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Turn on daily task alerts
              </p>
              <p className="mt-0.5 text-slate-600">
                Allow notifications to receive alerts when it&apos;s time for
                Thahajud, Zuha namaz, Qirath, or custom plans.
              </p>
            </div>
          )}

          <div className="space-y-2.5 rounded-2xl border border-slate-200 p-3.5">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Bell className="h-4 w-4 text-[#3461f5]" />
                Scheduled task reminders
              </span>
              <input
                type="checkbox"
                checked={prefs.remindersEnabled}
                onChange={(e) =>
                  onPrefsChange({ ...prefs, remindersEnabled: e.target.checked })
                }
                className="h-5 w-5 accent-[#3461f5]"
              />
            </label>

            <div className="pt-1">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">
                Notify me
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {([0, 5, 10] as const).map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      onPrefsChange({ ...prefs, leadMinutes: mins })
                    }
                    className={`min-h-[38px] rounded-xl border text-xs font-semibold transition ${
                      prefs.leadMinutes === mins
                        ? "border-[#3461f5] bg-[#3461f5] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {mins === 0 ? "At task time" : `${mins}m before`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {(env.permission !== "granted" ||
              (env.vapidConfigured && !hasPushSubscription)) &&
              !needsIOSInstall && (
                <button
                  type="button"
                  disabled={busy || env.permission === "denied"}
                  onClick={handleEnable}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#3461f5] px-4 text-sm font-semibold text-white transition hover:bg-[#2952e3] disabled:opacity-50"
                >
                  <Bell className="h-4 w-4" />
                  {env.permission === "granted"
                    ? "Subscribe to Web Push"
                    : "Enable Notifications"}
                </button>
              )}

            <button
              type="button"
              disabled={busy || env.permission !== "granted"}
              onClick={handleLocalTest}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send Test Notification
            </button>

            {env.vapidConfigured && hasPushSubscription && (
              <button
                type="button"
                disabled={busy}
                onClick={handleCopySubscription}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 text-xs font-semibold text-[#2f5cf0] transition hover:bg-blue-100 disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Push Subscription JSON
              </button>
            )}
          </div>

          {statusMessage && (
            <p className="rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
