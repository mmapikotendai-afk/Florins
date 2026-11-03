import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    process.env.FLORINS_PLAYWRIGHT_ROOT + "/node_modules/playwright/index.mjs",
  ).href
);
const { collectionFixtures, designFixtures } = await import(
  pathToFileURL(path.resolve("src/lib/catalogue/fixtures.ts")).href
);
const base = process.env.FLORINS_CATALOGUE_URL ?? "http://127.0.0.1:3000";
const out = ".impeccable/review/stage3";
const capturePages = process.env.FLORINS_CAPTURE_PAGES !== "0";
fs.mkdirSync(out, { recursive: true });

const collections = collectionFixtures.filter((item) => item.published);
assert.equal(
  new Set(collectionFixtures.map((item) => item.slug)).size,
  collectionFixtures.length,
  "Collection slugs must be unique",
);
assert.equal(
  new Set(designFixtures.map((item) => item.slug)).size,
  designFixtures.length,
  "Design slugs must be unique",
);
for (const item of designFixtures) {
  assert(item.photographs.length > 0, "Design needs at least one photograph");
  assert(
    item.collectionIds.every((id) =>
      collectionFixtures.some((collection) => collection.id === id),
    ),
    "Orphaned category reference",
  );
  assert(item.sample, "Development fixture must be marked as sample");
  assert.equal(item.price, null, "Fixtures must not imply confirmed prices");
}
const routes = [{ slug: "index", url: "/collections", kind: "index" }];
for (const collection of collections) {
  routes.push({
    slug: collection.slug,
    url: `/collections/${collection.slug}`,
    kind: "collection",
  });
  for (const design of designFixtures.filter(
    (item) => item.published && item.collectionIds.includes(collection.id),
  ))
    routes.push({
      slug: `${collection.slug}--${design.slug}`,
      url: `/collections/${collection.slug}/${design.slug}`,
      kind: "design",
    });
}

const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const interactionsOnly = process.env.FLORINS_INTERACTIONS_ONLY === "1";
const results = interactionsOnly
  ? JSON.parse(fs.readFileSync(`${out}/results.json`, "utf8")).routes
  : [];
