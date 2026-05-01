import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const rate = checkRateLimit(`${request.headers.get("x-forwarded-for") ?? "local"}:${request.nextUrl.pathname}`);
  if (!rate.allowed) {
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "x-ratelimit-remaining": String(rate.remaining),
          "x-ratelimit-reset": String(rate.resetAt)
        }
      }
    );
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && process.env.NODE_ENV === "production") {
    const session = request.cookies.get("rt_session")?.value;
    const csrf = request.headers.get("x-csrf-token");
    if (session && !csrf) {
      return Response.json({ error: "Missing CSRF token" }, { status: 403 });
    }
  }
  const response = NextResponse.next();
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("x-remediation-twin-route", request.nextUrl.pathname);
  response.headers.set("x-ratelimit-remaining", String(rate.remaining));
  response.headers.set("x-ratelimit-reset", String(rate.resetAt));
  if (process.env.NODE_ENV === "production") {
    response.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

function checkRateLimit(key: string) {
  const limit = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120);
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + 60_000;
    rateLimits.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}
