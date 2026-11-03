import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

async function main() {
  const url = new URL(process.env.TEST_DATABASE_URL ?? "");
  assert(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  assert(
    url.pathname.endsWith("_test"),
    "Use a dedicated database ending in _test.",
  );
  process.env.DATABASE_URL = url.href;
  process.env.DIRECT_URL = url.href;
  process.env.FLORINS_ENV = "test";
  process.env.BOOKING_ENABLED = "true";
  const migration = spawnSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { env: process.env, stdio: "inherit", windowsHide: true },
  );
  assert.equal(migration.status, 0);
  const { getDb } = await import("../src/lib/db/prisma");
  const {
    createBooking,
    getAvailability,
    manageBooking,
    adminChangeAppointment,
    listServices,
  } = await import("../src/lib/server/appointments");
  const { updateConfiguration } =
    await import("../src/lib/server/configuration");
  const { submitEnquiry } = await import("../src/lib/server/enquiries");
  const { checkOrigin, requireAdmin, rateLimit } =
    await import("../src/lib/server/security");
  const { addDays, studioDateKey } = await import("../src/lib/booking/dates");
  const db = getDb();
  const staffId = randomUUID(),
    serviceId = `test-${randomUUID()}`;
  const email = `${randomUUID()}@example.test`;
  const scope = `test-${randomUUID()}`;
  const passed: string[] = [];
  const record = (label: string) => {
    passed.push(label);
    console.log(`PASS ${label}`);
  };
  try {
    await db.appointmentService.create({
      data: {
        id: serviceId,
        name: "Test consultation",
        description: "Synthetic test service",
        durationMinutes: 60,
        intervalMinutes: 30,
        enabled: true,
        sample: true,
      },
    });
    await db.staff.create({
      data: {
        id: staffId,
        name: "Synthetic test staff",
        enabled: true,
        sample: true,
        services: { connect: { id: serviceId } },
        availability: {
          create: Array.from({ length: 7 }, (_, weekday) => ({
            weekday,
            startMinute: 540,
            endMinute: 960,
          })),
        },
      },
    });
    const date = addDays(studioDateKey(), 2);
    const customer = {
      fullName: "Synthetic Test",
      email,
      phone: "+263771000000",
      eventDate: "",
      notes: "Integration test only",
    };
    const request = { ...customer, serviceId, date, time: "09:00" };
    const input = { request, idempotencyKey: randomUUID() };
    const [a, b] = await Promise.all([
      createBooking(input),
      createBooking(input),
    ]);
    assert.equal(a.reference, b.reference);
    assert.equal(a.managementToken, b.managementToken);
    assert.equal(
      await db.appointment.count({ where: { reference: a.reference } }),
      1,
    );
    assert.equal(
      await db.notification.count({
        where: { appointment: { reference: a.reference } },
      }),
      1,
    );
    record(
      "Concurrent identical submissions save one appointment and one outbox item",
    );
    await assert.rejects(
      createBooking({ ...input, request: { ...request, notes: "Changed" } }),
      { code: "IDEMPOTENCY_CONFLICT" },
    );
    record("Idempotency keys reject changed payloads");
    const availability = await getAvailability({
      serviceId,
      from: date,
      days: 1,
    });
    assert.equal(
      availability[0].slots.find((slot) => slot.time === "09:30")?.available,
      false,
    );
    assert.equal(
      availability[0].slots.find((slot) => slot.time === "10:00")?.available,
      true,
    );
    record(
      "Duration overlaps are blocked and adjacent intervals remain available",
    );
    const stored = await db.appointment.findUniqueOrThrow({
      where: { reference: a.reference },
    });
    await assert.rejects(
      db.appointment.create({
        data: {
          ...stored,
          id: randomUUID(),
          reference: `FLR-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
          idempotencyKeyHash: randomUUID(),
        },
      }),
    );
    assert.equal(
      await db.appointment.count({
        where: { staffId, startsAt: stored.startsAt },
      }),
      1,
    );
    record(
      "Database rejects overlapping inserts that bypass the booking service",
    );
    const competing = await Promise.allSettled(
      [1, 2].map(() =>
        createBooking({
          request: { ...request, time: "11:00" },
          idempotencyKey: randomUUID(),
        }),
      ),
    );
    assert.equal(
      competing.filter((result) => result.status === "fulfilled").length,
      1,
    );
    assert.equal(
      competing.filter((result) => result.status === "rejected").length,
      1,
    );
    record("Competing requests cannot double-book one staff member");
    await assert.rejects(
      updateConfiguration({
        kind: "block",
        staffId,
        startsAt: `${date}T09:00:00+02:00`,
        endsAt: `${date}T10:00:00+02:00`,
      }),
      { code: "EXISTING_APPOINTMENT" },
    );
    await assert.rejects(
      updateConfiguration({ kind: "availability", staffId, windows: [] }),
      { code: "EXISTING_APPOINTMENT" },
    );
    record("Schedule and block changes protect existing appointments");
    const access = {
      reference: a.reference,
      token: a.managementToken,
      expectedVersion: a.version,
    };
    await assert.rejects(
      manageBooking({ ...access, token: "a".repeat(64), operation: "cancel" }),
      { code: "NOT_FOUND" },
    );
    const moved = await manageBooking({
      ...access,
      operation: "reschedule",
      date,
      time: "13:00",
    });
    assert.equal(moved.version, 2);
    await assert.rejects(manageBooking({ ...access, operation: "cancel" }), {
      code: "VERSION_CONFLICT",
    });
    const cancelled = await manageBooking({
      ...access,
      expectedVersion: moved.version,
      operation: "cancel",
    });
    assert.equal(cancelled.status, "CANCELLED");
    assert.equal(
      (await getAvailability({ serviceId, from: date, days: 1 }))[0].slots.find(
        (slot) => slot.time === "13:00",
      )?.available,
      true,
    );
    record(
      "Private token and version protect rescheduling; cancellation releases time",
    );
    const confirmedTarget = competing.find(
      (result) => result.status === "fulfilled",
    );
    assert(confirmedTarget?.status === "fulfilled");
    await assert.rejects(
      adminChangeAppointment({
        reference: confirmedTarget.value.reference,
        expectedVersion: 1,
        operation: "status",
        status: "COMPLETED",
      }),
      { code: "INVALID_STATUS" },
    );
    const confirmed = await adminChangeAppointment({
      reference: confirmedTarget.value.reference,
      expectedVersion: 1,
      operation: "status",
      status: "CONFIRMED",
    });
    assert.equal(confirmed.status, "CONFIRMED");
    record("Administrator status transitions reject invalid changes");
    process.env.FLORINS_ENV = "production";
    assert(!(await listServices()).some((service) => service.id === serviceId));
    process.env.FLORINS_ENV = "test";
    process.env.BOOKING_ENABLED = "false";
    await assert.rejects(listServices(), { code: "BOOKING_CLOSED" });
    process.env.BOOKING_ENABLED = "true";
    record(
      "Production excludes sample services and closed booking fails safely",
    );
    const enquiryInput = {
      idempotencyKey: randomUUID(),
      request: {
        ...customer,
        occasion: "Test occasion",
        preferredDate: date,
        description: "A synthetic design description for integration testing.",
      },
    };
    const enquiries = await Promise.all([
      submitEnquiry(enquiryInput),
      submitEnquiry(enquiryInput),
    ]);
    assert.equal(enquiries[0].reference, enquiries[1].reference);
    record("Bespoke enquiry retries save one record");
    const previewAlias = process.env.LOCAL_PREVIEW_ORIGINS?.split(",").find(
      (origin) => origin !== process.env.SITE_ORIGIN,
    );
    assert(previewAlias);
    checkOrigin(new Headers({ origin: previewAlias }));
    process.env.FLORINS_ENV = "production";
    assert.throws(() => checkOrigin(new Headers({ origin: previewAlias })), {
      code: "ORIGIN",
    });
    process.env.FLORINS_ENV = "test";
    assert.throws(
      () => checkOrigin(new Headers({ origin: "https://untrusted.example" })),
      { code: "ORIGIN" },
    );
    await assert.rejects(requireAdmin(new Headers()), { code: "UNAUTHORIZED" });
    await Promise.all([
      rateLimit(new Headers(), scope, 2),
      rateLimit(new Headers(), scope, 2),
    ]);
    await assert.rejects(rateLimit(new Headers(), scope, 2), {
      code: "RATE_LIMIT",
    });
    record(
      "Origin, administrator authentication and shared rate limiting are enforced",
    );
    const rows = await db.$queryRaw<
      { relrowsecurity: boolean }[]
    >`SELECT relrowsecurity FROM pg_class WHERE oid='public."Customer"'::regclass`;
    assert.equal(rows[0].relrowsecurity, true);
    const constraint = await db.$queryRaw<
      { conname: string }[]
    >`SELECT conname FROM pg_constraint WHERE conname='Appointment_no_overlap'`;
    assert.equal(constraint.length, 1);
    record("PostgreSQL RLS and overlap exclusion constraint are installed");
    fs.mkdirSync(".local/stage6-results", { recursive: true });
    fs.writeFileSync(
      ".local/stage6-results/integration.json",
      JSON.stringify({ checkedAt: new Date().toISOString(), passed }, null, 2),
    );
  } finally {
    // Only records linked to this run's unique fixture identity are removed.
    await db.notification.deleteMany({ where: { customer: { email } } });
    await db.appointment.deleteMany({ where: { customer: { email } } });
    await db.bespokeEnquiry.deleteMany({ where: { customer: { email } } });
    await db.customer.deleteMany({ where: { email } });
    await db.staff.deleteMany({ where: { id: staffId } });
    await db.appointmentService.deleteMany({ where: { id: serviceId } });
    await db.$disconnect();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