try {
  if (!interactionsOnly) {
    for (const route of routes)
      for (const width of [375, 1440]) {
        const page = await browser.newPage({
          viewport: { width, height: 1000 },
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        const response = await page.goto(base + route.url, {
          waitUntil: "networkidle",
        });
        assert.equal(response.status(), 200, route.url);
        await page.evaluate(() => document.fonts.ready);
        for (const image of await page.locator("img").all())
          if (await image.isVisible()) {
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((image) => image.decode());
          }
        assert(
          await page
            .locator('aside[aria-label="Sample catalogue information"]')
            .isVisible(),
          "Missing sample disclosure",
        );
        assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
        if (width === 1440)
          assert.equal(
            await page
              .getByRole("navigation", { name: "Main navigation" })
              .getByRole("link", { name: "Collections", exact: true })
              .getAttribute("aria-current"),
            "page",
          );
        const metrics = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images]
            .filter(
              (image) =>
                image.getClientRects().length > 0 &&
                (!image.complete || !image.naturalWidth),
            )
            .map((image) => image.src),
        }));
        assert(
          metrics.scrollWidth <= width,
          `Overflow ${route.url} at ${width}`,
        );
        assert.deepEqual(metrics.brokenImages, []);
        assert.deepEqual(errors, []);
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        if (capturePages)
          await page.screenshot({
            path: `${out}/${route.slug}-${width}.png`,
            fullPage: true,
            animations: "disabled",
          });
        results.push({ route: route.url, ...metrics, errors });
        await page.close();
      }
    // Boundary widths for the long-name collection and gallery, not only the index.
    for (const url of [
      "/collections",
      "/collections/traditional-occasion-wear",
      "/collections/traditional-occasion-wear/the-occasion-silhouette",
    ])
      for (const width of [320, 430, 768, 1024, 1920]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        await page.goto(base + url, { waitUntil: "networkidle" });
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `Boundary overflow ${width} ${url}`,
        );
        results.push({ route: url, width, boundary: true, overflow: false });
        if (width === 320 && capturePages) {
          await page.evaluate(async () => {
            for (const image of document.images) {
              if (image.getBoundingClientRect().width) {
                image.scrollIntoView();
                await image.decode();
              }
            }
            scrollTo({ top: 0, behavior: "instant" });
          });
          await page.screenshot({
            path: `${out}/${url.split("/").at(-1)}-320.png`,
            fullPage: true,
            animations: "disabled",
          });
        }
        await page.close();
      }
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(base + "/collections", { waitUntil: "networkidle" });
  await page
    .getByLabel("Collection", { exact: true })
    .selectOption("african-prints");
  await page.getByRole("button", { name: "Apply filter" }).click();
  await page.waitForURL("**/collections?category=african-prints#designs");
  assert.equal(await page.locator(".design-card").count(), 2);
  assert.match(await page.getByRole("status").innerText(), /2 sample designs/);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page.getByLabel("Collection", { exact: true }).inputValue(),
    "african-prints",
  );
  assert.equal(await page.locator(".design-card").count(), 2);
  await page.goto(base + "/collections?category=not-a-category#designs", {
    waitUntil: "networkidle",
  });
  assert.equal(await page.locator(".design-card").count(), 0);
  for (const image of await page.locator("img").all())
    if (await image.isVisible()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image) => image.decode());
    }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `${out}/invalid-filter-1440.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Clear filter" }).click();
  await page.waitForURL(base + "/collections#designs");
  await page.locator(".design-card").first().waitFor({ state: "visible" });
  assert.equal(
    await page.locator(".design-card").count(),
    designFixtures.filter((item) => item.published).length,
  );
  const multi =
    "/collections/traditional-occasion-wear/the-occasion-silhouette";
  await page.goto(base + multi, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "View photograph 2", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "View photograph 2", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  const opener = page.getByRole("button", { name: /Enlarge photograph 2/ });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  assert.equal(
    await page
      .locator(".zoom-canvas")
      .evaluate((element) => element.style.width),
    "150%",
  );
  assert.equal(
    await page
      .locator(".zoom-canvas img")
      .evaluate((element) => getComputedStyle(element).objectFit),
    "contain",
  );
  await page.locator(".zoom-canvas img").evaluate((image) => image.decode());
  const centered = await page.locator(".zoom-viewport").evaluate((frame) => ({
    left: frame.scrollLeft,
    expected: (frame.scrollWidth - frame.clientWidth) / 2,
    top: frame.scrollTop,
    expectedTop: (frame.scrollHeight - frame.clientHeight) / 2,
  }));
  assert(
    Math.abs(centered.left - centered.expected) < 2,
    "Desktop zoom must keep the photograph centered",
  );
  assert(
    Math.abs(centered.top - centered.expectedTop) < 2,
    "Desktop vertical zoom must retain the view center",
  );
  await page.screenshot({ path: `${out}/zoom-1440.png` });
  const beforePanZoom = await page
    .locator(".zoom-viewport")
    .evaluate((frame) => {
      frame.scrollTo(100, 50);
      return {
        x: (frame.scrollLeft + frame.clientWidth / 2) / frame.scrollWidth,
        y: (frame.scrollTop + frame.clientHeight / 2) / frame.scrollHeight,
      };
    });
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  const afterPanZoom = await page
    .locator(".zoom-viewport")
    .evaluate((frame) => ({
      x: (frame.scrollLeft + frame.clientWidth / 2) / frame.scrollWidth,
      y: (frame.scrollTop + frame.clientHeight / 2) / frame.scrollHeight,
    }));
  assert(
    Math.abs(beforePanZoom.x - afterPanZoom.x) < 0.01 &&
      Math.abs(beforePanZoom.y - afterPanZoom.y) < 0.01,
    "Zoom must retain a manually panned view center",
  );
  await page.getByRole("button", { name: "Reset zoom" }).click();
  assert.equal(
    await page
      .locator(".zoom-canvas")
      .evaluate((element) => element.style.width),
    "100%",
  );
  await page.keyboard.press("ArrowRight");
  assert.match(await dialog.innerText(), /3 \/ 4/);
  await page.keyboard.press("Escape");
  assert.equal(await dialog.isVisible(), false);
  assert.equal(
    await page
      .locator(".gallery-open")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.equal(
    await page
      .getByRole("link", { name: "Enquire", exact: true })
      .getAttribute("href"),
    "https://www.instagram.com/florins.zw/",
  );
  assert.equal(
    await page
      .getByRole("link", { name: "Book appointment", exact: true })
      .last()
      .getAttribute("href"),
    "/appointments",
  );
  await page.setViewportSize({ width: 320, height: 800 });
  await page.locator(".gallery-open").click();
  assert(await dialog.isVisible());
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.locator(".zoom-canvas img").evaluate((image) => image.decode());
  assert(
    await page
      .locator(".zoom-viewport")
      .evaluate(
        (frame) =>
          Math.abs(
            frame.scrollLeft - (frame.scrollWidth - frame.clientWidth) / 2,
          ) < 2,
      ),
    "Mobile zoom must center the photograph",
  );
  await page.screenshot({ path: `${out}/zoom-320.png` });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Collections", exact: true })
    .click();
  await page.waitForURL(base + "/collections");
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation" })
      .getAttribute("aria-expanded"),
    "false",
  );
  for (const url of [
    "/collections/no-such-collection",
    "/collections/gowns/no-such-design",
    "/collections/gowns/the-occasion-silhouette",
  ]) {
    const response = await page.goto(base + url);
    assert.equal(response.status(), 404);
    assert(
      await page
        .getByRole("link", { name: "Explore collections", exact: true })
        .isVisible(),
    );
  }
  await page.goto(base + "/");
  assert.equal(
    await page
      .getByRole("link", { name: "Explore collections", exact: true })
      .getAttribute("href"),
    "/collections",
  );
  await page.close();
  // Progressive enhancement: filtering and catalogue links also work without JavaScript.
  const noJsBrowser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const plain = await noJsBrowser.newPage({ javaScriptEnabled: false });
  await plain.goto(base + "/collections");
  await plain.getByLabel("Collection", { exact: true }).selectOption("prom");
  await plain.getByRole("button", { name: "Apply filter" }).click();
  assert.equal(await plain.locator(".design-card").count(), 1);
  await plain.close();
  await noJsBrowser.close();
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        routes: results,
        filter: true,
        reload: true,
        invalidFilter: true,
        gallery: true,
        zoom: true,
        focusRestoration: true,
        notFound: true,
        noJavaScriptFilter: true,
      },
      null,
      2,
    ),
  );
  console.log(
    `Passed ${routes.length} routes at desktop/mobile, 15 boundary checks, filtering, no-JS filtering, multi-photo zoom, keyboard/focus, navigation and 404 checks.`,
  );
} finally {
  await browser.close();
}
