import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/home", "/services", "/about", "/contact", "/login", "/auth"];
const ADMIN_SESSION_COOKIE = "admin_session";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_RULES: Array<{ prefix: string; limit: number }> = [
  { prefix: "/api/socket", limit: 300 },
  { prefix: "/api/auth", limit: 150 },
  { prefix: "/api/register", limit: 20 },
  { prefix: "/api/uploads", limit: 50 },
  { prefix: "/api/admin", limit: 120 },
  { prefix: "/api/actions", limit: 80 },
  { prefix: "/api/service-request", limit: 80 },
  { prefix: "/api", limit: 100 },
  { prefix: "/admin/login", limit: 60 },
  { prefix: "/admin", limit: 240 },
  { prefix: "/dashboard", limit: 300 },
  { prefix: "/", limit: 600 },
];

const rateLimitStore = new Map<string, RateLimitBucket>();
let cleanupCounter = 0;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.ip || "unknown";
}

function getRateLimitRule(pathname: string) {
  const matchedRule = RATE_LIMIT_RULES.find((rule) => pathname.startsWith(rule.prefix));

  if (matchedRule) {
    return matchedRule;
  }

  return {
    prefix: "/",
    limit: 600,
  };
}

function maybeCleanupRateLimitStore(now: number) {
  cleanupCounter += 1;

  if (cleanupCounter % 200 !== 0) {
    return;
  }

  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function applyRateLimit(request: NextRequest, pathname: string) {
  const now = Date.now();
  const ip = getClientIp(request);
  const rule = getRateLimitRule(pathname);
  const windowKey = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const bucketKey = `${ip}:${rule.prefix}:${windowKey}`;

  maybeCleanupRateLimitStore(now);

  const existing = rateLimitStore.get(bucketKey);

  if (!existing) {
    const resetAt = (windowKey + 1) * RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(bucketKey, { count: 1, resetAt });

    return {
      allowed: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      resetAt,
    };
  }

  if (existing.count >= rule.limit) {
    return {
      allowed: false,
      limit: rule.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(bucketKey, existing);

  return {
    allowed: true,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  return PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(`${route}/`));
}

function createRateLimitResponse(rateLimitResult: ReturnType<typeof applyRateLimit>) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
  );

  return NextResponse.json(
    {
      message: "Too many requests. Please wait a moment before retrying.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(rateLimitResult.limit),
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
      },
    }
  );
}

function applyRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: ReturnType<typeof applyRateLimit>
) {
  response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(rateLimitResult.resetAt / 1000)));

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminPageRoute = pathname.startsWith("/admin");
  const isAdminLoginPageRoute = pathname === "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isAdminAuthApiRoute = pathname.startsWith("/api/admin/auth");
  const hasAdminSession = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  const rateLimitResult = applyRateLimit(request, pathname);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  if (isAdminPageRoute) {
    if (isAdminLoginPageRoute && hasAdminSession) {
      return applyRateLimitHeaders(
        NextResponse.redirect(new URL("/admin/dashboard", request.url)),
        rateLimitResult
      );
    }

    if (!isAdminLoginPageRoute && !hasAdminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search || ""}`);
      return applyRateLimitHeaders(NextResponse.redirect(loginUrl), rateLimitResult);
    }
  }

  if (isAdminApiRoute && !isAdminAuthApiRoute && !hasAdminSession) {
    return applyRateLimitHeaders(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      rateLimitResult
    );
  }

  if (isPublicRoute(pathname) || pathname.startsWith("/api/auth")) {
    return applyRateLimitHeaders(NextResponse.next(), rateLimitResult);
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const token = secret ? await getToken({ req: request, secret }) : null;

  if (pathname.startsWith("/dashboard") && token?.role === "admin") {
    return applyRateLimitHeaders(
      NextResponse.redirect(new URL("/admin/dashboard", request.url)),
      rateLimitResult
    );
  }

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/actions") ||
    pathname.startsWith("/api/service-request");

  if (needsAuth && !token) {
    if (pathname.startsWith("/api/")) {
      return applyRateLimitHeaders(
        NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
        rateLimitResult
      );
    }

    const callbackUrl = `${pathname}${search || ""}`;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return applyRateLimitHeaders(NextResponse.redirect(loginUrl), rateLimitResult);
  }

  return applyRateLimitHeaders(NextResponse.next(), rateLimitResult);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
