import {
  getVapidServerConfig,
  isValidPushSubscription,
  listPushSubscriptions,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/pushStore";

export async function GET() {
  const vapid = getVapidServerConfig();
  return Response.json({
    vapidConfigured: vapid.configured,
    subscriptionCount: listPushSubscriptions().length,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!isValidPushSubscription(body)) {
    return Response.json(
      { error: "Invalid Web Push subscription payload." },
      { status: 400 }
    );
  }

  savePushSubscription(body);
  return Response.json({
    ok: true,
    subscriptionCount: listPushSubscriptions().length,
  });
}

export async function DELETE(request: Request) {
  let body: { endpoint?: string } = {};
  try {
    body = (await request.json()) as { endpoint?: string };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.endpoint || typeof body.endpoint !== "string") {
    return Response.json({ error: "Missing endpoint." }, { status: 400 });
  }

  removePushSubscription(body.endpoint);
  return Response.json({
    ok: true,
    subscriptionCount: listPushSubscriptions().length,
  });
}
