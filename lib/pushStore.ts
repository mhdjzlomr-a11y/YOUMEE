import type { SerializedPushSubscription } from "./types";

/**
 * Lightweight in-memory subscription store for single-instance / demo Web Push.
 * Replace with a persistent database (e.g., Postgres, Redis, or Netlify Blobs)
 * when deploying across serverless workers.
 */
const subscriptions = new Map<string, SerializedPushSubscription>();

export function isValidPushSubscription(
  input: unknown
): input is SerializedPushSubscription {
  if (!input || typeof input !== "object") return false;
  const candidate = input as Partial<SerializedPushSubscription>;
  return (
    typeof candidate.endpoint === "string" &&
    candidate.endpoint.startsWith("https://") &&
    Boolean(candidate.keys) &&
    typeof candidate.keys?.p256dh === "string" &&
    candidate.keys.p256dh.length > 0 &&
    typeof candidate.keys?.auth === "string" &&
    candidate.keys.auth.length > 0
  );
}

export function savePushSubscription(sub: SerializedPushSubscription): void {
  subscriptions.set(sub.endpoint, sub);
}

export function removePushSubscription(endpoint: string): boolean {
  return subscriptions.delete(endpoint);
}

export function listPushSubscriptions(): SerializedPushSubscription[] {
  return Array.from(subscriptions.values());
}

export function getVapidServerConfig(): {
  configured: boolean;
  publicKey: string;
  privateKey: string;
  subject: string;
} {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
    "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:you@example.com";

  return {
    configured: Boolean(publicKey && privateKey),
    publicKey,
    privateKey,
    subject,
  };
}
