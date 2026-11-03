import fs from "node:fs";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    `${process.env.FLORINS_PLAYWRIGHT_ROOT}/node_modules/playwright/index.mjs`,
  ).href
);
const base = process.env.FLORINS_HERO_URL ?? "http://localhost:3000";
const out = ".impeccable/review/hero-photography";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of [375, 430, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 1080 },
      deviceScaleFactor: 1,
    });
    const errors = [],
      media = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (/florins-hero|\.mp4/.test(request.url())) media.push(request.url());
    });
    const response = await page.goto(base, {
      waitUntil: "networkidle",
      timeout: 90000,
    });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".fashion-hero-image")
      .evaluate((image) => image.decode());
    await page.screenshot({
      path: `${out}/hero-${width}.png`,
      animations: "disabled",
    });
    if (width === 1440) {
      for (const image of await page.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
      }
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `${out}/homepage-1440.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector(".fashion-hero"),
        image = hero.querySelector("img");
      const rect = (element) => {
        const r = element.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
          right: r.right,
        };
      };
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        hero: rect(hero),
        image: rect(image),
        source: image.currentSrc,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        fit: getComputedStyle(image).objectFit,
        font: getComputedStyle(hero.querySelector("h1")).fontFamily,
        headerPosition: getComputedStyle(document.querySelector("header"))
          .position,
        copy: [...hero.querySelectorAll("h1,p")].map((element) => ({
          text: element.textContent,
          ...rect(element),
        })),
        actions: [...hero.querySelectorAll("a")].map((element) => ({
          href: element.getAttribute("href"),
          ...rect(element),
        })),
      };
    });
    assert(!metrics.overflow, `Overflow at ${width}`);
    assert.equal(await page.locator("video").count(), 0);
    assert.equal(metrics.fit, "contain");
    assert(metrics.font.includes("Cormorant"));
    assert.equal(metrics.headerPosition, "fixed");
    const photo = width < 768 ? "mobile" : "desktop";
    assert(metrics.source.includes(`florins-hero-${photo}.png`));
    assert.equal(
      new Set(
        media.map(
          (url) =>
            new URL(url).searchParams.get("url") ?? new URL(url).pathname,
        ),
      ).size,
      1,
      "More than one hero source requested",
    );
    assert(!media.some((url) => url.endsWith(".mp4")));
    assert.deepEqual(
      metrics.actions.map((action) => action.href),
      ["/collections", "/appointments"],
    );
    for (const action of metrics.actions) {
      assert(action.height >= 48);
      assert(action.x >= 0 && action.right <= width);
      assert(action.bottom <= metrics.hero.bottom);
    }
    for (const copy of metrics.copy) assert(copy.x >= 0 && copy.right <= width);
    await page
      .getByRole("link", { name: "Explore collections", exact: true })
      .first()
      .focus();
    const focus = await page
      .locator(".fashion-hero-actions a")
      .first()
      .evaluate((element) => ({
        active: document.activeElement === element,
        style: getComputedStyle(element).outlineStyle,
      }));
    assert(focus.active && focus.style !== "none");
    if (width === 1440) {
      await page.locator(".fashion-hero-actions a").first().click();
      await page.waitForURL("**/collections");
      await page.goto(base);
      await page.locator(".fashion-hero-actions a").last().click();
      await page.waitForURL("**/appointments");
    }
    assert.deepEqual(errors, []);
    results.push({ ...metrics, requests: media, browserErrors: errors });
    console.log(`PASS hero ${width}px`);
    await page.close();
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(base);
  assert.equal(
    await reduced
      .locator(".fashion-hero-image")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  await reduced.close();
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 1080 },
  });
  const page = await noJS.newPage();
  await page.goto(base);
  await page.locator(".fashion-hero-image").evaluate((image) => image.decode());
  assert(await page.getByRole("heading", { level: 1 }).isVisible());
  assert.equal(await page.locator(".fashion-hero-actions a").count(), 2);
  await noJS.close();
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        engine: "Edge/Chromium emulated viewports",
        reducedMotion: true,
        noJavaScript: true,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
