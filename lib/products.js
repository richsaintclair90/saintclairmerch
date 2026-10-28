// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE to change products, prices and bundles.
// All prices are in PENCE (2500 = £25.00).
// Prices are enforced on the server, so nobody can tamper with them in the browser.
// ─────────────────────────────────────────────────────────────

export const STORE = {
  name: "ARTIST NAME",            // <- your artist name
  tagline: "Official merch",
  currency: "gbp",
  // Shipping, charged once per order
  shipping: {
    uk: { label: "UK delivery", amount: 399 },
    intl: { label: "International delivery", amount: 999 },
  },
  ukCountries: ["GB"],
  intlCountries: ["US", "CA", "IE", "FR", "DE", "NL", "ES", "IT", "AU", "SE", "NO", "DK"],
};

export const SIZES = ["S", "M", "L", "XL", "XXL"];

export const PRODUCTS = [
  { id: "tee-1", type: "tee", name: "Tee One", price: 2500, image: "/products/placeholder.svg",
    description: "Heavyweight cotton tee. Design one." },
  { id: "tee-2", type: "tee", name: "Tee Two", price: 2500, image: "/products/placeholder.svg",
    description: "Heavyweight cotton tee. Design two." },
  { id: "tee-3", type: "tee", name: "Tee Three", price: 2500, image: "/products/placeholder.svg",
    description: "Heavyweight cotton tee. Design three." },
  { id: "cd-1", type: "cd", name: "CD One", price: 1000, image: "/products/placeholder.svg",
    description: "Physical CD. Album / EP title here." },
  { id: "cd-2", type: "cd", name: "CD Two", price: 1000, image: "/products/placeholder.svg",
    description: "Physical CD. Album / EP title here." },
];

// A slot is either fixed ({ productId }) or a free choice of any tee ({ kind: "tee" }).
export const BUNDLES = [
  {
    id: "bogof",
    name: "Buy one tee, get one free",
    price: 2500, // price of one tee
    image: "/products/placeholder.svg",
    description: "Pick any two tees. Second one's on us.",
    slots: [{ kind: "tee" }, { kind: "tee" }],
  },
  {
    id: "ultimate",
    name: "Ultimate merch bundle",
    price: 7000, // normal total would be 7500 + 2000 = 9500
    image: "/products/placeholder.svg",
    description: "All 3 tees and both CDs.",
    slots: [
      { productId: "tee-1" }, { productId: "tee-2" }, { productId: "tee-3" },
      { productId: "cd-1" }, { productId: "cd-2" },
    ],
  },
  {
    id: "cd-pair",
    name: "Double CD bundle",
    price: 1800, // normal total would be 2000
    image: "/products/placeholder.svg",
    description: "Both CDs for less.",
    slots: [{ productId: "cd-1" }, { productId: "cd-2" }],
  },
];

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const bundleById = (id) => BUNDLES.find((b) => b.id === id);
export const money = (pence) => `£${(pence / 100).toFixed(2)}`;
