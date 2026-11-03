"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMockAvailability = buildMockAvailability;
exports.createMockBookingGateway = createMockBookingGateway;
const config_1 = require("./config");
const dates_1 = require("./dates");
const schema_1 = require("./schema");
/** Pure fixture builder: no studio policies, network, database, or global inventory. */
function buildMockAvailability(serviceId, now = new Date()) {
    const service = config_1.appointmentServices.find((item) => item.id === serviceId && item.enabled);
    if (!service || service.durationMinutes <= 0 || service.durationMinutes > 180)
        return [];
    const today = (0, dates_1.studioDateKey)(now);
    return Array.from({ length: config_1.bookingConfig.horizonDays }, (_, index) => {
        const date = (0, dates_1.addDays)(today, index);
        const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
        const day = Number(date.slice(-2));
        // Closed and occupied examples are mock rules, not FLORINS operating hours.
        if (weekday === 0 ||
            day % 11 === 0 ||
            config_1.bookingConfig.fullyUnavailableDayOffsets.includes(index))
            return { date, slots: [] };
        const slots = [];
        for (let minute = config_1.bookingConfig.openingMinute; minute + service.durationMinutes <= config_1.bookingConfig.closingMinute; minute += config_1.bookingConfig.slotIntervalMinutes) {
            const time = (0, dates_1.minuteLabel)(minute);
            const past = (0, dates_1.slotTimestamp)(date, time) <= now.getTime();
            const occupied = (minute < 12 * 60 && minute + service.durationMinutes > 11 * 60) ||
                (day % 3 === 0 &&
                    minute < 14 * 60 + 30 &&
                    minute + service.durationMinutes > 14 * 60);
            slots.push({
                time,
                endTime: (0, dates_1.minuteLabel)(minute + service.durationMinutes),
                available: !past && !occupied,
                ...(past
                    ? { reason: "past" }
                    : occupied
                        ? { reason: "occupied" }
                        : {}),
            });
        }
        return { date, slots };
    });
}
function createMockBookingGateway(clock = () => new Date()) {
    // Instance-local idempotency only; no global mock inventory or personal-data storage.
    const completed = new Map();
    return {
        mode: "demo",
        async getAvailability(serviceId, signal) {
            if (signal?.aborted)
                throw new DOMException("Availability request cancelled", "AbortError");
            return buildMockAvailability(serviceId, clock());
        },
        async validateSelection(selection) {
            if (!(0, dates_1.validDateKey)(selection.date))
                return { valid: false, message: "Choose an available demo date." };
            const day = buildMockAvailability(selection.serviceId, clock()).find((item) => item.date === selection.date);
            return day?.slots.some((slot) => slot.time === selection.time && slot.available)
                ? { valid: true }
                : {
                    valid: false,
                    message: "That demo time is no longer available. Please choose another date or time.",
                };
        },
        submit(request, idempotencyKey) {
            if (completed.has(idempotencyKey))
                return completed.get(idempotencyKey);
            const operation = (async () => {
                const parsed = (0, schema_1.bookingRequestSchema)(clock()).safeParse(request);
                if (!parsed.success)
                    throw new Error(parsed.error.issues[0]?.message ??
                        "Please review your appointment details.");
                const validation = await this.validateSelection(parsed.data);
                if (!validation.valid)
                    throw new Error(validation.message);
                const service = config_1.appointmentServices.find((item) => item.id === request.serviceId);
                const result = {
                    mode: "demo",
                    status: "demo-only",
                    reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                    request: parsed.data,
                    durationMinutes: service.durationMinutes,
                    createdAt: clock().toISOString(),
                };
                return result;
            })();
            completed.set(idempotencyKey, operation);
            void operation.catch(() => completed.delete(idempotencyKey));
            return operation;
        },
    };
}
