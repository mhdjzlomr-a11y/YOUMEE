"use client";

import { Download, Share, X } from "lucide-react";

interface InstallBannerProps {
  visible: boolean;
  isIOS: boolean;
  canPromptInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({
  visible,
  isIOS,
  canPromptInstall,
  onInstall,
  onDismiss,
}: InstallBannerProps) {
  if (!visible) return null;
  if (!canPromptInstall && !isIOS) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-blue-200 bg-white p-3.5 text-slate-900 shadow-[0_6px_22px_rgba(37,99,235,0.06)]">
      <div className="flex-1 text-xs leading-relaxed">
        <p className="font-semibold text-[#2f5cf0]">
          Install YOUMEE on your phone
        </p>
        {isIOS && !canPromptInstall ? (
          <p className="mt-0.5 text-slate-600">
            Tap{" "}
            <span className="inline-flex items-center gap-0.5 font-semibold text-slate-800">
              Share <Share className="inline h-3 w-3" />
            </span>{" "}
            in Safari, then choose{" "}
            <span className="font-semibold text-slate-800">
              Add to Home Screen
            </span>{" "}
            for app mode and push reminders.
          </p>
        ) : (
          <p className="mt-0.5 text-slate-600">
            Add to your home screen for quick daily check-ins, offline use, and
            scheduled reminders.
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {canPromptInstall && (
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-xl bg-[#3461f5] px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95 hover:bg-[#2952e3]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss install banner"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
