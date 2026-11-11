"use client";

import { useState } from "react";
import { Check, MapPin, MoonStar, Pencil, X } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface ProfileCardProps {
  profile: UserProfile;
  streakDays: number;
  completedCount: number;
  totalCount: number;
  onSaveProfile: (next: UserProfile) => void;
}

export function ProfileCard({
  profile,
  streakDays,
  completedCount,
  totalCount,
  onSaveProfile,
}: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);

  const openEditor = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: draft.name.trim() || "YOUMEE",
      subtitle: draft.subtitle.trim() || "DAILY ROUTINE TRACKER",
      location: draft.location.trim() || "My Daily Plan",
      routineHours: draft.routineHours.trim() || "4:30am - 10pm",
    });
    setEditing(false);
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_28px_rgba(37,99,235,0.06)]">
      {/* Cobalt Blue Card Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#3461f5] to-[#4b75ff] px-5 py-3.5 text-white">
        <h2 className="text-xs font-bold uppercase tracking-wider">
          MY PROFILE
        </h2>
        <button
          type="button"
          onClick={editing ? () => setEditing(false) : openEditor}
          aria-label={editing ? "Cancel editing profile" : "Edit profile"}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/18 text-white transition hover:bg-white/28"
        >
          {editing ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Pencil className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-2.5 p-4">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Your name"
            className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-hidden focus:border-[#3461f5]"
          />
          <input
            type="text"
            value={draft.subtitle}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            placeholder="Role or goal"
            className="min-h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-hidden focus:border-[#3461f5]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="Location"
              className="min-h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-hidden focus:border-[#3461f5]"
            />
            <input
              type="text"
              value={draft.routineHours}
              onChange={(e) =>
                setDraft({ ...draft, routineHours: e.target.value })
              }
              placeholder="4:30am - 10pm"
              className="min-h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-hidden focus:border-[#3461f5]"
            />
          </div>
          <button
            type="submit"
            className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#3461f5] text-xs font-semibold text-white transition hover:bg-[#2952e3]"
          >
            <Check className="h-3.5 w-3.5" />
            Save Profile
          </button>
        </form>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2f5cf0] ring-4 ring-blue-50">
              <MoonStar className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-900">
                {profile.name}
              </h3>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {profile.subtitle}
              </p>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3461f5]" />
                <span>{profile.location}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200/80 border-t border-slate-100 pt-3.5 text-center">
            <div className="px-1">
              <span className="block text-[10px] font-medium text-slate-400">
                Active Streak
              </span>
              <span className="mt-0.5 block font-mono text-xs font-bold text-slate-900">
                {streakDays} {streakDays === 1 ? "Day" : "Days"}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[10px] font-medium text-slate-400">
                Done Today
              </span>
              <span className="mt-0.5 block font-mono text-xs font-bold text-slate-900">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[10px] font-medium text-slate-400">
                Daily Window
              </span>
              <span className="mt-0.5 block truncate font-mono text-xs font-bold text-slate-900">
                {profile.routineHours}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
