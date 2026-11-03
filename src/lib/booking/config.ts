/** Stage 5 fixture configuration. These are NOT confirmed FLORINS services or hours. */
export const bookingConfig = {
  mode: "demo" as const,
  timeZone: "Africa/Harare",
  utcOffset: "+02:00",
  horizonDays: 56,
  openingMinute: 9 * 60,
  closingMinute: 16 * 60,
  slotIntervalMinutes: 30,
  fullyUnavailableDayOffsets: [1, 8, 13],
};
export type AppointmentService = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  enabled: boolean;
};
/** Stable IDs, names, durations and publication can later come from administrator records. */
export const appointmentServices: AppointmentService[] = [
  {
    id: "fashion-consultation",
    name: "Fashion Consultation",
    description: "Discuss your occasion and the direction you have in mind.",
    durationMinutes: 30,
    enabled: true,
  },
  {
    id: "body-measurements",
    name: "Body Measurements",
    description: "Explore the measurement appointment interface.",
    durationMinutes: 30,
    enabled: true,
  },
  {
    id: "outfit-fitting",
    name: "Outfit Fitting",
    description: "Preview arranging a fitting for an outfit.",
    durationMinutes: 45,
    enabled: true,
  },
  {
    id: "bespoke-design",
    name: "Bespoke Design Consultation",
    description: "Make space for a conversation about a personal design.",
    durationMinutes: 60,
    enabled: true,
  },
  {
    id: "fabric-selection",
    name: "Fabric Selection",
    description: "Preview an appointment to discuss fabric and finish.",
    durationMinutes: 30,
    enabled: true,
  },
  {
    id: "group-consultation",
    name: "Group Consultation",
    description: "Preview a shared design conversation for a group.",
    durationMinutes: 90,
    enabled: true,
  },
];
