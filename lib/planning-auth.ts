import { cookies } from "next/headers";

const COOKIE_NAME = "planning_admin";

export async function isPlanningAuthenticated(): Promise<boolean> {
  const secret = process.env.PLANNING_ADMIN_SECRET;
  if (!secret) return false;

  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === secret;
}

export async function setPlanningSession(): Promise<void> {
  const secret = process.env.PLANNING_ADMIN_SECRET;
  if (!secret) throw new Error("PLANNING_ADMIN_SECRET is not set");

  const jar = await cookies();
  jar.set(COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearPlanningSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function verifyPlanningPassword(password: string): boolean {
  const secret = process.env.PLANNING_ADMIN_SECRET?.trim();
  return Boolean(secret && password.trim() === secret);
}
