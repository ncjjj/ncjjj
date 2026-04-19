import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/home", "/services", "/about", "/contact", "/login", "/auth"];

function isPublicRoute(pathname) {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  return PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(`${route}/`));
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (isPublicRoute(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/actions") ||
    pathname.startsWith("/api/admin");

  if (needsAuth && !token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const callbackUrl = `${pathname}${search || ""}`;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
