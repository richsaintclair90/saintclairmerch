import assert from "node:assert/strict";
import { priceCart } from "../lib/pricing.js";

const tee = (id, size = "M") => ({ productId: id, size });

// single tee
let r = priceCart([{ kind: "product", id: "tee-1", selections: [tee("tee-1")], qty: 2 }]);
assert.equal(r.subtotal, 5000);

// tee without size rejected
assert.throws(() => priceCart([{ kind: "product", id: "tee-1", selections: [{ productId: "tee-1" }], qty: 1 }]));

// BOGOF = price of one tee
r = priceCart([{ kind: "bundle", id: "bogof", selections: [tee("tee-1", "L"), tee("tee-3", "S")], qty: 1 }]);
assert.equal(r.subtotal, 2500);

// BOGOF rejects a CD in a tee slot
assert.throws(() => priceCart([{ kind: "bundle", id: "bogof", selections: [tee("tee-1"), { productId: "cd-1" }], qty: 1 }]));

// Ultimate bundle
r = priceCart([{ kind: "bundle", id: "ultimate", selections: [tee("tee-1"), tee("tee-2"), tee("tee-3"), { productId: "cd-1" }, { productId: "cd-2" }], qty: 1 }]);
assert.equal(r.subtotal, 7000);

// Ultimate bundle with wrong contents rejected
assert.throws(() => priceCart([{ kind: "bundle", id: "ultimate", selections: [tee("tee-1"), tee("tee-1"), tee("tee-3"), { productId: "cd-1" }, { productId: "cd-2" }], qty: 1 }]));

// CD pair
r = priceCart([{ kind: "bundle", id: "cd-pair", selections: [{ productId: "cd-1" }, { productId: "cd-2" }], qty: 1 }]);
assert.equal(r.subtotal, 1800);

// bad inputs
assert.throws(() => priceCart([]));
assert.throws(() => priceCart([{ kind: "product", id: "nope", selections: [], qty: 1 }]));
assert.throws(() => priceCart([{ kind: "product", id: "cd-1", selections: [{ productId: "cd-1" }], qty: -3 }]));

console.log("All pricing tests passed");
