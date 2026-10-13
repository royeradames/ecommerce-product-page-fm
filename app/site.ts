export const siteName = "E-commerce Product Page";
export const siteUrl = "https://ecommerce-product-page-fm.royeradames.com/";
export const challengeUrl = "https://www.frontendmentor.io/challenges/ecommerce-product-page-UPsZ9MJp6";

export const product = {
  company: "Sneaker Company",
  name: "Fall Limited Edition Sneakers",
  description:
    "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they’ll withstand everything the weather can offer.",
  priceCents: 12500,
  discount: "50%",
  originalPriceCents: 25000,
  images: [
    { full: "/images/image-product-1.jpg", thumb: "/images/image-product-1-thumbnail.jpg", alt: "White and tan sneakers, one standing on its heel, on an orange and sand background" },
    { full: "/images/image-product-2.jpg", thumb: "/images/image-product-2-thumbnail.jpg", alt: "A pair of the sneakers resting on smooth stones beside dry twigs" },
    { full: "/images/image-product-3.jpg", thumb: "/images/image-product-3-thumbnail.jpg", alt: "One sneaker balanced on two stones in front of a curved orange backdrop" },
    { full: "/images/image-product-4.jpg", thumb: "/images/image-product-4-thumbnail.jpg", alt: "Side view of one sneaker on a stack of stones against orange" },
  ],
} as const;

/** Formats whole cents as US dollars, for example 12500 → "$125.00". */
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
