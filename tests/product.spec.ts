import { expect, test, type Page } from "@playwright/test";

async function waitForHydrated(page: Page) {
  // The stage is a button only after React attaches its handlers; the arrows exist on every width.
  await page.waitForFunction(() => {
    const button = document.querySelector(".arrow-next");
    return !!button && Object.keys(button).some((key) => key.startsWith("__reactProps"));
  });
}

async function open(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await waitForHydrated(page);
}

const increase = (page: Page) => page.getByRole("button", { name: "Increase quantity" });
const decrease = (page: Page) => page.getByRole("button", { name: "Decrease quantity" });
const addToCart = (page: Page) => page.getByRole("button", { name: "Add to cart" });
const cartButton = (page: Page) => page.getByRole("button", { name: /^Cart/ });

test("thumbnails switch the large product image", async ({ page }) => {
  await open(page);
  const stage = page.locator(".gallery .stage img");
  await expect(stage).toHaveAttribute("src", /image-product-1\.jpg/);
  const thumbs = page.getByRole("list", { name: "Product image thumbnails" }).getByRole("button");
  await thumbs.nth(2).click();
  await expect(stage).toHaveAttribute("src", /image-product-3\.jpg/);
  await expect(thumbs.nth(2)).toHaveAttribute("aria-pressed", "true");
  await expect(thumbs.nth(0)).toHaveAttribute("aria-pressed", "false");
});

test("the large image opens a lightbox gallery that keeps its own image and returns focus", async ({ page }) => {
  await open(page);
  const stageButton = page.getByRole("button", { name: /Open the gallery/ });
  await stageButton.click();
  const lightbox = page.getByRole("dialog", { name: "Product image gallery" });
  await expect(lightbox).toBeVisible();
  const lightboxImage = lightbox.locator(".stage img");
  await expect(lightboxImage).toHaveAttribute("src", /image-product-1\.jpg/);
  await lightbox.getByRole("button", { name: "Next image" }).click();
  await expect(lightboxImage).toHaveAttribute("src", /image-product-2\.jpg/);
  await lightbox.getByRole("button", { name: "Previous image" }).click();
  await lightbox.getByRole("button", { name: "Previous image" }).click();
  await expect(lightboxImage).toHaveAttribute("src", /image-product-4\.jpg/);
  await lightbox.getByRole("button", { name: "Show image 3 of 4" }).click();
  await expect(lightboxImage).toHaveAttribute("src", /image-product-3\.jpg/);
  // The page's own gallery doesn't change behind the lightbox.
  await expect(page.locator(".gallery .stage img")).toHaveAttribute("src", /image-product-1\.jpg/);
  // The dialog is centred in the viewport.
  const box = (await lightbox.boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThanOrEqual(2);
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
  await expect(stageButton).toBeFocused();
  await stageButton.click();
  await lightbox.getByRole("button", { name: "Close gallery" }).click();
  await expect(lightbox).toBeHidden();
});

test("on a phone the arrows change the image and the stage does not open a lightbox", async ({ page }) => {
  await open(page, 375);
  const stage = page.locator(".gallery .stage img");
  await page.getByRole("button", { name: "Next image" }).click();
  await expect(stage).toHaveAttribute("src", /image-product-2\.jpg/);
  await page.getByRole("button", { name: "Previous image" }).click();
  await page.getByRole("button", { name: "Previous image" }).click();
  await expect(stage).toHaveAttribute("src", /image-product-4\.jpg/);
  await expect(page.getByRole("button", { name: /Open the gallery/ })).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Product image thumbnails" })).toBeHidden();
});

test("adds items to the cart, shows the total, and removes them", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => { if (request.method() !== "GET") writes.push(request.url()); });
  await open(page);
  await cartButton(page).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await cartButton(page).click();

  await addToCart(page).click();
  await expect(page.getByRole("status").filter({ hasText: "Choose how many pairs first" })).toBeVisible();
  await expect(addToCart(page)).toBeFocused();

  await decrease(page).click();
  await expect(page.getByText("The quantity is already 0.")).toBeVisible();
  for (let i = 0; i < 3; i++) await increase(page).click();
  await expect(page.locator(".quantity-value")).toHaveText("Quantity 3");
  await addToCart(page).click();
  await expect(page.getByText("Added 3 pairs to your cart.")).toBeVisible();
  await expect(page.locator(".quantity-value")).toHaveText("Quantity 0");
  await expect(cartButton(page)).toHaveAccessibleName("Cart, 3 pairs");
  await expect(page.locator(".cart-badge")).toHaveText("3");

  await cartButton(page).click();
  const cart = page.locator("#cart-panel");
  await expect(cart.getByText("Fall Limited Edition Sneakers", { exact: true })).toBeVisible();
  await expect(cart.getByText("$125.00 x 3 $375.00")).toBeVisible();
  await cart.getByRole("button", { name: "Checkout" }).click();
  await expect(cart.getByRole("status")).toHaveText(/nothing is ordered or charged/);

  await cart.getByRole("button", { name: "Remove Fall Limited Edition Sneakers from the cart" }).click();
  await expect(cart.getByText("Your cart is empty.")).toBeVisible();
  await expect(cart.getByRole("heading", { name: "Cart" })).toBeFocused();
  await expect(cartButton(page)).toHaveAccessibleName("Cart, empty");
  await expect(page.locator(".cart-badge")).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(cart).toBeHidden();
  await expect(cartButton(page)).toBeFocused();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(writes).toEqual([]);
});

test("adding again accumulates and the limits are explained, not silent", async ({ page }) => {
  await open(page);
  for (let i = 0; i < 2; i++) await increase(page).click();
  await addToCart(page).click();
  await increase(page).click();
  await addToCart(page).click();
  await expect(cartButton(page)).toHaveAccessibleName("Cart, 3 pairs");
  for (let i = 0; i < 11; i++) await increase(page).click();
  await expect(page.locator(".quantity-value")).toHaveText("Quantity 10");
  await expect(page.getByText("You can add up to 10 pairs at a time.")).toBeVisible();
});

test("a press outside the cart closes it", async ({ page }) => {
  await open(page);
  await cartButton(page).click();
  await expect(page.locator("#cart-panel")).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.locator("#cart-panel")).toBeHidden();
  await expect(cartButton(page)).toHaveAttribute("aria-expanded", "false");
});

test("the phone menu opens as a drawer and closes with its button or Escape", async ({ page }) => {
  await open(page, 375);
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.click();
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await expect(drawer).toBeVisible();
  for (const link of ["Collections", "Men", "Women", "About", "Contact"]) await expect(drawer.getByRole("link", { name: link, exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menuButton).toBeFocused();
  await menuButton.click();
  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();
});
