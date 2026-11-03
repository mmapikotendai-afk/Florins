import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  collectionFixtures,
  designFixtures,
} from "../src/lib/catalogue/fixtures";
import { appointmentServices } from "../src/lib/booking/config";

// Explicit development opt-in, not NODE_ENV: `next start` also runs local production builds.
if (
  process.env.FLORINS_ENV !== "development" ||
  process.env.ALLOW_DEVELOPMENT_SEED !== "true"
)
  throw new Error(
    "Development seed refused. Set FLORINS_ENV=development and ALLOW_DEVELOPMENT_SEED=true for an isolated development database only.",
  );
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  try {
    for (const item of collectionFixtures) {
      const data = {
        slug: item.slug,
        name: item.name,
        description: item.description,
        coverSrc: item.cover.src,
        coverAlt: item.cover.alt,
        coverWidth: item.cover.width,
        coverHeight: item.cover.height,
        sortOrder: item.sortOrder,
        published: item.published,
        sample: true,
      };
      await db.collection.upsert({
        where: { id: item.id },
        create: { id: item.id, ...data },
        update: data,
      });
    }
    for (const item of designFixtures) {
      const data = {
        slug: item.slug,
        name: item.name,
        description: item.description,
        sizes: item.sizes ?? [],
        fabric: item.fabric,
        amountMinor: null,
        currency: null,
        making:
          item.making === "custom-made"
            ? ("CUSTOM_MADE" as const)
            : item.making === "ready-made"
              ? ("READY_MADE" as const)
              : ("UNCONFIRMED" as const),
        published: item.published,
        sample: true,
        collections: { set: item.collectionIds.map((id) => ({ id })) },
      };
      await db.product.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          ...data,
          collections: { connect: item.collectionIds.map((id) => ({ id })) },
          images: {
            create: item.photographs.map((photo, position) => ({
              ...photo,
              position,
            })),
          },
        },
        update: {
          ...data,
          images: {
            deleteMany: {},
            create: item.photographs.map((photo, position) => ({
              ...photo,
              position,
            })),
          },
        },
      });
    }
    for (const item of appointmentServices)
      await db.appointmentService.upsert({
        where: { id: item.id },
        create: { ...item, sample: true },
        update: { ...item, sample: true },
      });
    const staffId = "00000000-0000-4000-8000-000000000006";
    await db.staff.upsert({
      where: { id: staffId },
      create: {
        id: staffId,
        name: "Development schedule — sample staff",
        enabled: true,
        sample: true,
        services: { connect: appointmentServices.map(({ id }) => ({ id })) },
      },
      update: {
        enabled: true,
        sample: true,
        services: { set: appointmentServices.map(({ id }) => ({ id })) },
      },
    });
    for (const weekday of [1, 2, 3, 4, 5, 6])
      await db.staffAvailability.upsert({
        where: {
          staffId_weekday_startMinute: { staffId, weekday, startMinute: 540 },
        },
        create: { staffId, weekday, startMinute: 540, endMinute: 960 },
        update: { endMinute: 960 },
      });
    // Intentionally no Customer, Appointment, Enquiry, Notification, or AdminUser records.
    console.log(
      "Development catalogue and sample schedule seeded. No customer records or administrator credentials created.",
    );
  } finally {
    await db.$disconnect();
  }
}
void main().catch(() => {
  console.error(
    "Development seeding failed. Check the database and migration state.",
  );
  process.exitCode = 1;
});
