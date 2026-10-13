import { ProductPage } from "./product-detail";
import { challengeUrl } from "./site";

export default function Home() {
  return (
    <div className="page-shell">
      <ProductPage />
      <footer className="site-footer">
        <p>Practice demo. The cart stays on this page, and nothing is ordered or charged.</p>
        <p>
          Challenge by <a href={challengeUrl}>Frontend Mentor</a>. Built by <a href="https://royeradames.com">Royer Adames</a>.
        </p>
      </footer>
    </div>
  );
}
