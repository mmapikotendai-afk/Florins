import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const { chromium } = await import(
  pathToFileURL(
    process.env.FLORINS_PLAYWRIGHT_ROOT + "/node_modules/playwright/index.mjs",
  ).href
);
const base = process.env.FLORINS_STAGE5_URL ?? "http://127.0.0.1:3000";
const out = ".impeccable/review/stage5";
fs.mkdirSync(`${out}/unit`, { recursive: true });
// Compile the pure fixture boundary for isolated tests without a production TS loader.
fs.writeFileSync(`${out}/unit/package.json`, '{"type":"commonjs"}');
for (const name of fs
  .readdirSync("src/lib/booking")
  .filter((name) => name.endsWith(".ts")))
  fs.writeFileSync(
    `${out}/unit/${name.replace(/\.ts$/, ".js")}`,
    ts.transpileModule(fs.readFileSync(`src/lib/booking/${name}`, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
const require = createRequire(import.meta.url);
const { createMockBookingGateway, buildMockAvailability } = require(
  path.resolve(`${out}/unit/mock-gateway.js`),
);
const { appointmentServices } = require(path.resolve(`${out}/unit/config.js`));
const { slotTimestamp, studioDateKey } = require(
  path.resolve(`${out}/unit/dates.js`),
);
const { bookingRequestSchema } = require(path.resolve(`${out}/unit/schema.js`));
let clock = new Date("2026-10-29T06:00:00Z");
const days = buildMockAvailability("fashion-consultation", clock);
assert.equal(days.length, 56);
assert(days.some((day) => !day.slots.length));
assert(days[0].slots.some((slot) => !slot.available));
const service = appointmentServices[0];
appointmentServices.push({
  id: "administrator-example",
  name: "Another configurable service",
  description: "Test fixture",
  durationMinutes: 120,
  enabled: true,
});
assert(
  buildMockAvailability("administrator-example", clock).some((day) =>
    day.slots.some((slot) => slot.available),
  ),
);
appointmentServices.pop();
service.enabled = false;
assert.equal(buildMockAvailability(service.id, clock).length, 0);
service.enabled = true;
const gateway = createMockBookingGateway(() => clock);
const request = {
  serviceId: service.id,
  date: days[0].date,
  time: "09:00",
  fullName: "Amina Example",
  email: "amina@example.test",
  phone: "+263 00 000 0000",
  eventDate: "2026-11-15",
  notes: "Development test only.",
};
assert(bookingRequestSchema(clock).safeParse(request).success);
assert(!(await gateway.validateSelection({ ...request, time: "11:00" })).valid);
assert(
  !(await gateway.validateSelection({ ...request, date: "2026-10-28" })).valid,
);
assert(
  !(await gateway.validateSelection({ ...request, serviceId: "missing" }))
    .valid,
);
const [first, duplicate] = await Promise.all([
  gateway.submit(request, "same-demo-key"),
  gateway.submit(request, "same-demo-key"),
]);
assert.equal(first.reference, duplicate.reference);
assert(first.reference.startsWith("DEMO-"));
assert.equal(first.status, "demo-only");
assert(
  (await gateway.validateSelection(request)).valid,
  "Submitting a demo must not reserve inventory",
);
clock = new Date(slotTimestamp(request.date, request.time) + 60_000);
assert(!(await gateway.validateSelection(request)).valid);
await assert.rejects(
  () => gateway.submit(request, "expired-key"),
  /no longer available/,
);
assert.equal(studioDateKey(new Date("2026-10-28T23:30:00Z")), "2026-10-29");

const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const results = [];
const information = {
  "booking-name": "Amina Example",
  "booking-email": "amina@example.test",
  "booking-phone": "+263 00 000 0000",
  "booking-event": "2026-11-15",
  "booking-notes": "Synthetic appointment demonstration.",
};
async function capture(page, width, state) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow ${width} ${state}`,
  );
  if (
    [320, 375, 1440].includes(width) ||
    state === "date" ||
    state === "confirmation"
  ) {
    await page.evaluate(async () => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      scrollTo({ top: 0, behavior: "instant" });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    await page.screenshot({
      path: `${out}/${state}-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
}
async function selectDate(page) {
  await page
    .getByRole("button", { name: /, available demo date$/ })
    .first()
    .click();
  assert(
    await page.getByRole("button", { name: /, selected date$/ }).isVisible(),
  );
}
async function fillCustomer(page) {
  for (const [id, value] of Object.entries(information))
    await page.locator(`#${id}`).fill(value);
}
async function next(page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
try {
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      timezoneId:
        width === 1440 ? "America/Los_Angeles" : "Africa/Johannesburg",
      reducedMotion: "reduce",
    });
    await page.clock.setFixedTime(new Date("2026-10-29T06:00:00Z"));
    const errors = [],
      requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) =>
      requests.push({ url: request.url(), method: request.method() }),
    );
    await page.goto(base + "/appointments", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await next(page);
    await page
      .getByRole("alert")
      .getByText("Choose an appointment service.")
      .waitFor();
    await page.getByRole("radio", { name: /Fashion Consultation/ }).check();
    await capture(page, width, "service");
    await next(page);
    await page
      .getByRole("button", { name: /, available demo date$/ })
      .first()
      .waitFor();
    assert(
      await page.locator(".booking-past .rdp-day_button").first().isDisabled(),
    );
    assert(
      await page
        .locator(".booking-unavailable .rdp-day_button")
        .first()
        .isDisabled(),
    );
    await selectDate(page);
    await capture(page, width, "date");
    await next(page);
    assert(
      await page
        .getByRole("radio", { name: /Unavailable/ })
        .first()
        .isDisabled(),
    );
    await page.getByRole("radio", { name: /09:00/ }).check();
    await capture(page, width, "time");
    await next(page);
    await next(page);
    await page.getByText("Enter your full name.", { exact: true }).waitFor();
    await fillCustomer(page);
    await page.locator("#booking-event").fill("2026-10-28");
    await next(page);
    await page
      .getByText("Your event date cannot be before the appointment date.", {
        exact: true,
      })
      .waitFor();
    await page.locator("#booking-event").fill(information["booking-event"]);
    await next(page);
    try {
      await page
        .getByRole("heading", { name: "Review your appointment.", exact: true })
        .waitFor({ timeout: 5000 });
    } catch (error) {
      console.log(
        "Stopped flow:",
        await page.locator(".booking-layout form").innerText(),
      );
      await page.screenshot({
        path: `${out}/flow-stalled.png`,
        fullPage: true,
      });
      throw error;
    }
    assert(
      (await page.locator(".booking-review").innerText()).includes(
        "Amina Example",
      ),
    );
    await page.getByRole("button", { name: "Back", exact: true }).click();
    assert.equal(
      await page.locator("#booking-name").inputValue(),
      information["booking-name"],
    );
    await capture(page, width, "customer");
    await next(page);
    await page
      .getByRole("heading", { name: "Review your appointment.", exact: true })
      .waitFor();
    await capture(page, width, "review");
    await page
      .getByRole("button", { name: "Continue to submit", exact: true })
      .click();
    await capture(page, width, "submit");
    await page
      .getByRole("button", { name: "Submit demo booking", exact: true })
      .click();
    await page
      .getByRole("alert")
      .getByText(/acknowledge/)
      .waitFor();
    await page
      .getByRole("checkbox", { name: /I understand this is a demo/ })
      .check();
    if (width === 1440) {
      await page.clock.setFixedTime(new Date("2026-10-29T08:15:00Z"));
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await page
        .getByRole("button", { name: "Submit demo booking", exact: true })
        .click();
      await page
        .getByRole("alert")
        .getByText(/no longer available/)
        .waitFor();
      await capture(page, width, "expired-time");
      await page.locator('input[name="time-choice"][value="10:30"]').check();
      await next(page);
      assert.equal(
        await page.locator("#booking-name").inputValue(),
        information["booking-name"],
      );
      await next(page);
      await page
        .getByRole("button", { name: "Continue to submit", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: /I understand this is a demo/ })
        .check();
    }
    await page.evaluate(() => {
      const button = [...document.querySelectorAll("button")].find((button) =>
        button.textContent.includes("Submit demo booking"),
      );
      button.click();
      button.click();
    });
    await page
      .getByRole("heading", { name: "Your demo is complete.", exact: true })
      .waitFor();
    assert.match(
      await page.locator(".booking-reference strong").innerText(),
      /^DEMO-[A-F0-9]{8}$/,
    );
    assert.equal(
      await page.locator(".booking-status").innerText(),
      "Demo only — not reserved",
    );
    assert(
      (await page.locator(".booking-confirmation").innerText()).includes(
        "Milton Park, Harare, Zimbabwe",
      ),
    );
    await capture(page, width, "confirmation");
    assert.deepEqual(errors, []);
    assert(
      requests.every(
        (request) => request.method === "GET" || request.method === "HEAD",
      ),
    );
    assert(
      requests.every(
        (request) =>
          !request.url.includes("amina") && !request.url.includes("fullName="),
      ),
    );
    assert(
      requests
        .filter((request) => request.url.startsWith("http"))
        .every(
          (request) => new URL(request.url).origin === new URL(base).origin,
        ),
    );
    assert.equal(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
      0,
    );
    await page
      .getByRole("button", { name: "Start another demo", exact: true })
      .click();
    assert.equal(await page.locator('input[type="radio"]:checked').count(), 0);
    // Service/date dependency changes must invalidate the old choice.
    if (width === 375) {
      await page.getByRole("radio", { name: /Fashion Consultation/ }).check();
      await next(page);
      await selectDate(page);
      await next(page);
      await page.getByRole("radio", { name: /09:00/ }).check();
      await page.getByRole("button", { name: /^1\s*Service$/ }).click();
      await page.getByRole("radio", { name: /Group Consultation/ }).check();
      await next(page);
      assert.equal(await page.locator('input[name="date"]').inputValue(), "");
      assert.equal(await page.locator('input[name="time"]').inputValue(), "");
    }
    results.push({
      width,
      overflow: false,
      browserErrors: errors,
      flow: true,
      confirmation: true,
      private: true,
    });
    await page.close();
  }
  const plainBrowser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const plain = await plainBrowser.newPage({ javaScriptEnabled: false });
    await plain.goto(base + "/appointments");
    assert(
      await plain
        .getByRole("button", { name: "Continue", exact: true })
        .isDisabled(),
    );
    assert(
      await plain
        .getByText(/Enable JavaScript to explore this demo/)
        .isVisible(),
    );
    await plain.close();
  } finally {
    await plainBrowser.close();
  }
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        viewports: results,
        pureGatewayTests: true,
        concurrentIdempotency: true,
        expiredSlot: true,
        serviceDependencyReset: true,
        noJavaScript: true,
        noProductionDatabase: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed six-step flows at seven widths, calendar and slot states, validation, expired-time recovery, duplicate submit, privacy, service resets and no-JS behavior.",
  );
} finally {
  await browser.close();
}
