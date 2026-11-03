import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    process.env.FLORINS_PLAYWRIGHT_ROOT + "/node_modules/playwright/index.mjs",
  ).href
);
const base = process.env.FLORINS_NAV_URL ?? "http://127.0.0.1:3000";
const out = ".impeccable/review/navigation";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const routes = [
  ["Home", "/"],
  ["Collections", "/collections"],
  ["Bespoke", "/bespoke"],
  ["The Atelier", "/atelier"],
  ["About", "/about"],
  ["Contact", "/contact"],
];
const results = [];
async function settle(page) {
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}
async function capture(page, name, fullPage = true) {
  await settle(page);
  await page.screenshot({
    path: `${out}/${name}.png`,
    fullPage,
    animations: "disabled",
  });
}
try {
  for (const width of [320, 375, 768, 1024, 1280, 1440, 1918]) {
    const page = await browser.newPage({
      viewport: { width, height: 915 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    for (const route of ["/about", "/contact"]) {
      assert.equal(
        (await page.goto(base + route, { waitUntil: "networkidle" })).status(),
        200,
      );
      await page.locator("main h1").waitFor();
      assert.equal(await page.locator("main h1").count(), 1);
      assert(
        await page
          .title()
          .then((title) =>
            title.includes(route === "/about" ? "About" : "Contact"),
          ),
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const header = await page.locator(".site-header").boundingBox();
      const main = await page.locator("main").boundingBox();
      assert(
        main.y >= header.height - 1,
        "Content must begin below fixed header",
      );
      assert.equal(
        await page
          .locator(".site-header")
          .evaluate((el) => getComputedStyle(el).position),
        "fixed",
      );
      await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
      assert.equal(
        Math.round((await page.locator(".site-header").boundingBox()).y),
        0,
      );
      if ([320, 375, 1280, 1440, 1918].includes(width))
        await capture(page, `${route.slice(1)}-${width}`);
    }
    assert.equal(await page.locator('a[href="tel:+263771640916"]').count(), 2);
    assert.equal(
      await page
        .locator('.contact-channels a[href="https://wa.me/263771640916"]')
        .count(),
      1,
    );
    for (const [label, href] of routes) {
      await page.evaluate(() => scrollTo({ top: 700, behavior: "instant" }));
      let nav;
      if (width < 1280) {
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
        nav = page.getByRole("navigation", {
          name: "Mobile navigation",
          exact: true,
        });
      } else
        nav = page.getByRole("navigation", {
          name: "Main navigation",
          exact: true,
        });
      const link = nav.getByRole("link", { name: label, exact: true });
      assert.equal(await link.getAttribute("href"), href);
      await link.click();
      await page.waitForURL(base + href);
      await page.waitForFunction(() => scrollY === 0);
      await page.locator("main h1").waitFor();
      assert.equal(await page.locator("#mobile-menu").count(), 0);
      assert.notEqual(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
      if (width >= 1280)
        assert.equal(
          await nav
            .getByRole("link", { name: label, exact: true })
            .getAttribute("aria-current"),
          "page",
        );
      else {
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
        const menu = page.getByRole("navigation", {
          name: "Mobile navigation",
          exact: true,
        });
        assert.equal(
          await menu
            .getByRole("link", { name: label, exact: true })
            .getAttribute("aria-current"),
          "page",
        );
        await page.keyboard.press("Escape");
        assert.equal(
          await page
            .getByRole("button", { name: "Open navigation", exact: true })
            .evaluate((el) => el === document.activeElement),
          true,
        );
      }
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    // A cached destination must still start at the top, including same-page selection.
    if (width < 1280)
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
    const visibleNav = page.getByRole("navigation", {
      name: width < 1280 ? "Mobile navigation" : "Main navigation",
      exact: true,
    });
    await visibleNav
      .getByRole("link", { name: "Contact", exact: true })
      .click();
    await page.waitForFunction(() => scrollY === 0);
    if (width >= 1280) {
      const brand = await page.locator(".site-header .brand").boundingBox();
      assert(
        Math.abs(brand.x + brand.width / 2 - width / 2) < 1,
        "Desktop logo is centered",
      );
      const links = await page.locator(".desktop-nav a").all();
      for (const link of links) {
        const box = await link.boundingBox();
        assert(
          box.x + box.width <= brand.x || box.x >= brand.x + brand.width,
          "Links must not overlap logo",
        );
      }
    }
    if (width === 375) {
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await capture(page, "mobile-menu-375", false);
      await page.keyboard.press("Escape");
    }
    // Footer navigation uses the same page URLs, not homepage anchors.
    for (const [label, href] of routes)
      assert.equal(
        await page
          .getByRole("navigation", { name: "Footer navigation" })
          .getByRole("link", { name: label, exact: true })
          .getAttribute("href"),
        href,
      );
    await page
      .getByRole("navigation", { name: "Footer navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await page.waitForURL(base + "/about");
    await page.waitForFunction(() => scrollY === 0);
    assert.deepEqual(errors, []);
    results.push({
      width,
      fixedHeader: true,
      separatePages: true,
      activeLinks: true,
      topOnNavigation: true,
      mobileClosure: true,
      overflow: false,
      browserErrors: errors,
    });
    await page.close();
  }
  const nested = await browser.newPage({
    viewport: { width: 1440, height: 915 },
  });
  await nested.goto(base + "/collections/gowns");
  assert.equal(
    await nested
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Collections", exact: true })
      .getAttribute("aria-current"),
    "page",
  );
  await nested.goto(base + "/appointments");
  assert.equal(
    await nested
      .locator(".desktop-nav .appointment-nav")
      .getAttribute("aria-current"),
    "page",
  );
  await nested.goto(base + "/bespoke#enquiry");
  await nested.waitForFunction(() => window.scrollY > 0);
  await nested.close();
  fs.writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        viewports: results,
        nestedCollectionActive: true,
        appointmentActive: true,
        contextualDeepLinks: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed seven-width page navigation, fixed offsets, active links, mobile closure/Escape, top resets, centered logo, footer routes and contextual deep links.",
  );
} finally {
  await browser.close();
}
