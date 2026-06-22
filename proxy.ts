import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next 16 renamed the "middleware" convention to "proxy". Same signature.
// Protect dashboards by role. The token carries `role` (see lib/auth.ts).
export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    const sectionForRole: Record<string, string> = {
      "/student": "student",
      "/company": "company",
      "/admin": "admin",
    };

    for (const [prefix, requiredRole] of Object.entries(sectionForRole)) {
      if (pathname.startsWith(prefix) && role !== requiredRole) {
        // Logged in but wrong role -> send to their own dashboard / home.
        const url = req.nextUrl.clone();
        url.pathname = role ? `/${role}/dashboard` : "/login";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Must be authenticated to reach any matched route below.
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/admin/:path*"],
};
