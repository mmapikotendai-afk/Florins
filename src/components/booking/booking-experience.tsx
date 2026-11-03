"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DayPicker } from "react-day-picker";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { bookingConfig, type AppointmentService } from "@/lib/booking/config";
import {
  addDays,
  dateFromKey,
  formatAppointmentDate,
  studioDateKey,
} from "@/lib/booking/dates";
import { createDatabaseBookingGateway } from "@/lib/booking/database-gateway";
import { bookingRequestSchema } from "@/lib/booking/schema";
import type {
  AvailableDay,
  BookingRequest,
  BookingConfirmation,
} from "@/lib/booking/types";
import { site } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = ["Service", "Date", "Time", "Your details", "Review", "Submit"];
const titles = [
  "Choose your service.",
  "Find a day that suits you.",
  "Choose your time.",
  "A few details about you.",
  "Review your appointment.",
  "Send your appointment request.",
];
const defaults: BookingRequest = {
  serviceId: "",
  date: "",
  time: "",
  fullName: "",
  email: "",
  phone: "",
  eventDate: "",
  notes: "",
};
function subscribeClock(notify: () => void) {
  const timer = window.setInterval(notify, 10_000);
  window.addEventListener("focus", notify);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", notify);
  };
}
function clockSnapshot() {
  return String(Math.floor(Date.now() / 60_000));
}

