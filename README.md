# YOUMEE Daily — Daily Task Tracker PWA

A clean, mobile-first **Daily Task & Worship Tracker Progressive Web App (PWA)** built with **Next.js (Static Export)** and **Tailwind CSS**, hosted directly on **GitHub Pages** and backed by `localStorage`.

## Live GitHub Pages URL

Once GitHub Pages is switched to **GitHub Actions** in repo settings, every push to `main` deploys to:

- `https://mhdjzlomr-a11y.github.io/YOUMEE/`

## Features

- **Pre-loaded Daily Routine (Editable & Restorable)**:
  - `Thahajud`, `Qirath 1 juza'a`, `Zikr shaduli` (Morning), `Zuha namaz`, `Salath 1000`, `Thasbeeh 33`, `Awwabeen namaz`, `Zikr shaduli` (Evening), `Haddad`, `Withr namaz`, `Yaseen`, `Mulk`, `Waqia'a`, and `Muzammil`.
- **Add Tasks with Specific Times**: Native mobile `<input type="time">` picker, quick time presets (`+15m`, `+1h`, `04:30`, `09:00`, etc.), category selection, optional notes, and daily repeat vs. single-day toggle.
- **Tap Counters & Check-off**: Tactile check circles, progress charts, active streak counter, 7-day calendar strip, and inline tap counters (`+1`, `+10`, `+100`) for count-based tasks like `Salath 1000` and `Thasbeeh 33`.
- **Local Storage Persistence**: Tasks, daily completions, counts, profile, and reminder preferences persist locally in `localStorage` with multi-tab sync.
- **PWA Installable on Phone**: Static Web App Manifest (`manifest.webmanifest`), PNG icons (`192x192`, `512x512`, `maskable`, Apple `180x180`), and offline-ready Service Worker (`public/sw.js`).
- **Push & Reminder Notifications**: Instant **Test Notification** and scheduled task-time Service Worker alerts work out of the box over HTTPS; optional Web Push `PushManager` subscription is supported when `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is configured as a GitHub Repository Variable.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## GitHub Pages Deployment Setup (One-Time)

1. Open your GitHub repository → **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. *(Optional)* To enable Web Push subscription keys, run `npm run generate-vapid` and save `NEXT_PUBLIC_VAPID_PUBLIC_KEY` under **Settings → Secrets and variables → Actions → Variables**.

## Installing on Your Phone

- **Android (Chrome / Edge)**: Open `https://mhdjzlomr-a11y.github.io/YOUMEE/` and tap **Install** in the banner or Chrome menu (**Add to Home screen**).
- **iPhone / iPad (Safari 16.4+)**: Open `https://mhdjzlomr-a11y.github.io/YOUMEE/` in Safari, tap **Share** → **Add to Home Screen**, then launch **YOUMEE** from your Home Screen to enable notifications.

## Verification Scripts

```bash
npm test
npx next typegen
npx tsc --noEmit
npm run lint
npm run build
```
