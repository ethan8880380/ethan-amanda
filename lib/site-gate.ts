export const SITE_GATE_COOKIE = "site_gate";

const GATE_PREFIX = "ethan-amanda-site-gate:";

function sitePassword() {
  return (process.env.SITE_PASSWORD ?? "therogers").trim();
}

async function tokenFor(password: string) {
  const data = new TextEncoder().encode(`${GATE_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function expectedGateToken() {
  return tokenFor(sitePassword());
}

export async function passwordMatches(password: string) {
  const given = await tokenFor(password.trim());
  const expected = await expectedGateToken();
  if (given.length !== expected.length) return false;

  let mismatch = 0;
  for (let i = 0; i < given.length; i++) {
    mismatch |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Only allow same-site relative paths after a successful unlock. */
export function safeNextPath(value: string | null | undefined) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value.includes("\\") || value.includes("\n") || value.includes("\r")) {
    return "/";
  }
  if (value === "/unlock" || value.startsWith("/unlock?") || value.startsWith("/unlock/")) {
    return "/";
  }
  return value;
}
