"use client";

import { Calendar } from "lucide-react";

interface HeroBannerProps {
  userName: string;
  dateTimeLabel: string;
  completedCount: number;
  totalCount: number;
  nextTaskLabel: string | null;
}

export function HeroBanner({
  userName,
  dateTimeLabel,
  completedCount,
  totalCount,
  nextTaskLabel,
}: HeroBannerProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3461f5] via-[#3e6af7] to-[#537eff] p-5 text-white shadow-lg shadow-blue-600/15 sm:p-6">
      {/* Subtle geometric background rings */}
      <div className="pointer-events-none absolute -top-12 right-12 h-44 w-44 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-blue-300/15" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/18 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs">
            <Calendar className="h-3.5 w-3.5 text-blue-100" />
            <span>{dateTimeLabel}</span>
          </div>

          <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
            {greeting}, {userName}!
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-blue-100 sm:text-sm">
            {nextTaskLabel
              ? `Next up: ${nextTaskLabel}`
              : totalCount > 0 && completedCount === totalCount
                ? "All daily tasks completed. Alhamdulillah!"
                : "Keep your daily prayers, zikr, and plans on track."}
          </p>
        </div>

        {/* Clean Vector Crescent & Daily Checklist Illustration */}
        <div className="hidden shrink-0 sm:block" aria-hidden="true">
          <svg
            width="132"
            height="108"
            viewBox="0 0 132 108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="18"
              y="16"
              width="74"
              height="84"
              rx="16"
              fill="white"
              fillOpacity="0.18"
            />
            <rect
              x="28"
              y="10"
              width="72"
              height="86"
              rx="16"
              fill="white"
              fillOpacity="0.96"
            />
            <circle cx="44" cy="33" r="6" fill="#34D399" />
            <path
              d="M41.5 33L43.3 34.8L46.8 31.3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="56" y="30" width="32" height="5" rx="2.5" fill="#CBD5E1" />

            <circle cx="44" cy="53" r="6" fill="#3B66F5" />
            <path
              d="M41.5 53L43.3 54.8L46.8 51.3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="56" y="50" width="26" height="5" rx="2.5" fill="#CBD5E1" />

            <circle cx="44" cy="73" r="6" fill="#FB7185" />
            <rect x="56" y="70" width="30" height="5" rx="2.5" fill="#E2E8F0" />

            <circle cx="106" cy="24" r="14" fill="#FBBF24" />
            <circle cx="111" cy="21" r="11" fill="#4672FA" />
          </svg>
        </div>
      </div>
    </section>
  );
}
