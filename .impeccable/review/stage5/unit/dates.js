"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studioDateKey = studioDateKey;
exports.dateFromKey = dateFromKey;
exports.addDays = addDays;
exports.validDateKey = validDateKey;
exports.formatAppointmentDate = formatAppointmentDate;
exports.slotTimestamp = slotTimestamp;
exports.minuteLabel = minuteLabel;
const config_1 = require("./config");
function studioDateKey(value = new Date()) {
    const parts = new Intl.DateTimeFormat("en", {
        timeZone: config_1.bookingConfig.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(value);
    const part = (name) => parts.find((item) => item.type === name).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}
function dateFromKey(key) {
    return new Date(`${key}T12:00:00${config_1.bookingConfig.utcOffset}`);
}
function addDays(key, days) {
    const value = new Date(`${key}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
}
function validDateKey(key) {
    const date = new Date(`${key}T12:00:00Z`);
    return (/^\d{4}-\d{2}-\d{2}$/.test(key) &&
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === key);
}
function formatAppointmentDate(key) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: config_1.bookingConfig.timeZone,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(dateFromKey(key));
}
function slotTimestamp(date, time) {
    return Date.parse(`${date}T${time}:00${config_1.bookingConfig.utcOffset}`);
}
function minuteLabel(minute) {
    return `${Math.floor(minute / 60)
        .toString()
        .padStart(2, "0")}:${(minute % 60).toString().padStart(2, "0")}`;
}
