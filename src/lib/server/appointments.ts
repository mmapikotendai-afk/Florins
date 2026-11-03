import "server-only";
import { randomUUID } from "node:crypto";
import type { Appointment, AppointmentStatus } from "@/generated/prisma/client";
import { getDb } from "@/lib/db/prisma";
import {
  addDays,
  minuteLabel,
  slotTimestamp,
  studioDateKey,
} from "@/lib/booking/dates";
import type { AvailableDay, BookingSelection } from "@/lib/booking/types";
import { AppError } from "./errors";
import { developmentDataAllowed, equalHash, keyedHash } from "./security";
import {
  availabilitySchema,
  createBookingSchema,
  manageSchema,
  selectionSchema,
} from "./schemas";
import { scheduleTransaction, type Transaction } from "./transaction";

const holding: AppointmentStatus[] = ["REQUESTED", "CONFIRMED"];
function bookingEnabled() {
  if (process.env.BOOKING_ENABLED !== "true")
    throw new AppError(
      "BOOKING_CLOSED",
      "Online appointments are not open. Please contact Florins.",
      503,
    );
}
function rangeAllowed(date: string, now: Date) {
  const today = studioDateKey(now);
  if (date < today || date >= addDays(today, 56))
    throw new AppError(
      "INVALID_DATE",
      "Choose an available date within the next 56 days.",
    );
}
const overlap = (
  start: number,
  end: number,
  otherStart: Date,
  otherEnd: Date,
) => start < otherEnd.getTime() && end > otherStart.getTime();
async function schedule(
  tx: Transaction,
  serviceId: string,
  from: string,
  days: number,
  now: Date,
  excludeId?: string,
) {
  bookingEnabled();
  rangeAllowed(from, now);
  const allowSample = developmentDataAllowed();
  const service = await tx.appointmentService.findFirst({
    where: {
      id: serviceId,
      enabled: true,
      ...(allowSample ? {} : { sample: false }),
    },
  });
  if (!service)
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      "This appointment service is unavailable.",
      404,
    );
  const staff = await tx.staff.findMany({
    where: {
      enabled: true,
      ...(allowSample ? {} : { sample: false }),
      services: { some: { id: serviceId } },
    },
    include: { availability: true },
    orderBy: { id: "asc" },
  });
  const lower = new Date(slotTimestamp(from, "00:00"));
  const upper = new Date(slotTimestamp(addDays(from, days), "00:00"));
  const [blocked, appointments] = await Promise.all([
    tx.blockedDate.findMany({
      where: {
        startsAt: { lt: upper },
        endsAt: { gt: lower },
        OR: [
          { staffId: null },
          { staffId: { in: staff.map((item) => item.id) } },
        ],
      },
    }),
    tx.appointment.findMany({
      where: {
        status: { in: holding },
        startsAt: { lt: upper },
        endsAt: { gt: lower },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { staffId: true, startsAt: true, endsAt: true },
    }),
  ]);
  function eligible(date: string, time: string) {
    const start = slotTimestamp(date, time);
    const end = start + service!.durationMinutes * 60_000;
    const minute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (start <= now.getTime()) return [];
    return staff.filter(
      (person) =>
        person.availability.some(
          (window) =>
            window.weekday === weekday &&
            minute >= window.startMinute &&
            minute + service!.durationMinutes <= window.endMinute &&
            (minute - window.startMinute) % service!.intervalMinutes === 0,
        ) &&
        !blocked.some(
          (block) =>
            (!block.staffId || block.staffId === person.id) &&
            overlap(start, end, block.startsAt, block.endsAt),
        ) &&
        !appointments.some(
          (item) =>
            item.staffId === person.id &&
            overlap(start, end, item.startsAt, item.endsAt),
        ),
    );
  }
  const result: AvailableDay[] = [];
  for (let day = 0; day < days; day++) {
    const date = addDays(from, day);
    if (date >= addDays(studioDateKey(now), 56)) break;
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const starts = new Set<number>();
    for (const person of staff)
      for (const window of person.availability.filter(
        (item) => item.weekday === weekday,
      )) {
        for (
          let minute = window.startMinute;
          minute + service.durationMinutes <= window.endMinute;
          minute += service.intervalMinutes
        )
          starts.add(minute);
      }
    result.push({
      date,
      slots: [...starts]
        .sort((a, b) => a - b)
        .map((minute) => {
          const time = minuteLabel(minute);
          const available = eligible(date, time).length > 0;
          return {
            time,
            endTime: minuteLabel(minute + service.durationMinutes),
            available,
            ...(!available
              ? {
                  reason:
                    slotTimestamp(date, time) <= now.getTime()
                      ? ("past" as const)
                      : ("occupied" as const),
                }
              : {}),
          };
        }),
    });
  }
  return { service, days: result, eligible };
}

