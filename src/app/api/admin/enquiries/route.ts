import { z } from "zod";
import { getDb } from "@/lib/db/prisma";
import { api, readJson } from "@/lib/server/http";
import { checkOrigin, requireAdmin } from "@/lib/server/security";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return api(async () => {
    await requireAdmin(request.headers);
    const params = z
      .object({
        status: z.enum(["NEW", "REVIEWING", "CLOSED"]).default("NEW"),
        take: z.coerce.number().int().min(1).max(50).default(20),
      })
      .strict()
      .parse(Object.fromEntries(new URL(request.url).searchParams));
    return getDb().bespokeEnquiry.findMany({
      where: { status: params.status },
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        reference: true,
        status: true,
        occasion: true,
        preferredDate: true,
        eventDate: true,
        description: true,
        notes: true,
        createdAt: true,
        customer: { select: { fullName: true, email: true, phone: true } },
      },
    });
  });
}
export async function PATCH(request: Request) {
  return api(async () => {
    checkOrigin(request.headers);
    await requireAdmin(request.headers);
    const data = z
      .object({
        reference: z.string().regex(/^ENQ-[A-F0-9]{16}$/),
        status: z.enum(["NEW", "REVIEWING", "CLOSED"]),
      })
      .strict()
      .parse(await readJson(request));
    await getDb().bespokeEnquiry.update({
      where: { reference: data.reference },
      data: { status: data.status },
    });
    return { updated: true };
  });
}
