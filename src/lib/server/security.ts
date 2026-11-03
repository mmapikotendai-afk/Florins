import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { getDb } from "@/lib/db/prisma";
import { AppError } from "./errors";

export function developmentDataAllowed() {
  return ["development", "test"].includes(process.env.FLORINS_ENV ?? "");
}
export function keyedHash(value: string) {
  const secret = process.env.BOOKING_TOKEN_SECRET;
  if (!secret || secret.length < 32)
    throw new AppError("CONFIGURATION", "Booking is not configured.", 503);
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function equalHash(left: string, right: string) {
  return (
    left.length === right.length &&
    timingSafeEqual(Buffer.from(left), Buffer.from(right))
  );
}
export function checkOrigin(headers: Headers) {
  const origin = headers.get("origin");
  if (!origin) return; // Non-browser API callers still pass validation, authorization and limiting.
  // NEXT_PUBLIC values are embedded at build time. Allow a server-only origin
  // for running the same bundle in an isolated local environment.
  const configured =
    process.env.SITE_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (
    developmentDataAllowed() &&
    process.env.LOCAL_PREVIEW_ORIGINS?.split(",").includes(origin)
  )
    return;
  if (!configured || origin !== new URL(configured).origin)
    throw new AppError("ORIGIN", "Request origin is not allowed.", 403);
}
export async function rateLimit(
  headers: Headers,
  scope: string,
  limit = 8,
  seconds = 900,
) {
  const trusted = process.env.RATE_LIMIT_TRUSTED_HEADER;
  const candidate = trusted
    ? headers.get(trusted)?.split(",")[0]?.trim()
    : undefined;
  // Without an explicitly trusted, proxy-overwritten header use a shared fail-closed bucket.
  const identity = candidate && isIP(candidate) ? candidate : "shared";
  const now = Date.now();
  const window = Math.floor(now / (seconds * 1000));
  const key = keyedHash(`rate:${scope}:${identity}:${window}`);
  const expiresAt = new Date((window + 1) * seconds * 1000);
  const result = await getDb().$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
    RETURNING "count"`;
  if (result[0].count > limit)
    throw new AppError(
      "RATE_LIMIT",
      "Too many requests. Please try again later.",
      429,
    );
}
export async function requireAdmin(headers: Headers) {
  const bearer = headers.get("authorization");
  if (!bearer?.startsWith("Bearer ") || bearer.length > 8192)
    throw new AppError(
      "UNAUTHORIZED",
      "Administrator authentication is required.",
      401,
    );
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new AppError(
      "AUTH_UNAVAILABLE",
      "Administrator authentication is not configured.",
      503,
    );
  await rateLimit(headers, "admin-auth", 60, 600);
  // Ask Supabase Auth to verify the token; never trust a decoded JWT or user-supplied role.
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { apikey: key, Authorization: bearer },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new AppError(
      "UNAUTHORIZED",
      "Administrator authentication is required.",
      401,
    );
  const verified = z.object({ id: z.uuid() }).safeParse(await response.json());
  if (!verified.success)
    throw new AppError(
      "UNAUTHORIZED",
      "Administrator authentication is required.",
      401,
    );
  const admin = await getDb().adminUser.findUnique({
    where: { authUserId: verified.data.id },
  });
  if (!admin?.enabled)
    throw new AppError("FORBIDDEN", "Administrator access is required.", 403);
  return admin;
}
