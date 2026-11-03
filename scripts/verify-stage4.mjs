import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    process.env.FLORINS_PLAYWRIGHT_ROOT + "/node_modules/playwright/index.mjs",
  ).href
);
const { createBespokeEnquirySchema, studioToday } = await import(
  pathToFileURL(path.resolve("src/lib/validations/bespoke.ts")).href
);
const base = process.env.FLORINS_STAGE4_URL ?? "http://127.0.0.1:3000";
const out = ".impeccable/review/stage4";
fs.mkdirSync(out, { recursive: true });
const today = studioToday();
function dateAfter(days) {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
const details = {
  fullName: "Amina Example",
  email: "amina@example.test",
  phone: "+263 00 000 0000",
  occasion: "Development test occasion",
  preferredDate: dateAfter(30),
  eventDate: dateAfter(60),
  description:
    "A development-test design idea with a long, flowing silhouette and personal details.",
  notes: "Synthetic test content only.",
};
const schema = createBespokeEnquirySchema(today);
assert(schema.safeParse(details).success);
for (const patch of [
  { email: "invalid" },
  { phone: "abc" },
  { preferredDate: dateAfter(-1) },
  { eventDate: "2027-02-30" },
  { preferredDate: dateAfter(61) },
  { description: "Too short" },
  { notes: "a".repeat(1501) },
])
  assert(
    !schema.safeParse({ ...details, ...patch }).success,
    JSON.stringify(patch).slice(0, 100),
  );
assert(
  schema.safeParse({ ...details, preferredDate: "", eventDate: "" }).success,
  "Dates may be undecided",
);

const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const results = [];
async function loadPhotos(page) {
  for (const image of await page.locator("img").all())
    if (await image.isVisible()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image) => image.decode());
    }
}
try {
  for (const route of ["bespoke", "atelier"])
    for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const response = await page.goto(`${base}/${route}`, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await loadPhotos(page);
      assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        broken: [...document.images]
          .filter(
            (image) =>
              image.getClientRects().length &&
              (!image.complete || !image.naturalWidth),
          )
          .map((image) => image.src),
        badAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .filter((link) => !document.getElementById(link.hash.slice(1)))
          .map((link) => link.hash),
      }));
      assert(metrics.scrollWidth <= width, `${route} overflows at ${width}`);
      assert.deepEqual(metrics.broken, []);
      assert.deepEqual(metrics.badAnchors, []);
      assert.deepEqual(errors, []);
      const footer = page.getByRole("contentinfo");
      assert.equal(
        await footer
          .getByRole("link", { name: /^WhatsApp \+263 771 640 916/ })
          .getAttribute("href"),
        "https://wa.me/263771640916",
      );
      assert.equal(
        await footer
          .getByRole("link", { name: "Call +263 771 640 916", exact: true })
          .getAttribute("href"),
        "tel:+263771640916",
      );
      if (width === 1440) {
        const label = route === "bespoke" ? "Bespoke" : "The Atelier";
        assert.equal(
          await page
            .getByRole("navigation", { name: "Main navigation" })
            .getByRole("link", { name: label, exact: true })
            .getAttribute("aria-current"),
          "page",
        );
      }
      if (route === "bespoke")
        assert.equal(await page.locator("#proposed-process li").count(), 7);
      else {
        assert.equal(
          await page.locator(".studio-photo-placeholder").count(),
          3,
        );
        assert(
          await page
            .getByText("Milton Park, Harare, Zimbabwe", { exact: true })
            .isVisible(),
        );
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `${out}/${route}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      results.push({ route, ...metrics, errors });
      await page.close();
    }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const requests = [];
  page.on("request", (request) =>
    requests.push({ url: request.url(), method: request.method() }),
  );
  await page.goto(`${base}/bespoke`, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Prepare enquiry", exact: true })
    .click();
  await page.getByText("Enter your full name.", { exact: true }).waitFor();
  assert.equal(
    await page
      .locator("#fullName")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.equal(
    await page.locator("#fullName").getAttribute("aria-invalid"),
    "true",
  );
  await loadPhotos(page);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `${out}/enquiry-errors-1440.png`,
    fullPage: true,
  });
  for (const [key, value] of Object.entries(details))
    await page.locator(`#${key}`).fill(value);
  await page.locator("#preferredDate").fill(dateAfter(61));
  await page
    .getByRole("button", { name: "Prepare enquiry", exact: true })
    .click();
  await page
    .getByText("Choose a consultation date on or before your event date.", {
      exact: true,
    })
    .waitFor();
  await page.locator("#preferredDate").fill(details.preferredDate);
  const images = page.locator("#references");
  await images.setInputFiles({
    name: "blocked.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await page.getByText(/Other file types are not supported/).waitFor();
  assert.equal(await page.locator(".reference-previews li").count(), 0);
  await images.setInputFiles({
    name: "spoofed.png",
    mimeType: "image/png",
    buffer: Buffer.from("not a real PNG"),
  });
  await page.getByText(/file contents do not match/).waitFor();
  await images.setInputFiles({
    name: "too-large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(6 * 1024 * 1024),
  });
  await page.getByText(/no more than 5 MB/).waitFor();
  await images.setInputFiles(
    ["01", "02", "03", "09"].map(
      (number) => `public/images/florins-${number}.webp`,
    ),
  );
  await page.getByText(/no more than 3 reference images/).waitFor();
  assert.equal(await page.locator(".reference-previews li").count(), 0);
  await images.setInputFiles([
    "public/images/florins-03.webp",
    "public/images/florins-09.webp",
  ]);
  await page.locator(".reference-previews li").nth(1).waitFor();
  await page
    .getByRole("button", { name: "Remove florins-03.webp", exact: true })
    .click();
  assert.equal(await page.locator(".reference-previews li").count(), 1);
  await page
    .getByRole("button", { name: "Prepare enquiry", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your enquiry draft is ready.", exact: true })
    .waitFor();
  assert.equal(
    await page
      .locator("#draft-title")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  const draft = await page.locator("#enquiry-draft").inputValue();
  assert(
    draft.includes(details.email) &&
      draft.includes("florins-09.webp") &&
      draft.includes("not attached") &&
      !draft.includes("blob:"),
  );
  await page.getByRole("button", { name: "Copy enquiry", exact: true }).click();
  assert.equal(
    await page
      .getByRole("link", { name: "Open WhatsApp in a new tab", exact: true })
      .getAttribute("href"),
    "https://wa.me/263771640916",
  );
  assert.equal(
    await page
      .getByRole("link", { name: "Open WhatsApp in a new tab", exact: true })
      .getAttribute("target"),
    "_blank",
    "Keep the local draft available while opening WhatsApp",
  );
  await loadPhotos(page);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `${out}/enquiry-draft-1440.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.locator("#draft-title").scrollIntoViewIfNeeded();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `${out}/enquiry-draft-375.png`,
    fullPage: true,
  });
  await page.locator("#notes").fill("Revised development test notes.");
  assert.equal(
    await page.locator("#enquiry-draft").count(),
    0,
    "Editing invalidates an old draft",
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "The Atelier", exact: true })
    .click();
  await page.waitForURL(`${base}/atelier`);
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation" })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert(
    requests.every(
      (request) => request.method === "GET" || request.method === "HEAD",
    ),
    "The form must not post data or files",
  );
  assert(
    requests
      .filter((request) => request.url.startsWith("http"))
      .every((request) => new URL(request.url).origin === new URL(base).origin),
    "No data should leave the site during draft preparation",
  );
  assert(
    requests.every(
      (request) =>
        !request.url.includes("amina") && !request.url.includes("fullName="),
    ),
    "Personal details must not enter request URLs",
  );
  assert.equal(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
    0,
    "No stored enquiry drafts",
  );
  await page.close();
  const noJsBrowser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const plain = await noJsBrowser.newPage({ javaScriptEnabled: false });
    await plain.goto(`${base}/bespoke`, { waitUntil: "networkidle" });
    assert.equal(
      await plain
        .getByRole("button", { name: "Prepare enquiry", exact: true })
        .isDisabled(),
      true,
    );
    await plain.locator("#fullName").fill("No script test");
    await plain.keyboard.press("Enter");
    assert.equal(plain.url(), `${base}/bespoke`);
    assert(
      await plain.getByText(/Enable JavaScript to prepare a draft/).isVisible(),
    );
    await plain.close();
  } finally {
    await noJsBrowser.close();
  }
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        routes: results,
        fieldValidation: true,
        dateValidation: true,
        restrictedLocalImages: true,
        referenceRemoval: true,
        readyDraft: true,
        editingInvalidatesDraft: true,
        noSubmission: true,
        noPersonalDataInUrls: true,
        noBrowserStorage: true,
        noScriptSafe: true,
        navigation: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed both pages at seven widths, form/date validation, restricted local references, draft/copy flow, no-submit/privacy checks, no-JS safety and navigation.",
  );
} finally {
  await browser.close();
}
