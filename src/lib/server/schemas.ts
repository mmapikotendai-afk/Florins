import { z } from "zod";
import { validDateKey, studioDateKey } from "@/lib/booking/dates";
import { bookingRequestSchema } from "@/lib/booking/schema";
import { createBespokeEnquirySchema } from "@/lib/validations/bespoke";
export const identifier = z.string().min(1).max(100);
export const dateKeySchema = z
  .string()
  .refine(validDateKey, "Choose a valid date.");
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const selectionSchema = z
  .object({ serviceId: identifier, date: dateKeySchema, time: timeSchema })
  .strict();
export const availabilitySchema = z
  .object({
    serviceId: identifier,
    from: dateKeySchema.default(() => studioDateKey()),
    days: z.coerce.number().int().min(1).max(56).default(56),
  })
  .strict();
export function createBookingSchema() {
  return z
    .object({ request: bookingRequestSchema(), idempotencyKey: z.uuid() })
    .strict();
}
export const manageSchema = z
  .object({
    reference: z.string().regex(/^FLR-[A-F0-9]{16}$/),
    token: z.string().regex(/^[a-f0-9]{64}$/),
    expectedVersion: z.number().int().positive(),
    operation: z.enum(["cancel", "reschedule"]),
    date: dateKeySchema.optional(),
    time: timeSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.operation === "reschedule" && (!value.date || !value.time))
      ctx.addIssue({ code: "custom", message: "Choose a new date and time." });
  });
export function enquirySubmissionSchema() {
  return z
    .object({ request: createBespokeEnquirySchema(), idempotencyKey: z.uuid() })
    .strict();
}
