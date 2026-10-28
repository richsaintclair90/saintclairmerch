import { PRODUCTS, BUNDLES, SIZES, productById, bundleById } from "./products.js";

// Validates a cart sent from the browser and returns trusted priced lines.
// Throws Error with a readable message if anything is invalid.
export function priceCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0) throw new Error("Cart is empty");
  if (cart.length > 30) throw new Error("Cart is too large");

  const lines = cart.map((item) => {
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) throw new Error("Invalid quantity");
    const selections = Array.isArray(item.selections) ? item.selections : [];

    if (item.kind === "product") {
      const product = productById(item.id);
      if (!product) throw new Error("Unknown product");
      const sel = selections[0] || {};
      const size = checkSize(product, sel.size);
      return {
        name: product.name + (size ? ` (${size})` : ""),
        description: size ? `Size ${size}` : undefined,
        unitAmount: product.price,
        qty,
      };
    }

    if (item.kind === "bundle") {
      const bundle = bundleById(item.id);
      if (!bundle) throw new Error("Unknown bundle");
      if (selections.length !== bundle.slots.length) throw new Error("Incomplete bundle");
      const parts = bundle.slots.map((slot, i) => {
        const sel = selections[i] || {};
        const product = productById(sel.productId);
        if (!product) throw new Error("Unknown product in bundle");
        if (slot.productId && slot.productId !== product.id) throw new Error("Invalid bundle contents");
        if (slot.kind && slot.kind !== product.type) throw new Error("Invalid bundle contents");
        const size = checkSize(product, sel.size);
        return size ? `${product.name} (${size})` : product.name;
      });
      return {
        name: bundle.name,
        description: parts.join(", ").slice(0, 400),
        unitAmount: bundle.price,
        qty,
      };
    }

    throw new Error("Invalid cart item");
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.qty, 0);
  return { lines, subtotal };
}

function checkSize(product, size) {
  if (product.type !== "tee") return null;
  if (!SIZES.includes(size)) throw new Error(`Please choose a size for ${product.name}`);
  return size;
}
