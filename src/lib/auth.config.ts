import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt) — imported by middleware.
 * The Credentials provider lives in ./auth.ts, which runs on Node.js.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  trustHost: true,
  providers: [],
  callbacks: {
    /** Gate every /admin route except the login and password-reset pages. */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (["/admin/forgot", "/admin/reset"].some((p) => nextUrl.pathname.startsWith(p))) return true;
      const isLogin = nextUrl.pathname.startsWith("/admin/login");
      if (isLogin) {
        return isLoggedIn ? Response.redirect(new URL("/admin", nextUrl)) : true;
      }
      return isLoggedIn; // false → redirect to pages.signIn
    },
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
} satisfies NextAuthConfig;
