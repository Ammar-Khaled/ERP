// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const protectedRoutes = [
      "/",
      "/inventory",
      "/product",
      "/sales",
      "/purchases",
      "/reports",
      "/users-management",
      "/client-supplier",
      "/services",
      "/settings",
    ];
    const isAuthRoute = pathname.startsWith("/auth/auth1/login");
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/auth1/login", request.url));
    }

    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/auth/auth1/login",
    "/",
    "/inventory/:path*",
    "/product/:path*",
    "/sales/:path*",
    "/purchases/:path*",
    "/reports/:path*",
    "/users-management/:path*",
    "/client-supplier/:path*",
    "/services/:path*",
    "/settings/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
