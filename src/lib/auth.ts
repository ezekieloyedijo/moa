import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { rateLimit } from "./rate-limit";

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= bcrypt.hash("timing-equaliser", 12));

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 5 attempts per 15 minutes per IP, and per email.
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const [byIp, byEmail] = await Promise.all([
          rateLimit(`login:ip:${ip}`, 5, 15 * 60),
          rateLimit(`login:email:${email}`, 5, 15 * 60),
        ]);
        if (!byIp.ok || !byEmail.ok) throw new TooManyAttempts();

        let user = await prisma.user.findUnique({ where: { email } });

        // First-login bootstrap: create the owner from ADMIN_EMAIL + ADMIN_PASSWORD_HASH.
        if (!user) {
          const envEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
          const envHash = process.env.ADMIN_PASSWORD_HASH;
          if (envEmail && envHash && email === envEmail && (await bcrypt.compare(password, envHash))) {
            user = await prisma.user.create({ data: { email, passwordHash: envHash, name: "Admin" } });
            return { id: user.id, email: user.email, name: user.name };
          }
          // Constant-ish timing so attackers can't probe which emails exist.
          await bcrypt.compare(password, await dummyHash());
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
