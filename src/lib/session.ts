// Web Crypto (not Node's `crypto` module) on purpose — this runs in both
// the Edge middleware and regular route handlers, and only Web Crypto works
// in both.
export const SESSION_COOKIE = "mementos_admin_session";

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// The cookie value is just an HMAC of a fixed marker string, keyed by
// SESSION_SECRET — anyone who knows the correct password gets the same
// cookie, there's no per-user session state to track. That's fine for a
// single shared admin login.
export async function makeSessionToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return hmac(secret, "mementos-admin-authenticated");
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await makeSessionToken();
  return timingSafeEqual(token, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