export function BookingExperience({
  services: appointmentServices,
  development = false,
}: {
  services: AppointmentService[];
  development?: boolean;
}) {
  const clock = useSyncExternalStore(subscribeClock, clockSnapshot, () => "");
  const today = clock ? studioDateKey(new Date(Number(clock) * 60_000)) : "";
  const [gateway, setGateway] = useState(() => createDatabaseBookingGateway());
  const [step, setStep] = useState(0);
  const [availability, setAvailability] = useState<{
    state: "idle" | "loading" | "ready" | "error";
    days: AvailableDay[];
  }>({ state: "idle", days: [] });
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );
  const [management, setManagement] = useState<BookingConfirmation | null>(
    null,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const submitLock = useRef(false);
  const submissionKey = useRef<string | null>(null);
  const {
    register,
    control,
    setError,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema()),
    defaultValues: defaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const [serviceId, date, time] = useWatch({
    control,
    name: ["serviceId", "date", "time"],
  });
  const service = appointmentServices.find(
    (item) => item.id === serviceId && item.enabled,
  );
  const selectedDay = availability.days.find((item) => item.date === date);
  const selectedSlot = selectedDay?.slots.find((item) => item.time === time);
  const availableDates = new Set(
    availability.days
      .filter((item) => item.slots.some((slot) => slot.available))
      .map((item) => item.date),
  );
  useEffect(() => {
    if (!serviceId || !clock) return;
    const controller = new AbortController();
    gateway
      .getAvailability(serviceId, controller.signal)
      .then((days) => {
        if (!controller.signal.aborted)
          setAvailability({ state: "ready", days });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setAvailability({ state: "error", days: [] });
      });
    return () => controller.abort();
  }, [serviceId, clock, gateway]);

  function move(next: number) {
    setProblem("");
    setAcknowledged(false);
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function changeService() {
    setValue("date", "");
    setValue("time", "");
    clearErrors(["date", "time"]);
    setAvailability({ state: "loading", days: [] });
    submissionKey.current = null;
    setProblem("");
  }
  function changeDate(next: Date | undefined) {
    setValue("date", next ? studioDateKey(next) : "", { shouldValidate: true });
    setValue("time", "");
    clearErrors("time");
    submissionKey.current = null;
    setProblem("");
  }
  async function validSelection() {
    const result = await gateway.validateSelection({
      serviceId: getValues("serviceId"),
      date: getValues("date"),
      time: getValues("time"),
    });
    if (result.valid) return true;
    setValue("time", "");
    setProblem(result.message);
    setStep(2);
    requestAnimationFrame(() => heading.current?.focus());
    return false;
  }
  async function next() {
    setProblem("");
    const names: (keyof BookingRequest)[][] = [
      ["serviceId"],
      ["date"],
      ["time"],
      ["fullName", "email", "phone", "eventDate", "notes"],
      [],
    ];
    const fields = names[step] ?? [];
    const checked = bookingRequestSchema().safeParse(getValues());
    const issues = checked.success
      ? []
      : checked.error.issues.filter((issue) =>
          fields.includes(issue.path[0] as keyof BookingRequest),
        );
    clearErrors(fields);
    if (issues.length) {
      issues.forEach((issue, index) =>
        setError(
          issue.path[0] as keyof BookingRequest,
          { type: "validate", message: issue.message },
          { shouldFocus: index === 0 },
        ),
      );
      return;
    }
    if (step === 1 && !availableDates.has(date)) {
      setProblem("Choose an available date from the calendar.");
      return;
    }
    if (step === 2 || step === 3 || step === 4) {
      setBusy(true);
      try {
        if (!(await validSelection())) return;
      } catch {
        setProblem("Availability could not be checked. Please try again.");
        return;
      } finally {
        setBusy(false);
      }
    }
    move(management && step === 2 ? 4 : step + 1);
  }
  async function submit(request: BookingRequest) {
    if (submitLock.current) return;
    if (!acknowledged) {
      setProblem(
        "Please acknowledge that appointment requests are subject to studio confirmation.",
      );
      return;
    }
    submitLock.current = true;
    setBusy(true);
    setProblem("");
    try {
      // The mutation rechecks availability atomically. Retrying the same key must
      // reach it even when a lost response left our own request holding the slot.
      submissionKey.current ??= crypto.randomUUID();
      const result = management
        ? {
            ...management,
            ...(await gateway.manage({
              reference: management.reference,
              token: management.managementToken,
              expectedVersion: management.version,
              operation: "reschedule",
              date: request.date,
              time: request.time,
            })),
            request,
          }
        : await gateway.submit(request, submissionKey.current);
      setConfirmation(result);
      setManagement(null);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setProblem(
        error instanceof Error
          ? error.message
          : "Your request could not be completed. Review your selection and try again.",
      );
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }
  function restart() {
    reset(defaults);
    setConfirmation(null);
    setGateway(createDatabaseBookingGateway());
    setManagement(null);
    setAvailability({ state: "idle", days: [] });
    submissionKey.current = null;
    move(0);
  }
  const fieldA11y = (name: keyof BookingRequest) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `booking-${name}-error` : undefined,
  });
  function fieldError(name: keyof BookingRequest) {
    return errors[name] ? (
      <p
        id={`booking-${name}-error`}
        className="booking-field-error"
        role="alert"
      >
        {errors[name]?.message}
      </p>
    ) : null;
  }
  function reviewDetails(values: BookingRequest) {
    return (
      <dl className="booking-review-list">
        <div>
          <dt>Customer</dt>
          <dd>{values.fullName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{values.email}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{values.phone}</dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>
            {service?.name}
            <span>
              {confirmation?.durationMinutes ?? service?.durationMinutes}{" "}
              minutes
            </span>
          </dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{date ? formatAppointmentDate(date) : "Not selected"}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>
            {time}
            {selectedSlot ? `–${selectedSlot.endTime}` : ""}
            <span>Harare · UTC+02:00</span>
          </dd>
        </div>
        <div>
          <dt>Event date</dt>
          <dd>
            {values.eventDate
              ? formatAppointmentDate(values.eventDate)
              : "Not provided"}
          </dd>
        </div>
        {values.notes && (
          <div>
            <dt>Notes</dt>
            <dd>{values.notes}</dd>
          </div>
        )}
        <div>
          <dt>Studio</dt>
          <dd>
            {site.location}
            <span>Visits are subject to studio confirmation.</span>
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <div className="booking-experience">
      <aside
        className="booking-demo-notice"
        aria-label="Appointment information"
      >
        <strong>
          {development
            ? "Development database. Test appointments only."
            : "A personal appointment, subject to confirmation."}
        </strong>
        <p>
          {development
            ? "This environment saves test requests, not real studio reservations. "
            : "Your request is saved securely. Please wait for Florins to confirm your visit. "}
          <Link href={site.whatsapp}>contact Florins on WhatsApp</Link>.
        </p>
      </aside>
      <noscript>
        <p className="booking-error">
          Enable JavaScript to request an appointment, or contact{" "}
          <a href={site.whatsapp}>Florins directly</a> to arrange a real visit.
        </p>
      </noscript>
      {confirmation ? (
        <section
          className="booking-confirmation"
          aria-labelledby="booking-step-title"
        >
          <Check size={36} aria-hidden="true" />
          <h2 id="booking-step-title" tabIndex={-1} ref={heading}>
            {confirmation.status === "CANCELLED"
              ? "Your request is cancelled."
              : "Your request is received."}
          </h2>
          <p>
            {development
              ? "Saved in the development database only. "
              : "Saved securely. "}
            {confirmation.status === "CANCELLED"
              ? "The time has been released."
              : "Please wait for studio confirmation before travelling."}{" "}
            No email or WhatsApp notification has been sent by this page.
          </p>
          <div className="booking-reference">
            <span>Appointment reference</span>
            <strong>{confirmation.reference}</strong>
            <span className="booking-status">
              {confirmation.status === "REQUESTED"
                ? "Requested — awaiting confirmation"
                : confirmation.status}
            </span>
          </div>
          {reviewDetails(confirmation.request)}
          {problem && (
            <p className="booking-error" role="alert">
              {problem}
            </p>
          )}
          {(confirmation.status === "REQUESTED" ||
            confirmation.status === "CONFIRMED") && (
            <div className="booking-actions">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setManagement(confirmation);
                  setConfirmation(null);
                  setValue("time", "");
                  move(1);
                }}
              >
                Reschedule request
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setProblem("");
                  try {
                    const result = await gateway.manage({
                      reference: confirmation.reference,
                      token: confirmation.managementToken,
                      expectedVersion: confirmation.version,
                      operation: "cancel",
                    });
                    setConfirmation({ ...confirmation, ...result });
                  } catch (error) {
                    setProblem(
                      error instanceof Error
                        ? error.message
                        : "Cancellation could not be completed.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Cancel request
              </Button>
            </div>
          )}
          <p className="mt-6">
            Keep this reference. Online management is available in this tab; if
            you leave, contact Florins with your reference. Please do not share
            private appointment access.
          </p>
          <div className="booking-actions">
            <Button disabled={busy} onClick={restart}>
              Start another request
            </Button>
            <Button asChild variant="outline">
              <Link href={site.whatsapp}>
                Contact the studio <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <nav aria-label="Booking progress" className="booking-progress">
            <ol>
              {steps.map((label, index) => (
                <li key={label}>
                  <button
                    type="button"
                    disabled={
                      index > step ||
                      busy ||
                      Boolean(management && (index === 0 || index === 3))
                    }
                    onClick={() => move(index)}
                    aria-current={index === step ? "step" : undefined}
                  >
                    <span>{index + 1}</span>
                    {label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="booking-layout">
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (step === 5) {
                  void handleSubmit(submit, () =>
                    setProblem("Please review your details before submitting."),
                  )(event);
                } else {
                  void next();
                }
              }}
              onChange={() => {
                submissionKey.current = null;
              }}
            >
              <input type="hidden" {...register("date")} />
              <input type="hidden" {...register("time")} />
              <div className="booking-step-caption">Step {step + 1} of 6</div>
              <h2 id="booking-step-title" ref={heading} tabIndex={-1}>
                {titles[step]}
              </h2>
              {problem && (
                <p className="booking-error" role="alert">
                  {problem}
                </p>
              )}
              {step === 0 && (
                <fieldset
                  className="booking-services"
                  {...fieldA11y("serviceId")}
                >
                  <legend className="sr-only">Appointment service</legend>
                  {appointmentServices
                    .filter((item) => item.enabled)
                    .map((item) => (
                      <label
                        key={item.id}
                        className={`booking-service ${serviceId === item.id ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          value={item.id}
                          disabled={busy}
                          {...register("serviceId")}
                          onChange={(event) => {
                            setValue("serviceId", event.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            changeService();
                          }}
                        />
                        <span>
                          <strong>{item.name}</strong>
                          <span>{item.description}</span>
                          <small>{item.durationMinutes} min</small>
                        </span>
                      </label>
                    ))}
                  {!appointmentServices.some((item) => item.enabled) && (
                    <p>
                      No appointment services are configured. Please contact the
                      studio.
                    </p>
                  )}
                  {fieldError("serviceId")}
                </fieldset>
              )}
              {step === 1 && (
                <div
                  className="booking-date-step"
                  role="group"
                  aria-labelledby="booking-step-title"
                  {...fieldA11y("date")}
                >
                  <p>
                    Choose a date with available times. All dates use Harare
                    time.
                  </p>
                  {availability.state === "loading" ||
                  availability.state === "idle" ? (
                    <p role="status">Loading availability…</p>
                  ) : availability.state === "error" ? (
                    <div className="booking-error">
                      <p>Availability could not load.</p>
                      <Button
                        onClick={() => {
                          setGateway(createDatabaseBookingGateway());
                          setAvailability({ state: "loading", days: [] });
                        }}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <DayPicker
                        className="booking-calendar"
                        mode="single"
                        required
                        timeZone={bookingConfig.timeZone}
                        selected={date ? dateFromKey(date) : undefined}
                        onSelect={changeDate}
                        defaultMonth={dateFromKey(today)}
                        startMonth={dateFromKey(today)}
                        endMonth={dateFromKey(
                          addDays(today, bookingConfig.horizonDays - 1),
                        )}
                        disabled={(day) =>
                          busy || !availableDates.has(studioDateKey(day))
                        }
                        modifiers={{
                          past: (day) => studioDateKey(day) < today,
                          unavailable: (day) =>
                            studioDateKey(day) >= today &&
                            !availableDates.has(studioDateKey(day)),
                        }}
                        modifiersClassNames={{
                          past: "booking-past",
                          unavailable: "booking-unavailable",
                        }}
                        labels={{
                          labelDayButton: (day, modifiers) =>
                            `${formatAppointmentDate(studioDateKey(day))}, ${modifiers.past ? "past date" : modifiers.disabled ? "unavailable date" : modifiers.selected ? "selected date" : "available date"}`,
                        }}
                      />
                      <div
                        className="calendar-legend"
                        aria-label="Calendar key"
                      >
                        <span>
                          <i className="legend-available" />
                          Available
                        </span>
                        <span>
                          <i className="legend-unavailable" />
                          Unavailable
                        </span>
                        <span>
                          <i className="legend-selected" />
                          Selected
                        </span>
                        <span>
                          <i className="legend-past" />
                          Past
                        </span>
                      </div>
                      {!availableDates.size && (
                        <p>
                          No dates are currently available for this service.
                          Choose another service or contact the studio.
                        </p>
                      )}
                    </>
                  )}
                  {fieldError("date")}
                </div>
              )}
              {step === 2 && (
                <div className="booking-times">
                  <p>
                    {date
                      ? formatAppointmentDate(date)
                      : "Choose a date first."}
                    <br />
                    Harare time · UTC+02:00
                  </p>
                  <fieldset>
                    <legend className="sr-only">Appointment time</legend>
                    <div className="booking-slot-grid">
                      {selectedDay?.slots.map((slot) => (
                        <label
                          key={slot.time}
                          className={`booking-slot ${time === slot.time ? "is-selected" : ""} ${!slot.available ? "is-unavailable" : ""}`}
                        >
                          <input
                            type="radio"
                            name="time-choice"
                            value={slot.time}
                            checked={time === slot.time}
                            disabled={!slot.available || busy}
                            onChange={() => {
                              setValue("time", slot.time, {
                                shouldValidate: true,
                              });
                              submissionKey.current = null;
                              setProblem("");
                            }}
                          />
                          <span>
                            <strong>
                              {slot.time}–{slot.endTime}
                            </strong>
                            <small>
                              {!slot.available
                                ? slot.reason === "past"
                                  ? "Past time"
                                  : "Unavailable"
                                : time === slot.time
                                  ? "Selected"
                                  : "Available"}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {!selectedDay?.slots.some((slot) => slot.available) && (
                    <div className="booking-empty">
                      <p>No times remain on this day.</p>
                      <Button variant="outline" onClick={() => move(1)}>
                        Choose another date
                      </Button>
                    </div>
                  )}
                  {fieldError("time")}
                </div>
              )}
              {step === 3 && (
                <div className="booking-customer">
                  <p>
                    Your contact details will be sent securely when you submit.
                    They help Florins respond to your appointment request.
                  </p>
                  <div className="booking-customer-grid">
                    <div>
                      <label htmlFor="booking-name">Full name</label>
                      <Input
                        id="booking-name"
                        autoComplete="name"
                        required
                        maxLength={100}
                        {...register("fullName")}
                        {...fieldA11y("fullName")}
                      />
                      {fieldError("fullName")}
                    </div>
                    <div>
                      <label htmlFor="booking-email">Email address</label>
                      <Input
                        id="booking-email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        {...register("email")}
                        {...fieldA11y("email")}
                      />
                      {fieldError("email")}
                    </div>
                    <div>
                      <label htmlFor="booking-phone">Phone number</label>
                      <Input
                        id="booking-phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        maxLength={32}
                        {...register("phone")}
                        {...fieldA11y("phone")}
                      />
                      {fieldError("phone")}
                    </div>
                    <div>
                      <label htmlFor="booking-event">
                        Event date (optional)
                      </label>
                      <Input
                        id="booking-event"
                        type="date"
                        min={date || today}
                        {...register("eventDate")}
                        {...fieldA11y("eventDate")}
                      />
                      {fieldError("eventDate")}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="booking-notes">
                      Additional notes (optional)
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={5}
                      maxLength={1500}
                      {...register("notes")}
                      {...fieldA11y("notes")}
                    />
                    {fieldError("notes")}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="booking-review">
                  <p>
                    Please check your appointment request before continuing.
                  </p>
                  {reviewDetails(getValues())}
                  <div className="booking-edit-links">
                    <button
                      type="button"
                      disabled={Boolean(management)}
                      onClick={() => move(0)}
                    >
                      Change service
                    </button>
                    <button type="button" onClick={() => move(1)}>
                      Change date
                    </button>
                    <button type="button" onClick={() => move(2)}>
                      Change time
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(management)}
                      onClick={() => move(3)}
                    >
                      Edit customer details
                    </button>
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="booking-submit">
                  <p>
                    You are about to {management ? "reschedule" : "save"} an{" "}
                    <strong>appointment request</strong>. Florins must confirm
                    your visit before you travel.
                  </p>
                  <p>
                    {service?.name} · {date ? formatAppointmentDate(date) : ""}{" "}
                    · {time} (Harare)
                  </p>
                  <label>
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={acknowledged}
                      onChange={(event) =>
                        setAcknowledged(event.target.checked)
                      }
                    />
                    I understand my request will be saved and is subject to
                    studio confirmation.
                  </label>
                </div>
              )}
              <div className="booking-actions">
                {management && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      reset(management.request);
                      setConfirmation(management);
                      setManagement(null);
                      setProblem("");
                      requestAnimationFrame(() => heading.current?.focus());
                    }}
                  >
                    Keep existing request
                  </Button>
                )}
                {step > 0 && !(management && step === 1) && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      move(management && step === 4 ? 2 : step - 1)
                    }
                  >
                    <ArrowLeft aria-hidden="true" />
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    !clock ||
                    busy ||
                    !appointmentServices.some((item) => item.enabled)
                  }
                >
                  {busy
                    ? "Checking details…"
                    : step === 5
                      ? management
                        ? "Submit reschedule request"
                        : "Submit appointment request"
                      : step === 4
                        ? "Continue to submit"
                        : "Continue"}
                  {!busy && <ArrowUpRight aria-hidden="true" />}
                </Button>
              </div>
            </form>
            <aside
              className="booking-summary"
              aria-labelledby="booking-summary-title"
            >
              <h3 id="booking-summary-title">Your selection</h3>
              <dl>
                <div>
                  <dt>Service</dt>
                  <dd>{service?.name ?? "Choose a service"}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>
                    {service
                      ? `${service.durationMinutes} minutes`
                      : "Not selected"}
                  </dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{date ? formatAppointmentDate(date) : "Not selected"}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{time || "Not selected"}</dd>
                </div>
              </dl>
              <p>
                Harare · UTC+02:00
                <br />
                Availability is checked again on submission.
              </p>
              <p>{site.location}</p>
              <Link href={site.whatsapp} className="text-link">
                Contact the studio <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
