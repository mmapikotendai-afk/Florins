import "server-only";
import { z } from "zod";
import { AppError } from "./errors";
import { identifier } from "./schemas";
import { scheduleTransaction } from "./transaction";
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
const text = z.string().trim().min(1).max(3000);
// Only approved local assets; no arbitrary fetch, file paths, uploads or remote-image proxy.
const photo = z
  .object({
    src: z.string().regex(/^\/images\/[a-zA-Z0-9_-]+\.(webp|jpe?g|png)$/),
    alt: text,
    width: z.number().int().min(1).max(12000),
    height: z.number().int().min(1).max(12000),
  })
  .strict();
const service = z
  .object({
    kind: z.literal("service"),
    id: identifier,
    name: z.string().trim().min(2).max(100),
    description: text,
    durationMinutes: z.number().int().min(5).max(480),
    intervalMinutes: z.number().int().min(5).max(120),
    enabled: z.boolean(),
    sample: z.boolean(),
  })
  .strict();
const staff = z
  .object({
    kind: z.literal("staff"),
    id: z.uuid(),
    name: z.string().trim().min(2).max(100),
    enabled: z.boolean(),
    sample: z.boolean(),
    serviceIds: z.array(identifier).max(50),
  })
  .strict();
const window = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  })
  .strict()
  .refine((value) => value.endMinute > value.startMinute);
const availability = z
  .object({
    kind: z.literal("availability"),
    staffId: z.uuid(),
    windows: z.array(window).max(28),
  })
  .strict();
const block = z
  .object({
    kind: z.literal("block"),
    staffId: z.uuid().nullable(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    reason: z.string().trim().max(500).optional(),
  })
  .strict()
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt));
const collection = z
  .object({
    kind: z.literal("collection"),
    id: identifier,
    slug,
    name: z.string().trim().min(2).max(100),
    description: text,
    cover: photo,
    sortOrder: z.number().int().min(0).max(10000),
    published: z.boolean(),
    sample: z.boolean(),
  })
  .strict();
const product = z
  .object({
    kind: z.literal("product"),
    id: identifier,
    slug,
    name: z.string().trim().min(2).max(150),
    description: text,
    sizes: z.array(z.string().min(1).max(40)).max(30),
    fabric: z.string().max(1000).nullable(),
    amountMinor: z.number().int().nonnegative().max(2147483647).nullable(),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),
    making: z.enum(["CUSTOM_MADE", "READY_MADE", "UNCONFIRMED"]),
    published: z.boolean(),
    sample: z.boolean(),
    collectionIds: z.array(identifier).min(1).max(30),
    images: z.array(photo).min(1).max(12),
  })
  .strict()
  .refine(
    (value) => (value.amountMinor === null) === (value.currency === null),
  );
const configuration = z.discriminatedUnion("kind", [
  service,
  staff,
  availability,
  block,
  collection,
  product,
  z.object({ kind: z.literal("remove-block"), id: z.uuid() }).strict(),
]);
export async function updateConfiguration(input: unknown) {
  const data = configuration.parse(input);
  return scheduleTransaction(async (tx) => {
    switch (data.kind) {
      case "service": {
        const { kind, ...record } = data;
        void kind;
        await tx.appointmentService.upsert({
          where: { id: record.id },
          create: record,
          update: record,
        });
        break;
      }
      case "staff": {
        const { kind, serviceIds, ...record } = data;
        void kind;
        await tx.staff.upsert({
          where: { id: record.id },
          create: {
            ...record,
            services: { connect: serviceIds.map((id) => ({ id })) },
          },
          update: {
            ...record,
            services: { set: serviceIds.map((id) => ({ id })) },
          },
        });
        break;
      }
      case "availability": {
        const upcoming = await tx.appointment.findMany({
          where: {
            staffId: data.staffId,
            status: { in: ["REQUESTED", "CONFIRMED"] },
            endsAt: { gt: new Date() },
          },
          select: { startsAt: true, endsAt: true },
        });
        for (const appointment of upcoming) {
          const local = new Date(appointment.startsAt.getTime() + 7200000);
          const minute = local.getUTCHours() * 60 + local.getUTCMinutes();
          const length =
            (appointment.endsAt.getTime() - appointment.startsAt.getTime()) /
            60000;
          if (
            !data.windows.some(
              (item) =>
                item.weekday === local.getUTCDay() &&
                item.startMinute <= minute &&
                item.endMinute >= minute + length,
            )
          )
            throw new AppError(
              "EXISTING_APPOINTMENT",
              "The schedule would exclude an existing appointment. Resolve that appointment first.",
              409,
            );
        }
        await tx.staffAvailability.deleteMany({
          where: { staffId: data.staffId },
        });
        await tx.staffAvailability.createMany({
          data: data.windows.map((item) => ({
            ...item,
            staffId: data.staffId,
          })),
        });
        break;
      }
      case "block": {
        const start = new Date(data.startsAt),
          end = new Date(data.endsAt);
        if (
          await tx.appointment.count({
            where: {
              status: { in: ["REQUESTED", "CONFIRMED"] },
              startsAt: { lt: end },
              endsAt: { gt: start },
              ...(data.staffId ? { staffId: data.staffId } : {}),
            },
          })
        )
          throw new AppError(
            "EXISTING_APPOINTMENT",
            "This block overlaps an existing appointment. Resolve that appointment first.",
            409,
          );
        await tx.blockedDate.create({
          data: {
            staffId: data.staffId,
            startsAt: start,
            endsAt: end,
            reason: data.reason,
          },
        });
        break;
      }
      case "remove-block":
        await tx.blockedDate.delete({ where: { id: data.id } });
        break;
      case "collection": {
        const { kind, cover, ...record } = data;
        void kind;
        const mapped = {
          ...record,
          coverSrc: cover.src,
          coverAlt: cover.alt,
          coverWidth: cover.width,
          coverHeight: cover.height,
        };
        await tx.collection.upsert({
          where: { id: record.id },
          create: mapped,
          update: mapped,
        });
        break;
      }
      case "product": {
        const { kind, collectionIds, images, ...record } = data;
        void kind;
        await tx.product.upsert({
          where: { id: record.id },
          create: {
            ...record,
            collections: { connect: collectionIds.map((id) => ({ id })) },
            images: {
              create: images.map((item, position) => ({ ...item, position })),
            },
          },
          update: {
            ...record,
            collections: { set: collectionIds.map((id) => ({ id })) },
            images: {
              deleteMany: {},
              create: images.map((item, position) => ({ ...item, position })),
            },
          },
        });
        break;
      }
    }
    return { updated: true };
  });
}
