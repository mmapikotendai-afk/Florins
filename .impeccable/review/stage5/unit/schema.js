"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRequestSchema = bookingRequestSchema;
const zod_1 = require("zod");
const config_1 = require("./config");
const dates_1 = require("./dates");
function bookingRequestSchema(now = new Date()) {
    return zod_1.z
        .object({
        serviceId: zod_1.z
            .string()
            .refine((id) => config_1.appointmentServices.some((service) => service.id === id && service.enabled), "Choose an appointment service."),
        date: zod_1.z
            .string()
            .refine(dates_1.validDateKey, "Choose an available date.")
            .refine((value) => !(0, dates_1.validDateKey)(value) || value >= (0, dates_1.studioDateKey)(now), "Choose today or a future date."),
        time: zod_1.z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose an available time."),
        fullName: zod_1.z
            .string()
            .trim()
            .min(2, "Enter your full name.")
            .max(100, "Use 100 characters or fewer."),
        email: zod_1.z
            .string()
            .trim()
            .pipe(zod_1.z.email("Enter a valid email address.").max(254)),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^\+?[\d ()-]+$/, "Use a valid phone number with an optional leading +.")
            .refine((value) => {
            const length = value.replace(/\D/g, "").length;
            return length >= 7 && length <= 15;
        }, "Enter a phone number with 7 to 15 digits."),
        eventDate: zod_1.z
            .string()
            .refine((value) => !value || (0, dates_1.validDateKey)(value), "Enter a valid event date."),
        notes: zod_1.z.string().trim().max(1500, "Use 1,500 characters or fewer."),
    })
        .superRefine((value, context) => {
        if (value.eventDate &&
            (0, dates_1.validDateKey)(value.eventDate) &&
            (0, dates_1.validDateKey)(value.date) &&
            value.eventDate < value.date)
            context.addIssue({
                code: "custom",
                path: ["eventDate"],
                message: "Your event date cannot be before the appointment date.",
            });
    });
}
