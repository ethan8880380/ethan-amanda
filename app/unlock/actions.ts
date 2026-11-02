"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SITE_GATE_COOKIE,
  expectedGateToken,
  passwordMatches,
  safeNextPath,
} from "@/lib/site-gate";

export async function unlockSite(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!(await passwordMatches(password))) {
    const params = new URLSearchParams({ error: "1" });
    if (next !== "/") params.set("next", next);
    redirect(`/unlock?${params.toString()}`);
  }

  const jar = await cookies();
  jar.set(SITE_GATE_COOKIE, await expectedGateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(next);
}
