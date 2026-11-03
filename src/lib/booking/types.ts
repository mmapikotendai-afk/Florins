export type BookingSelection = {
  serviceId: string;
  date: string;
  time: string;
};
export type BookingCustomer = {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  notes: string;
};
export type BookingRequest = BookingSelection & BookingCustomer;
export type TimeSlot = {
  time: string;
  endTime: string;
  available: boolean;
  reason?: "occupied" | "past";
};
export type AvailableDay = { date: string; slots: TimeSlot[] };
export type BookingReceipt = {
  reference: string;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  version: number;
};
export type BookingConfirmation = BookingReceipt & {
  managementToken: string;
  request: BookingRequest;
};
export type SelectionValidation =
  { valid: true } | { valid: false; message: string };
export type DemoConfirmation = {
  mode: "demo";
  status: "demo-only";
  reference: string;
  request: BookingRequest;
  durationMinutes: number;
  createdAt: string;
};
/** Historical Stage 5 fixture contract; the active transport returns BookingConfirmation. */
export interface BookingGateway {
  readonly mode: "demo";
  getAvailability(
    serviceId: string,
    signal?: AbortSignal,
  ): Promise<AvailableDay[]>;
  validateSelection(selection: BookingSelection): Promise<SelectionValidation>;
  submit(
    request: BookingRequest,
    idempotencyKey: string,
  ): Promise<DemoConfirmation>;
}
