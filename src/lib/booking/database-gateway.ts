"use client";
import {
  createBookingAction,
  manageBookingAction,
} from "@/app/actions/booking";
import type {
  AvailableDay,
  BookingRequest,
  BookingSelection,
  SelectionValidation,
} from "./types";
import { studioDateKey } from "./dates";
async function read<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok || !result.ok)
    throw new Error(
      result.error?.message ??
        "Availability could not be loaded. Please try again.",
    );
  return result.data as T;
}
export function createDatabaseBookingGateway() {
  return {
    async getAvailability(
      serviceId: string,
      signal?: AbortSignal,
    ): Promise<AvailableDay[]> {
      return read(
        await fetch(
          `/api/appointments/availability?${new URLSearchParams({ serviceId, from: studioDateKey(), days: "56" })}`,
          { signal, cache: "no-store" },
        ),
      );
    },
    async validateSelection(
      selection: BookingSelection,
    ): Promise<SelectionValidation> {
      return read(
        await fetch("/api/appointments/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selection),
          cache: "no-store",
        }),
      );
    },
    async submit(request: BookingRequest, idempotencyKey: string) {
      const result = await createBookingAction({ request, idempotencyKey });
      if (!result.ok) throw new Error(result.error.message);
      return { ...result.data, request };
    },
    async manage(input: unknown) {
      const result = await manageBookingAction(input);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
  };
}
