# E-commerce Product Page

The [Frontend Mentor e-commerce product page](https://www.frontendmentor.io/challenges/ecommerce-product-page-UPsZ9MJp6), built with Next.js 16.3.6, React 19.2.8, TypeScript 5.9.3 and Tailwind 4.2.1 on Node 24.

Live: https://ecommerce-product-page-fm.royeradames.com/

- Pick a thumbnail to change the large image. From 768 px, the large image opens a lightbox gallery with its own arrows and thumbnails; Escape, the close button or a press outside closes it and focus returns.
- On phones the image has previous and next arrows, and the menu opens as a drawer.
- Choose a quantity and add it to the cart. The cart icon shows the count; the cart lists the item, price, quantity and total, and the bin removes it. Pressing "Add to cart" at 0, minus at 0 or plus past 10 explains why nothing changed.
- The cart lives in memory. Nothing is stored, sent, ordered or charged; Checkout says so.
- Layout, words, images and icons follow Frontend Mentor's desktop (1440) and mobile (375) designs in `reference/design/`. Two text colours are darker than the style guide so small text passes 4.5:1 (the orange label and badge, and the old price), the bin and quantity icons are darker so they pass 3:1, and text is at least 16 px.
- The "sneakers" wordmark is set in Kumbh Sans Bold, because the starter's logo file wasn't available for this build.
- `og:site_name` and WebSite JSON-LD name the site "E-commerce Product Page"; a 1200 x 630 Open Graph image is generated at build time.

## Development

```bash
npm ci
npm run lint && npm run typecheck && npm run build
npm test   # Playwright: gallery, lightbox, cart, phone menu, design frames, 320-1920 px sweep
```