export async function listServices() {
  bookingEnabled();
  return getDb().appointmentService.findMany({
    where: {
      enabled: true,
      ...(developmentDataAllowed() ? {} : { sample: false }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      durationMinutes: true,
      enabled: true,
      sample: true,
    },
    orderBy: { name: "asc" },
  });
}
export async function getAvailability(input: unknown, now = new Date()) {
  const data = availabilitySchema.parse(input);
  // A single repeatable snapshot prevents mixing independent reads during a concurrent write.
  return getDb().$transaction(
    async (tx) =>
      (await schedule(tx, data.serviceId, data.from, data.days, now)).days,
    { isolationLevel: "RepeatableRead" },
  );
}
export async function validateSelection(input: unknown) {
  const selection = selectionSchema.parse(input);
  const days = await getAvailability({
    serviceId: selection.serviceId,
    from: selection.date,
    days: 1,
  });
  return days[0]?.slots.some(
    (slot) => slot.time === selection.time && slot.available,
  )
    ? { valid: true as const }
    : {
        valid: false as const,
        message:
          "That time is no longer available. Please choose another date or time.",
      };
}
function receipt(appointment: Appointment) {
  return {
    reference: appointment.reference,
    status: appointment.status,
    serviceId: appointment.serviceId,
    serviceName: appointment.serviceName,
    durationMinutes: appointment.durationMinutes,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    version: appointment.version,
  };
}
function tokenFor(id: string, key: string) {
  return keyedHash(`manage:${id}:${key}`);
}
export async function createBooking(input: unknown, now = new Date()) {
  const { request, idempotencyKey } = createBookingSchema().parse(input);
  const keyHash = keyedHash(`booking-key:${idempotencyKey}`);
  const requestHash = keyedHash(JSON.stringify(request));
  return scheduleTransaction(async (tx) => {
    bookingEnabled();
    const existing = await tx.appointment.findUnique({
      where: { idempotencyKeyHash: keyHash },
    });
    if (existing) {
      if (!equalHash(existing.requestHash, requestHash))
        throw new AppError(
          "IDEMPOTENCY_CONFLICT",
          "This request key was already used with different details.",
          409,
        );
      return {
        ...receipt(existing),
        managementToken: tokenFor(existing.id, idempotencyKey),
      };
    }
    const availability = await schedule(
      tx,
      request.serviceId,
      request.date,
      1,
      now,
    );
    const person = availability.eligible(request.date, request.time)[0];
    if (!person)
      throw new AppError(
        "SLOT_UNAVAILABLE",
        "That time is no longer available. Please choose another date or time.",
        409,
      );
    const id = randomUUID();
    const token = tokenFor(id, idempotencyKey);
    const startsAt = new Date(slotTimestamp(request.date, request.time));
    const customer = await tx.customer.create({
      data: {
        fullName: request.fullName,
        email: request.email.toLowerCase(),
        phone: request.phone,
      },
    });
    const booking = await tx.appointment.create({
      data: {
        id,
        reference: `FLR-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
        serviceId: request.serviceId,
        serviceName: availability.service.name,
        staffId: person.id,
        customerId: customer.id,
        startsAt,
        endsAt: new Date(
          startsAt.getTime() + availability.service.durationMinutes * 60000,
        ),
        durationMinutes: availability.service.durationMinutes,
        eventDate: request.eventDate
          ? new Date(`${request.eventDate}T00:00:00Z`)
          : null,
        notes: request.notes || null,
        managementTokenHash: keyedHash(token),
        idempotencyKeyHash: keyHash,
        requestHash,
      },
    });
    await tx.notification.create({
      data: {
        customerId: booking.customerId,
        appointmentId: booking.id,
        kind: "APPOINTMENT_REQUESTED",
        dedupeKey: `appointment:${id}:1`,
      },
    });
    return { ...receipt(booking), managementToken: token };
  });
}

async function change(
  tx: Transaction,
  booking: Appointment,
  operation: "cancel" | "reschedule",
  now: Date,
  selection?: BookingSelection,
) {
  if (!holding.includes(booking.status) || booking.startsAt <= now)
    throw new AppError(
      "NOT_CHANGEABLE",
      "This appointment can no longer be changed online. Please contact Florins.",
      409,
    );
  let update: {
    startsAt?: Date;
    endsAt?: Date;
    staffId?: string;
    durationMinutes?: number;
    status?: AppointmentStatus;
    cancelledAt?: Date;
  } = {};
  if (operation === "cancel")
    update = { status: "CANCELLED", cancelledAt: now };
  else {
    if (!selection)
      throw new AppError("INVALID_INPUT", "Choose a new date and time.");
    if (
      booking.eventDate &&
      selection.date > booking.eventDate.toISOString().slice(0, 10)
    )
      throw new AppError(
        "EVENT_DATE",
        "Choose an appointment on or before your event date.",
      );
    const available = await schedule(
      tx,
      booking.serviceId,
      selection.date,
      1,
      now,
      booking.id,
    );
    const person = available.eligible(selection.date, selection.time)[0];
    if (!person)
      throw new AppError(
        "SLOT_UNAVAILABLE",
        "That time is no longer available. Please choose another date or time.",
        409,
      );
    const startsAt = new Date(slotTimestamp(selection.date, selection.time));
    update = {
      startsAt,
      endsAt: new Date(
        startsAt.getTime() + available.service.durationMinutes * 60000,
      ),
      durationMinutes: available.service.durationMinutes,
      staffId: person.id,
      status: "REQUESTED",
    };
  }
  const changed = await tx.appointment.update({
    where: { id: booking.id },
    data: { ...update, version: { increment: 1 } },
  });
  await tx.notification.create({
    data: {
      customerId: booking.customerId,
      appointmentId: booking.id,
      kind:
        operation === "cancel"
          ? "APPOINTMENT_CANCELLED"
          : "APPOINTMENT_RESCHEDULED",
      dedupeKey: `appointment:${booking.id}:${changed.version}`,
    },
  });
  return receipt(changed);
}
export async function manageBooking(input: unknown, now = new Date()) {
  const data = manageSchema.parse(input);
  return scheduleTransaction(async (tx) => {
    const booking = await tx.appointment.findUnique({
      where: { reference: data.reference },
    });
    if (
      !booking ||
      !equalHash(booking.managementTokenHash, keyedHash(data.token))
    )
      throw new AppError(
        "NOT_FOUND",
        "Appointment access could not be verified.",
        404,
      );
    if (booking.version !== data.expectedVersion)
      throw new AppError(
        "VERSION_CONFLICT",
        "This appointment changed. Use its latest version or contact Florins.",
        409,
      );
    return change(
      tx,
      booking,
      data.operation,
      now,
      data.date && data.time
        ? { serviceId: booking.serviceId, date: data.date, time: data.time }
        : undefined,
    );
  });
}
export async function adminChangeAppointment(
  input: {
    reference: string;
    expectedVersion: number;
    operation: "cancel" | "reschedule" | "status";
    date?: string;
    time?: string;
    status?: AppointmentStatus;
  },
  now = new Date(),
) {
  // Callers MUST authorize using requireAdmin; this module is server-only and never exported as an action.
  return scheduleTransaction(async (tx) => {
    const booking = await tx.appointment.findUnique({
      where: { reference: input.reference },
    });
    if (!booking)
      throw new AppError("NOT_FOUND", "Appointment not found.", 404);
    if (booking.version !== input.expectedVersion)
      throw new AppError(
        "VERSION_CONFLICT",
        "Appointment changed. Refresh and retry.",
        409,
      );
    if (input.operation !== "status")
      return change(
        tx,
        booking,
        input.operation,
        now,
        input.date && input.time
          ? { serviceId: booking.serviceId, date: input.date, time: input.time }
          : undefined,
      );
    const status = input.status;
    const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      REQUESTED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CANCELLED", "COMPLETED", "NO_SHOW"],
      CANCELLED: [],
      COMPLETED: [],
      NO_SHOW: [],
    };
    if (!status || !transitions[booking.status].includes(status))
      throw new AppError(
        "INVALID_STATUS",
        "This status transition is not allowed.",
        409,
      );
    if (status === "CONFIRMED" && booking.startsAt <= now)
      throw new AppError(
        "INVALID_STATUS",
        "A past appointment cannot be confirmed.",
        409,
      );
    if (
      (status === "COMPLETED" || status === "NO_SHOW") &&
      booking.startsAt > now
    )
      throw new AppError(
        "INVALID_STATUS",
        "This appointment has not started.",
        409,
      );
    const updated = await tx.appointment.update({
      where: { id: booking.id },
      data: {
        status,
        version: { increment: 1 },
        ...(status === "CANCELLED" ? { cancelledAt: now } : {}),
      },
    });
    await tx.notification.create({
      data: {
        customerId: booking.customerId,
        appointmentId: booking.id,
        kind: `APPOINTMENT_${status}`,
        dedupeKey: `appointment:${booking.id}:${updated.version}`,
      },
    });
    return receipt(updated);
  });
}
