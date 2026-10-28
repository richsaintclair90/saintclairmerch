# Merch store

Tiny Next.js store: 3 tees, 2 CDs, 3 bundles. Payments, receipts and shipping addresses are handled by Stripe Checkout, so there is no database.

## How it works
- `lib/products.js` is the only file you edit to change products, prices, sizes, shipping and bundles (prices in pence).
- `lib/pricing.js` re-prices the basket on the server, so prices can't be tampered with in the browser.
- `app/api/checkout/route.js` creates the Stripe Checkout session.
- Orders appear in your Stripe Dashboard (Payments), with the shipping address, size choices and phone number.

## Stripe is optional at first
Without `STRIPE_SECRET_KEY` the whole store still works (browse, pick sizes, build bundles, fill the basket). Pressing Checkout just shows "Checkout is opening soon". Add the key later to switch payments on.

## Run locally
```bash
npm install
cp .env.example .env.local   # add your Stripe test key
npm run dev
npm test                     # checks bundle pricing
```

## Deploy
1. Push this folder to a new GitHub repo.
2. In Vercel: Add New → Project → import the repo (Next.js is detected automatically).
3. Add environment variable `STRIPE_SECRET_KEY` (use `sk_test_...` first).
4. Deploy, then place a test order with card `4242 4242 4242 4242`.
5. Swap in your live key `sk_live_...` when ready and redeploy.

## Before launch checklist
- Replace `ARTIST NAME` and the product names/descriptions in `lib/products.js`.
- Drop product photos into `public/products/` and update each `image` path.
- Set real prices and shipping rates.
- Turn on receipt emails in Stripe (Settings → Customer emails).
- Add your own domain in Vercel → Domains.

## Stock
There is no stock tracking. If a size sells out, remove it from `SIZES` or hide the product and redeploy.
