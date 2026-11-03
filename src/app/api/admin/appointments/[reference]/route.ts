import { z } from "zod";
import { getDb } from "@/lib/db/prisma";
import { adminChangeAppointment } from "@/lib/server/appointments";
import { api, readJson } from "@/lib/server/http";
import { checkOrigin, requireAdmin } from "@/lib/server/security";
import { dateKeySchema, timeSchema } from "@/lib/server/schemas";
import { AppError } from "@/lib/server/errors";
export const runtime = "nodejs";
const referenceSchema = z.string().regex(/^FLR-[A-F0-9]{16}$/);
const changeSchema = z
  .object({
    operation: z.enum(["cancel", "reschedule", "status"]),
    expectedVersion: z.number().int().positive(),
    date: dateKeySchema.optional(),
    time: timeSchema.optional(),
    status: z
      .enum(["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
      .optional(),
  })
  .strict();
type Context = { params: Promise<{ reference: string }> };
export async function PATCH(request: Request, context: Context) {
  return api(async () => {
    checkOrigin(request.headers);
    await requireAdmin(request.headers);
    const reference = referenceSchema.parse((await context.params).reference);
    const data = changeSchema.parse(await readJson(request));
    return adminChangeAppointment({ ...data, reference });
  });
}
export async function GET(request: Request, context: Context) {
  return api(async () => {
    await requireAdmin(request.headers);
    const reference = referenceSchema.parse((await context.params).reference);
    const item = await getDb().appointment.findUnique({
      where: { reference },
      select: {
        reference: true,
        status: true,
        startsAt: true,
        endsAt: true,
        version: true,
        serviceName: true,
        staffId: true,
        notes: true,
        eventDate: true,
        customer: { select: { fullName: true, email: true, phone: true } },
      },
    });
    if (!item) throw new AppError("NOT_FOUND", "Appointment not found.", 404);
    return item;
  });
}
