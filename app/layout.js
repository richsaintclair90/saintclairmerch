import "./globals.css";
import { STORE } from "../lib/products.js";

export const metadata = {
  title: `${STORE.name} — Merch`,
  description: `${STORE.tagline}. T-shirts, CDs and bundles.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
