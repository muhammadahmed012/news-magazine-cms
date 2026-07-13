// src/proxy.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isApiAdminRoute = nextUrl.pathname.startsWith("/api/admin");

  if (isAdminRoute || isApiAdminRoute) {
    if (!isLoggedIn) {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    const role = req.auth?.user?.role;
    const allowedRoles = ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR"];

    if (!role || !allowedRoles.includes(role)) {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
