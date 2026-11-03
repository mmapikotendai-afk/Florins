import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Lazy connection: static pages and builds do not require a live database. */
export function getDb() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("Set DATABASE_URL before using database features.");
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  globalForPrisma.prisma = client;
  return client;
}
