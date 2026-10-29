import { PrismaClient } from "@prisma/client";

/**
 * One PrismaClient per server instance. In dev, Next.js hot reloads would
 * otherwise open a new connection pool on every change.
 * DATABASE_URL must be Neon's POOLED connection string.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
