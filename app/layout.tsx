import type { Metadata, Viewport } from "next";
import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { siteName, siteUrl } from "./site";

const kumbh = Kumbh_Sans({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kumbh", display: "swap" });

const title = "Fall Limited Edition Sneakers | E-commerce Product Page";
const description =
  "A Frontend Mentor e-commerce product page: browse the sneaker gallery, open the lightbox and try the cart. Practice demo; nothing is ordered.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName, title, description, locale: "en_US" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={kumbh.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
