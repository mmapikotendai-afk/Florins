import { bookingConfig } from "./config";
export function studioDateKey(value: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: bookingConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (name: string) =>
    parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00${bookingConfig.utcOffset}`);
}
export function addDays(key: string, days: number) {
  const value = new Date(`${key}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function validDateKey(key: string) {
  const date = new Date(`${key}T12:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === key
  );
}
export function formatAppointmentDate(key: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: bookingConfig.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateFromKey(key));
}
export function slotTimestamp(date: string, time: string) {
  return Date.parse(`${date}T${time}:00${bookingConfig.utcOffset}`);
}
export function minuteLabel(minute: number) {
  return `${Math.floor(minute / 60)
    .toString()
    .padStart(2, "0")}:${(minute % 60).toString().padStart(2, "0")}`;
}
