import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db/prisma";
import { AppError } from "./errors";
export type Transaction = Prisma.TransactionClient;
export async function scheduleTransaction<T>(
  operation: (tx: Transaction) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await getDb().$transaction(
        async (tx) => {
          // Also used by schedule/service/block writes: policy cannot change during a booking.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(771640916)`;
          return operation(tx);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 15000,
          timeout: 20000,
        },
      );
    } catch (error) {
      const detail = error as { code?: string; meta?: unknown };
      const meta = JSON.stringify(detail.meta ?? {});
      if ((detail.code === "P2034" || /40001|40P01/.test(meta)) && attempt < 3)
        continue;
      if (detail.code === "P2002" || /23P01|Appointment_no_overlap/.test(meta))
        throw new AppError(
          "CONFLICT",
          "That time or request has changed. Please refresh and try again.",
          409,
        );
      throw error;
    }
  }
  throw new AppError(
    "CONFLICT",
    "Please refresh availability and try again.",
    409,
  );
}
