"use server";
import { headers } from "next/headers";
import { createBooking, manageBooking } from "@/lib/server/appointments";
import { submitEnquiry } from "@/lib/server/enquiries";
import { checkOrigin, rateLimit } from "@/lib/server/security";
import { publicError } from "@/lib/server/errors";

async function mutate<T>(scope: string, operation: () => Promise<T>) {
  try {
    const context = await headers();
    checkOrigin(context);
    await rateLimit(context, scope);
    return { ok: true as const, data: await operation() };
  } catch (error) {
    const failure = publicError(error);
    return {
      ok: false as const,
      error: { code: failure.code, message: failure.message },
    };
  }
}
export async function createBookingAction(input: unknown) {
  return mutate("booking-write", () => createBooking(input));
}
export async function manageBookingAction(input: unknown) {
  return mutate("booking-manage", () => manageBooking(input));
}
export async function submitEnquiryAction(input: unknown) {
  return mutate("enquiry-write", () => submitEnquiry(input));
}
