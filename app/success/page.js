import Link from "next/link";

export const metadata = { title: "Order confirmed" };

export default function Success() {
  return (
    <main className="center">
      <h1 style={{ fontSize: 48, margin: 0 }}>Thank you!</h1>
      <p style={{ color: "#9a9a95", maxWidth: 420, margin: "0 auto" }}>
        Your order is confirmed. You'll get a receipt by email from Stripe, and we'll get it
        packed and on its way soon.
      </p>
      <p><Link href="/">← Back to the store</Link></p>
    </main>
  );
}
