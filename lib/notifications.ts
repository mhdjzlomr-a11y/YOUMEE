import type { SerializedPushSubscription } from "./types";

export interface NotificationEnvironment {
  supported: boolean;
  pushSupported: boolean;
  serviceWorkerSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isIOS: boolean;
  isStandalone: boolean;
  vapidConfigured: boolean;
}

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export function getNotificationEnvironment(): NotificationEnvironment {
  if (typeof window === "undefined") {
    return {
      supported: false,
      pushSupported: false,
      serviceWorkerSupported: false,
      permission: "unsupported",
      isIOS: false,
      isStandalone: false,
      vapidConfigured: Boolean(getVapidPublicKey()),
    };
  }

  const supported = "Notification" in window;
  const serviceWorkerSupported = "serviceWorker" in navigator;
  const pushSupported = serviceWorkerSupported && "PushManager" in window;

  return {
    supported,
    pushSupported,
    serviceWorkerSupported,
    permission: supported ? Notification.permission : "unsupported",
    isIOS: isIOSDevice(),
    isStandalone: isStandalonePWA(),
    vapidConfigured: Boolean(getVapidPublicKey()),
  };
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  } catch {
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration || !("pushManager" in registration)) return null;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeDeviceToPush(): Promise<{
  ok: boolean;
  subscription?: SerializedPushSubscription;
  reason?: string;
}> {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return {
      ok: false,
      reason: "VAPID public key is not configured yet. Local device reminders remain active.",
    };
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return {
      ok: false,
      reason: "Web Push is not supported in this browser.",
    };
  }

  const registration = await navigator.serviceWorker.ready;
  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const serialized = JSON.parse(JSON.stringify(sub)) as SerializedPushSubscription;
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serialized),
  });

  if (!response.ok) {
    return { ok: false, reason: "Failed to register push subscription on server." };
  }

  return { ok: true, subscription: serialized };
}

export async function unsubscribeDeviceFromPush(): Promise<void> {
  const sub = await getExistingPushSubscription();
  if (!sub) return;

  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);
}

export async function showLocalNotification(payload: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission !== "granted") {
    return false;
  }

  if ("serviceWorker" in navigator) {
    try {
      const reg =
        (await navigator.serviceWorker.getRegistration("/")) ||
        (await navigator.serviceWorker.ready);
      if (reg) {
        await reg.showNotification(payload.title, {
          body: payload.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: payload.tag || "youmee-reminder",
          data: { url: payload.url || "/" },
        });
        return true;
      }
    } catch {
      // Fallback to window Notification below
    }
  }

  try {
    new Notification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192x192.png",
      tag: payload.tag || "youmee-reminder",
    });
    return true;
  } catch {
    return false;
  }
}
