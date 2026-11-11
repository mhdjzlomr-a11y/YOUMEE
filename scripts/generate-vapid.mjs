import { generateVAPIDKeys } from "web-push";

const keys = generateVAPIDKeys();

console.log("# Paste these into .env.local to enable remote Web Push notifications");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:you@example.com");
