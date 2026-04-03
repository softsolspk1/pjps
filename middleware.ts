import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is logged in and visits login page, take them to dashboard
    if (req.nextUrl.pathname === "/admin/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        // Don't require auth for the login page itself
        if (path === "/admin/login") return true;
        // Require auth for all other /admin paths
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };
