import Stripe from "stripe";
import { NextResponse } from "next/server";
import { priceCart } from "../../../lib/pricing.js";
import { STORE } from "../../../lib/products.js";

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Payments aren't switched on yet. Add STRIPE_SECRET_KEY to enable checkout.
    return NextResponse.json({ error: "Checkout is opening soon. Check back shortly!" }, { status: 503 });
  }

  let priced;
  try {
    const { cart } = await request.json();
    priced = priceCart(cart);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Invalid cart" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: priced.lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: STORE.currency,
          unit_amount: l.unitAmount,
          product_data: { name: l.name, ...(l.description ? { description: l.description } : {}) },
        },
      })),
      shipping_address_collection: {
        allowed_countries: [...STORE.ukCountries, ...STORE.intlCountries],
      },
      shipping_options: [
        { shipping_rate_data: { type: "fixed_amount", display_name: STORE.shipping.uk.label,
            fixed_amount: { amount: STORE.shipping.uk.amount, currency: STORE.currency } } },
        { shipping_rate_data: { type: "fixed_amount", display_name: STORE.shipping.intl.label,
            fixed_amount: { amount: STORE.shipping.intl.amount, currency: STORE.currency } } },
      ],
      phone_number_collection: { enabled: true },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error", e);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
