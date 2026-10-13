import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatPrice, product } from "./site";

export const alt = "E-commerce Product Page: Fall Limited Edition Sneakers, $125.00, 50% off";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/image-product-1.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 64, background: "#ffffff" }}>
        <img src={src} alt="" width={460} height={460} style={{ borderRadius: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, color: "#a84e00", textTransform: "uppercase" }}>{product.company}</div>
          <div style={{ marginTop: 20, fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: "#1d2026" }}>{product.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 36 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#1d2026" }}>{formatPrice(product.priceCents)}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#a84e00", background: "#ffede0", padding: "2px 12px", borderRadius: 8 }}>{product.discount}</div>
          </div>
          <div style={{ marginTop: 40, fontSize: 28, color: "#69707d" }}>A Frontend Mentor challenge</div>
        </div>
      </div>
    ),
    size,
  );
}
