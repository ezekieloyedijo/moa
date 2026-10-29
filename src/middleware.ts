import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge middleware: blocks every /admin route without a session.
// Server components and server actions re-check the session too.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*"],
};
