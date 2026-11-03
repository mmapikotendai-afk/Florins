import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    `${process.env.FLORINS_PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`,
  ).href
);
const base = process.env.FLORINS_STAGE6_URL ?? "http://127.0.0.1:3000";
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
const out = ".local/stage6-results";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    const page = await context.newPage();
    const capture = async (name) => {
      // Full-page capture must begin at the top: fixed elements otherwise render
      // at the current document scroll offset in Chromium's stitched image.
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `${out}/${width}-${name}.png`,
        fullPage: true,
      });
    };
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/appointments`);
    await page
      .getByText("Development database. Test appointments only.", {
        exact: true,
      })
      .waitFor();
    await capture("service");
    await page.getByRole("radio", { name: /Fashion Consultation/ }).check();
    const next = () =>
      page.getByRole("button", { name: "Continue", exact: true }).click();
    await next();
    await page
      .getByRole("button", { name: /, available date$/ })
      .first()
      .click();
    await next();
    await page.locator('input[name="time-choice"]:enabled').first().check();
    await next();
    await page.locator("#booking-name").fill("Synthetic Browser Test");
    await page.locator("#booking-email").fill("browser-test@example.test");
    await page.locator("#booking-phone").fill("+263771000000");
    await next();
    await page
      .getByRole("heading", { name: "Review your appointment.", exact: true })
      .waitFor();
    await capture("review");
    await page
      .getByRole("button", { name: "Continue to submit", exact: true })
      .click();
    await page.getByRole("checkbox").check();
    let dropped = false;
    if (width === 375) {
      await page.route("**/appointments", async (route) => {
        if (!dropped && route.request().headers()["next-action"]) {
          dropped = true;
          await route.fetch(); // Commit the mutation, then simulate a lost response.
          await route.abort("failed");
        } else await route.continue();
      });
    }
    await page
      .getByRole("button", { name: "Submit appointment request", exact: true })
      .click();
    if (width === 375) {
      await page.getByRole("alert").waitFor();
      assert(dropped);
      await page
        .getByRole("button", {
          name: "Submit appointment request",
          exact: true,
        })
        .click();
    }
    await page
      .getByRole("heading", { name: "Your request is received.", exact: true })
      .waitFor();
    const reference = await page
      .locator(".booking-reference strong")
      .innerText();
    assert.match(reference, /^FLR-[A-F0-9]{16}$/);
    await capture("confirmation");
    await page
      .getByRole("button", { name: "Reschedule request", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Keep existing request", exact: true })
      .click();
    assert.equal(
      await page.locator(".booking-reference strong").innerText(),
      reference,
    );
    await page
      .getByRole("button", { name: "Reschedule request", exact: true })
      .click();
    await page
      .getByRole("button", { name: /, (available|selected) date$/ })
      .last()
      .click();
    await next();
    await page.locator('input[name="time-choice"]:enabled').last().check();
    await next();
    await page
      .getByRole("button", { name: "Continue to submit", exact: true })
      .click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Submit reschedule request", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Your request is received.", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Cancel request", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Your request is cancelled.", exact: true })
      .waitFor();
    await capture("cancelled");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    assert.equal(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
      0,
    );
    await page.reload();
    assert.equal(await page.locator(".booking-reference").count(), 0);
    results.push({
      width,
      flow: "create, reschedule, cancel, reload",
      lostResponseRetry: width === 375,
      passed: true,
    });
    await context.close();
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${base}/appointments`);
  await page.getByText(/Enable JavaScript to request an appointment/).waitFor();
  assert(
    await page
      .getByRole("button", { name: "Continue", exact: true })
      .isDisabled(),
  );
  const denied = await context.request.post(`${base}/api/admin/configuration`, {
    data: {},
  });
  assert.equal(denied.status(), 401);
  const origin = await context.request.post(`${base}/api/appointments`, {
    headers: { origin: "https://untrusted.example" },
    data: {},
  });
  assert.equal(origin.status(), 403);
  results.push({
    noJavaScript: true,
    unauthorizedAdmin: 401,
    untrustedOrigin: 403,
    passed: true,
  });
  await context.close();
  fs.writeFileSync(
    `${out}/browser.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        engine: "Edge Chromium, emulated viewports",
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
