import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 1. Redirect logged-in users from login page to their respective dashboards
    if (pathname === "/admin/login" && token) {
      if (token.role === "ADMIN" || token.role === "EDITOR") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (token.role === "REVIEWER") {
        return NextResponse.redirect(new URL("/reviewer/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Role-based protection
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const allowedRoles = ["ADMIN", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR", "EDITOR", "FINANCE_ADMIN"];
      if (!token || !allowedRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // 3. Finance Admin Isolation
      if (token.role === "FINANCE_ADMIN") {
        const financePaths = ["/admin/dashboard", "/admin/payments", "/admin/pricing"];
        const isFinancePath = financePaths.some(p => pathname.startsWith(p));
        if (!isFinancePath) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
      }
    }

    if (pathname.startsWith("/reviewer")) {
      if (token?.role !== "REVIEWER" && token?.role !== "ADMIN" && token?.role !== "EDITOR_IN_CHIEF") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        // Require auth for /admin (except login), /reviewer, /submission
        if (
          (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
          pathname.startsWith("/reviewer") ||
          pathname.startsWith("/submission")
        ) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*", "/reviewer/:path*", "/submission/:path*"] };
