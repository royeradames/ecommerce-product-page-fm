import { expect, test, type Page } from "@playwright/test";

const siteName = "E-commerce Product Page";
const siteUrl = "https://ecommerce-product-page-fm.royeradames.com/";

async function smallText(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("script,style,noscript,.sr-only")) continue;
      if (parent.getClientRects().length === 0) continue;
      if (parseFloat(getComputedStyle(parent).fontSize) < 16) out.push(node.textContent.trim());
    }
    return out;
  });
}

const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;

test("declares one site name in og:site_name and WebSite JSON-LD, with canonical, Open Graph image and icons", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Fall Limited Edition Sneakers | E-commerce Product Page");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", siteName);
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/ecommerce-product-page-fm\.royeradames\.com\/?$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /E-commerce Product Page/);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  for (const path of ["/icon.svg", "/icon-96.png", "/apple-touch-icon.png", "/opengraph-image"]) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }
});

test("keeps Frontend Mentor's words", async ({ page }) => {
  await page.goto("/");
  for (const text of ["Collections", "Men", "Women", "About", "Contact", "Sneaker Company", "$125.00", "$250.00", "Add to cart"]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeAttached();
  }
  await expect(page.locator(".discount")).toHaveText("50% off");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fall Limited Edition Sneakers");
  await expect(page.locator(".description")).toHaveText(
    "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they’ll withstand everything the weather can offer.",
  );
});

test("desktop frame matches the 1440 design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const header = await box(page, ".header-inner");
  expect(header.x).toBeCloseTo(165, 0);
  expect(header.width).toBeCloseTo(1110, 0);
  expect(header.height).toBeCloseTo(112, 0);
  const stage = await box(page, ".gallery .stage");
  expect(Math.abs(stage.x - 213)).toBeLessThanOrEqual(2);
  expect(Math.abs(stage.y - 203)).toBeLessThanOrEqual(3);
  expect(stage.width).toBeCloseTo(445, 0);
  const thumb = await box(page, ".gallery .thumb");
  expect(Math.abs(thumb.width - 88)).toBeLessThanOrEqual(1);
  expect(Math.abs(thumb.y - 680)).toBeLessThanOrEqual(3);
  const h1 = await box(page, "h1");
  expect(Math.abs(h1.x - 783)).toBeLessThanOrEqual(2);
  await expect(page.locator("h1")).toHaveCSS("font-size", "44px");
  await expect(page.locator("h1")).toHaveCSS("font-weight", "700");
  const add = await box(page, ".add-button");
  expect(Math.abs(add.width - 272)).toBeLessThanOrEqual(2);
  expect(add.height).toBeCloseTo(56, 0);
  const avatar = await box(page, ".avatar");
  expect(Math.abs(avatar.x + avatar.width / 2 - 1250)).toBeLessThanOrEqual(3);
});

test("mobile frame matches the 375 design", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const stage = await box(page, ".gallery .stage");
  expect(stage.y).toBeCloseTo(68, 0);
  expect(stage.width).toBe(375);
  expect(stage.height).toBe(300);
  const add = await box(page, ".add-button");
  expect(add.x).toBe(24);
  expect(add.width).toBe(327);
  await expect(page.locator("h1")).toHaveCSS("font-size", "28px");
});

test("every width from 320 to 1920 px keeps text at 16 px or more, no sideways scroll and one-line buttons", async ({ page }) => {
  test.setTimeout(180_000);
  const widths = [...Array.from({ length: 129 }, (_, i) => 320 + i * 10), 1920];
  await page.goto("/");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(20);
    const state = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth - innerWidth,
      wrapped: [...document.querySelectorAll<HTMLElement>(".primary-button, .desktop-nav a")]
        .filter((el) => {
          if (!el.getClientRects().length) return false;
          // A label wraps when one of its text nodes needs more than one line box.
          const texts = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
          return texts.some((n) => {
            const range = document.createRange();
            range.selectNodeContents(n);
            return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size > 1;
          });
        })
        .map((el) => el.textContent),
      navWraps: (() => {
        const links = [...document.querySelectorAll<HTMLElement>(".desktop-nav a")].filter((el) => el.getClientRects().length);
        return new Set(links.map((el) => Math.round(el.getBoundingClientRect().top))).size > 1;
      })(),
    }));
    expect(state.scroll, `sideways scroll at ${width}`).toBeLessThanOrEqual(0);
    expect(state.wrapped, `wrapped button at ${width}`).toEqual([]);
    expect(state.navWraps, `nav wraps at ${width}`).toBe(false);
    if (width % 80 === 0) expect(await smallText(page), `small text at ${width}`).toEqual([]);
  }
});

test("text colours pass 4.5:1 on their backgrounds", async ({ page }) => {
  await page.goto("/");
  const pairs = await page.evaluate(() => {
    const parse = (c: string) => c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = (el: Element | null): string => {
      while (el) { const c = getComputedStyle(el).backgroundColor; if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c; el = el.parentElement; }
      return "rgb(255, 255, 255)";
    };
    return [".company", ".discount", ".price-was", ".description", ".add-button", ".site-footer p"].map((selector) => {
      const el = document.querySelector(selector)!;
      const [a, b] = [lum(parse(getComputedStyle(el).color)), lum(parse(bg(el)))].sort((x, y) => y - x);
      return { selector, ratio: (a + 0.05) / (b + 0.05) };
    });
  });
  for (const pair of pairs) expect(pair.ratio, pair.selector).toBeGreaterThanOrEqual(4.5);
});
