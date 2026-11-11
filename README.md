# YOUMEE Daily — Daily Task Tracker PWA

A clean, mobile-first **Daily Task & Worship Tracker Progressive Web App (PWA)** built with **Next.js (App Router, TypeScript)** and **Tailwind CSS**, pre-seeded with your daily routine and saved locally in `localStorage`.

## Features

- **Pre-loaded Daily Routine (Editable & Restorable)**:
  - `Thahajud`, `Qirath 1 juza'a`, `Zikr shaduli` (Morning), `Zuha namaz`, `Salath 1000`, `Thasbeeh 33`, `Awwabeen namaz`, `Zikr shaduli` (Evening), `Haddad`, `Withr namaz`, `Yaseen`, `Mulk`, `Waqia'a`, and `Muzammil`.
- **Add Tasks with Specific Times**: Native mobile `<input type="time">` picker, quick time presets (`+15m`, `+1h`, `04:30`, `09:00`, etc.), optional notes, and daily repeat vs. single-day toggle.
- **Tap Counters & Check-off**: Tactile check circles, progress bar, active streak counter, chronological time-of-day sections, and inline tap counters (`+1`, `+10`, `+100`) for count-based tasks like `Salath 1000` and `Thasbeeh 33`.
- **Local Storage Persistence**: All tasks, daily completions, counts, and reminder preferences persist in `localStorage` with multi-tab sync.
- **PWA Installable on Phone**: Web App Manifest (`/manifest.webmanifest`), PNG app icons (`192x192`, `512x512`, `maskable`, Apple `180x180`), and offline-ready Service Worker (`public/sw.js`).
- **Push & Reminder Notifications**:
  - Instant **Test Notification** and scheduled task-time Service Worker alerts work out of the box.
  - Full Web Push API setup (`/api/push/subscribe` and `/api/push/send` via `web-push`) when VAPID keys are configured.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Optional: Enable Remote Web Push (VAPID)

1. Generate VAPID keys:
   ```bash
   npm run generate-vapid
   ```
2. Copy the output into `.env.local` (see `.env.example`):
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:you@example.com
   ```
3. Deploy over **HTTPS** (required by mobile browsers for PWA installation and push notifications).

## Installing on Your Phone

- **Android (Chrome / Edge)**: Open the deployed HTTPS URL and tap **Install** in the in-app banner or browser menu (**Add to Home screen**).
- **iPhone / iPad (Safari 16.4+)**: Open the deployed HTTPS URL in Safari, tap **Share** → **Add to Home Screen**, then launch **YOUMEE** from your Home Screen to enable push notifications.

## Verification Scripts

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```
