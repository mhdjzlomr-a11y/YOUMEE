import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "YOUMEE Daily — Task Tracker",
  description:
    "Mobile-friendly daily task and worship tracker PWA with scheduled times, local persistence, and push reminders.",
  applicationName: "YOUMEE Daily",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YOUMEE",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: `${basePath}/icons/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `${basePath}/icons/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2f5cf0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh bg-[#eef2fb] text-slate-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
