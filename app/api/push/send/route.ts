import { sendNotification } from "web-push";
import {
  getVapidServerConfig,
  isValidPushSubscription,
  listPushSubscriptions,
  removePushSubscription,
} from "@/lib/pushStore";
import type { SerializedPushSubscription } from "@/lib/types";

interface SendPushBody {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  subscription?: SerializedPushSubscription;
}

export async function POST(request: Request) {
  const vapid = getVapidServerConfig();
  if (!vapid.configured) {
    return Response.json(
      {
        ok: false,
        vapidConfigured: false,
        error:
          "VAPID keys are not configured. Run `npm run generate-vapid` and add the keys to `.env.local` to send remote Web Push notifications.",
      },
      { status: 503 }
    );
  }

  let payload: SendPushBody = {};
  try {
    payload = (await request.json()) as SendPushBody;
  } catch {
    payload = {};
  }

  const targets: SerializedPushSubscription[] = isValidPushSubscription(
    payload.subscription
  )
    ? [payload.subscription]
    : listPushSubscriptions();

  if (targets.length === 0) {
    return Response.json(
      { ok: false, error: "No active push subscriptions found." },
      { status: 404 }
    );
  }

  const notificationJson = JSON.stringify({
    title: payload.title?.trim() || "YOUMEE Daily",
    body: payload.body?.trim() || "Time to check your daily tasks.",
    url: payload.url || "/",
    tag: payload.tag || "youmee-push",
  });

  const vapidDetails = {
    subject: vapid.subject,
    publicKey: vapid.publicKey,
    privateKey: vapid.privateKey,
  };

  let sentCount = 0;
  for (const sub of targets) {
    try {
      await sendNotification(sub, notificationJson, { vapidDetails });
      sentCount += 1;
    } catch (err) {
      const statusCode =
        typeof err === "object" && err && "statusCode" in err
          ? Number((err as { statusCode?: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        removePushSubscription(sub.endpoint);
      }
    }
  }

  return Response.json({
    ok: sentCount > 0,
    sentCount,
    totalTargets: targets.length,
  });
}
