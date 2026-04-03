import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is logged in but tries to access the login page, redirect them to dashboard
    if (req.nextUrl.pathname === "/admin/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Only require auth for /admin/* paths except login
        if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };
