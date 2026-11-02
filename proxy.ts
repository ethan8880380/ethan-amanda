import { NextResponse, type NextRequest } from "next/server";
import { SITE_GATE_COOKIE, expectedGateToken, safeNextPath } from "@/lib/site-gate";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/unlock" || pathname.startsWith("/unlock/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SITE_GATE_COOKIE)?.value;
  if (token && token === (await expectedGateToken())) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  const next = safeNextPath(`${pathname}${search}`);
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static).*)"],
};
