import { z } from "zod";

/** Contact-field primitives only. Slot availability and booking rules remain undecided. */
export const appointmentContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(100, "Use 100 characters or fewer."),
  email: z.email("Enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .max(2000, "Use 2,000 characters or fewer.")
    .optional(),
});

export type AppointmentContact = z.infer<typeof appointmentContactSchema>;
