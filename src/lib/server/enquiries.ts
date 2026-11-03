import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/prisma";
import { enquirySubmissionSchema } from "./schemas";
import { equalHash, keyedHash } from "./security";
import { AppError } from "./errors";
import { scheduleTransaction } from "./transaction";
export async function submitEnquiry(input: unknown) {
  const { request, idempotencyKey } = enquirySubmissionSchema().parse(input);
  const keyHash = keyedHash(`enquiry-key:${idempotencyKey}`);
  const requestHash = keyedHash(JSON.stringify(request));
  return scheduleTransaction(async (tx) => {
    const existing = await tx.bespokeEnquiry.findUnique({
      where: { idempotencyKeyHash: keyHash },
    });
    if (existing) {
      if (!equalHash(existing.requestHash, requestHash))
        throw new AppError(
          "IDEMPOTENCY_CONFLICT",
          "This request key was already used.",
          409,
        );
      return { reference: existing.reference, status: existing.status };
    }
    const enquiry = await tx.bespokeEnquiry.create({
      data: {
        reference: `ENQ-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
        occasion: request.occasion,
        description: request.description,
        notes: request.notes || null,
        preferredDate: request.preferredDate
          ? new Date(`${request.preferredDate}T00:00:00Z`)
          : null,
        eventDate: request.eventDate
          ? new Date(`${request.eventDate}T00:00:00Z`)
          : null,
        idempotencyKeyHash: keyHash,
        requestHash,
        customer: {
          create: {
            fullName: request.fullName,
            email: request.email.toLowerCase(),
            phone: request.phone,
          },
        },
      },
    });
    await tx.notification.create({
      data: {
        customerId: enquiry.customerId,
        enquiryId: enquiry.id,
        kind: "ENQUIRY_RECEIVED",
        dedupeKey: `enquiry:${enquiry.id}`,
      },
    });
    return { reference: enquiry.reference, status: enquiry.status };
  });
}
export async function enquiryCount() {
  return getDb().bespokeEnquiry.count({ where: { status: "NEW" } });
}
