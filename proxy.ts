import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizePathname } from "@/lib/seo/urlNormalization";
import { recordApiInvocation } from "@/lib/ops/metrics";

const SUNSET_MODE = false;
const SUNSET_MESSAGE = "VCM Suite is now closed. Thank you for your support over the years.";

const API_RATE_WINDOW_MS = 10 * 60 * 1000;
const API_DEFAULT_LIMIT = 120;

const ACTION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const API_PROTECTION_EXCEPTIONS = [
  "/api/admin/",
  "/api/auth/",
  "/api/webhooks/",
  "/api/user/entitlements",
  "/api/user/subscription-capabilities",
];
const UPLOAD_API_BYPASS_PREFIXES = ["/api/workspace/upload", "/api/upload", "/api/admin/upload"];


const SUNSET_ALLOWED_PATHS = new Set([
  "/",
  "/robots.txt",
  "/sitemap.xml",
]);

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __vcmApiActionRateLimit: Map<string, RateLimitEntry> | undefined;
}

const apiRateLimitState = globalThis.__vcmApiActionRateLimit ?? new Map<string, RateLimitEntry>();
globalThis.__vcmApiActionRateLimit = apiRateLimitState;

function normalizeRateLimitPath(pathname: string): string {
  return pathname
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:id"
    );
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "unknown";
}

function isLikelyCrawlerUserAgent(userAgent: string): boolean {
  const value = userAgent.toLowerCase();
  return /(bot|crawler|spider|slurp|bingpreview|bytespider|curl|wget|python-requests|scrapy|headless)/.test(
    value
  );
}

function shouldProtectApiAction(pathname: string, method: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  if (!ACTION_METHODS.has(method.toUpperCase())) return false;
  return !API_PROTECTION_EXCEPTIONS.some((prefix) => pathname.startsWith(prefix));
}

function checkActionRateLimit(ip: string, pathname: string, limit: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const routeKey = normalizeRateLimitPath(pathname);
  const key = `${routeKey}:${ip}`;
  const current = apiRateLimitState.get(key);

  if (!current || now >= current.resetAt) {
    apiRateLimitState.set(key, { count: 1, resetAt: now + API_RATE_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function cleanupRateLimitState(): void {
  if (apiRateLimitState.size < 5000) return;
  const now = Date.now();
  for (const [key, value] of apiRateLimitState.entries()) {
    if (now >= value.resetAt) {
      apiRateLimitState.delete(key);
    }
  }
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();

  if (SUNSET_MODE && !SUNSET_ALLOWED_PATHS.has(pathname)) {
    const isApi = pathname.startsWith("/api/");
    if (isApi) {
      return NextResponse.json(
        { error: "VCM Suite is now closed." },
        {
          status: 410,
          headers: {
            "Cache-Control": "public, max-age=300",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }
      );
    }

    return new NextResponse(
      `<!doctype html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>${SUNSET_MESSAGE}</p></body></html>`,
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }

  if (UPLOAD_API_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    recordApiInvocation(pathname);

    if (shouldProtectApiAction(pathname, method)) {
      const userAgent = request.headers.get("user-agent") || "";
      if (isLikelyCrawlerUserAgent(userAgent)) {
        return NextResponse.json(
          { error: "Automated clients are blocked on action APIs." },
          {
            status: 403,
            headers: {
              "Cache-Control": "private, no-store, max-age=0",
            },
          }
        );
      }

      const ip = getClientIp(request);
      const limit = API_DEFAULT_LIMIT;
      const decision = checkActionRateLimit(ip, pathname, limit);
      cleanupRateLimitState();

      if (!decision.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down and retry shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(decision.retryAfterSeconds),
              "Cache-Control": "private, no-store, max-age=0",
            },
          }
        );
      }
    }

    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const normalizedPathname = normalizePathname(pathname);
  if (normalizedPathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = normalizedPathname;
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();

  response.headers.set("x-pathname", normalizedPathname);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/workspace/upload|api/upload|api/admin/upload).*)",
  ],
};
