import { z } from "zod";
import { studioDateKey, validDateKey } from "./dates";
export function bookingRequestSchema(now = new Date()) {
  return z
    .object({
      serviceId: z.string().min(1, "Choose an appointment service.").max(100),
      date: z
        .string()
        .refine(validDateKey, "Choose an available date.")
        .refine(
          (value) => !validDateKey(value) || value >= studioDateKey(now),
          "Choose today or a future date.",
        ),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose an available time."),
      fullName: z
        .string()
        .trim()
        .min(2, "Enter your full name.")
        .max(100, "Use 100 characters or fewer."),
      email: z
        .string()
        .trim()
        .pipe(z.email("Enter a valid email address.").max(254)),
      phone: z
        .string()
        .trim()
        .max(32)
        .regex(
          /^\+?[\d ()-]+$/,
          "Use a valid phone number with an optional leading +.",
        )
        .refine((value) => {
          const length = value.replace(/\D/g, "").length;
          return length >= 7 && length <= 15;
        }, "Enter a phone number with 7 to 15 digits."),
      eventDate: z
        .string()
        .refine(
          (value) => !value || validDateKey(value),
          "Enter a valid event date.",
        ),
      notes: z.string().trim().max(1500, "Use 1,500 characters or fewer."),
    })
    .strict()
    .superRefine((value, context) => {
      if (
        value.eventDate &&
        validDateKey(value.eventDate) &&
        validDateKey(value.date) &&
        value.eventDate < value.date
      )
        context.addIssue({
          code: "custom",
          path: ["eventDate"],
          message: "Your event date cannot be before the appointment date.",
        });
    });
}
