import { z } from "zod";

export function studioToday() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Harare",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (name: string) =>
    parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function createBespokeEnquirySchema(today = studioToday()) {
  const date = z
    .string()
    .refine(
      (value) => !value || calendarDate(value),
      "Enter a valid calendar date.",
    )
    .refine(
      (value) => !value || value >= today,
      "Choose today or a future date.",
    );
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, "Enter your full name.")
        .max(100, "Use 100 characters or fewer."),
      email: z
        .string()
        .trim()
        .pipe(
          z
            .email("Enter a valid email address.")
            .max(254, "Use 254 characters or fewer."),
        ),
      phone: z
        .string()
        .trim()
        .max(32)
        .regex(
          /^\+?[\d ()-]+$/,
          "Use digits, spaces, brackets or hyphens, with an optional leading +.",
        )
        .refine((value) => {
          const digits = value.replace(/\D/g, "");
          return digits.length >= 7 && digits.length <= 15;
        }, "Enter a phone number with 7 to 15 digits."),
      occasion: z
        .string()
        .trim()
        .min(2, "Tell us the occasion.")
        .max(120, "Use 120 characters or fewer."),
      preferredDate: date,
      eventDate: date,
      description: z
        .string()
        .trim()
        .min(20, "Describe your design in at least 20 characters.")
        .max(3000, "Use 3,000 characters or fewer."),
      notes: z.string().trim().max(1500, "Use 1,500 characters or fewer."),
    })
    .strict()
    .superRefine((value, context) => {
      if (
        value.preferredDate &&
        value.eventDate &&
        calendarDate(value.preferredDate) &&
        calendarDate(value.eventDate) &&
        value.preferredDate > value.eventDate
      )
        context.addIssue({
          code: "custom",
          path: ["preferredDate"],
          message: "Choose a consultation date on or before your event date.",
        });
    });
}

export type BespokeEnquiry = z.infer<
  ReturnType<typeof createBespokeEnquirySchema>
>;

export function enquiryDraft(value: BespokeEnquiry, references: string[]) {
  return [
    "BESPOKE DESIGN ENQUIRY — FLORINS",
    "",
    `Full name: ${value.fullName}`,
    `Email: ${value.email}`,
    `Phone: ${value.phone}`,
    `Occasion: ${value.occasion}`,
    `Preferred appointment date: ${value.preferredDate || "To discuss"}`,
    `Event date: ${value.eventDate || "To discuss"}`,
    "",
    "Design description:",
    value.description,
    "",
    "Additional notes:",
    value.notes || "None",
    "",
    `Reference images: ${references.length ? references.join(", ") : "None selected"}`,
    ...(references.length
      ? ["Reference images are not attached. I will share them separately."]
      : []),
    "",
    "This is an enquiry, not a confirmed appointment.",
  ].join("\n");
}
