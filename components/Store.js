"use client";

import { useEffect, useMemo, useState } from "react";

const money = (pence) => `£${(pence / 100).toFixed(2)}`;

export default function Store({ store, products, bundles, sizes }) {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const tees = products.filter((p) => p.type === "tee");

  // cart persistence
  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setLoaded(true);
    if (new URLSearchParams(location.search).get("cancelled")) setOpen(true);
  }, []);
  useEffect(() => {
    if (loaded) try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
  }, [cart, loaded]);

  const unitPrice = (item) =>
    item.kind === "product" ? byId[item.id].price : bundles.find((b) => b.id === item.id).price;
  const subtotal = cart.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  function add(item) {
    const key = JSON.stringify([item.kind, item.id, item.selections]);
    setCart((c) => {
      const existing = c.find((x) => x.key === key);
      if (existing) return c.map((x) => (x.key === key ? { ...x, qty: Math.min(10, x.qty + 1) } : x));
      return [...c, { ...item, key, qty: 1 }];
    });
    setOpen(true);
  }
  const setQty = (key, qty) =>
    setCart((c) => (qty < 1 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty: Math.min(10, qty) } : x))));

  async function checkout() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart.map(({ kind, id, selections, qty }) => ({ kind, id, selections, qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      location.href = data.url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <header className="top">
        <div className="wrap">
          <span className="brand">{store.name}</span>
          <button className="cart-btn" onClick={() => setOpen(true)}>Basket ({count})</button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>{store.name}<br />Merch</h1>
          <p>{store.tagline}</p>
        </section>

        <h2 className="section">Bundles</h2>
        <div className="grid">
          {bundles.map((b) => (
            <BundleCard key={b.id} bundle={b} byId={byId} tees={tees} sizes={sizes} onAdd={add} />
          ))}
        </div>

        <h2 className="section">T-shirts</h2>
        <div className="grid">
          {tees.map((p) => <ProductCard key={p.id} product={p} sizes={sizes} onAdd={add} />)}
        </div>

        <h2 className="section">CDs</h2>
        <div className="grid">
          {products.filter((p) => p.type === "cd").map((p) => (
            <ProductCard key={p.id} product={p} sizes={sizes} onAdd={add} />
          ))}
        </div>

        <footer>
          Shipping: {money(store.shipping.uk.amount)} UK · {money(store.shipping.intl.amount)} international.
          Secure payment by Stripe.
        </footer>
      </main>

      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(false)} />
          <aside className="drawer">
            <header>
              <strong>Your basket</strong>
              <button className="link" onClick={() => setOpen(false)}>Close</button>
            </header>
            <div className="items">
              {cart.length === 0 && <p className="small">Your basket is empty.</p>}
              {cart.map((item) => {
                const name = item.kind === "product" ? byId[item.id].name : bundles.find((b) => b.id === item.id).name;
                return (
                  <div className="line" key={item.key}>
                    <div className="t"><span>{name}</span><span>{money(unitPrice(item) * item.qty)}</span></div>
                    {item.selections.map((s, i) => (
                      <small key={i}>{byId[s.productId].name}{s.size ? ` — ${s.size}` : ""}</small>
                    ))}
                    <div className="row">
                      <div className="qty">
                        <button onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                      </div>
                      <span className="spacer" />
                      <button className="link" onClick={() => setQty(item.key, 0)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="foot">
              <div className="total"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <span className="small">Shipping calculated at checkout.</span>
              {error && <span className="error">{error}</span>}
              <button className="btn" disabled={cart.length === 0 || busy} onClick={checkout}>
                {busy ? "Redirecting…" : "Checkout"}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function ProductCard({ product, sizes, onAdd }) {
  const [size, setSize] = useState("");
  const [err, setErr] = useState("");
  const isTee = product.type === "tee";
  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <div className="body">
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        <div className="price">{money(product.price)}</div>
        <div className="spacer" />
        {isTee && (
          <select value={size} onChange={(e) => { setSize(e.target.value); setErr(""); }}>
            <option value="">Select size</option>
            {sizes.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
        {err && <span className="error">{err}</span>}
        <button className="btn" onClick={() => {
          if (isTee && !size) return setErr("Please choose a size");
          onAdd({ kind: "product", id: product.id, selections: [{ productId: product.id, ...(isTee ? { size } : {}) }] });
        }}>Add to basket</button>
      </div>
    </div>
  );
}

function BundleCard({ bundle, byId, tees, sizes, onAdd }) {
  const [sel, setSel] = useState(() => bundle.slots.map((s) => ({ productId: s.productId || "", size: "" })));
  const [err, setErr] = useState("");

  const normal = bundle.slots.reduce((sum, slot, i) => {
    const pid = slot.productId || sel[i].productId;
    return sum + (pid ? byId[pid].price : 0);
  }, 0);
  const update = (i, patch) => { setSel((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x))); setErr(""); };

  function submit() {
    for (const s of sel) {
      if (!s.productId) return setErr("Please pick your items");
      if (byId[s.productId].type === "tee" && !s.size) return setErr("Please choose a size for each tee");
    }
    onAdd({
      kind: "bundle", id: bundle.id,
      selections: sel.map((s) => ({ productId: s.productId, ...(byId[s.productId].type === "tee" ? { size: s.size } : {}) })),
    });
  }

  return (
    <div className="card">
      <img src={bundle.image} alt={bundle.name} />
      <div className="body">
        <h3>{bundle.name}</h3>
        <p className="desc">{bundle.description}</p>
        <div className="price">
          {money(bundle.price)}
          {normal > bundle.price && <s>{money(normal)}</s>}
        </div>
        {bundle.slots.map((slot, i) => {
          const isTee = slot.productId ? byId[slot.productId].type === "tee" : slot.kind === "tee";
          return slot.productId ? (
            <div className="fixed" key={i}>
              <span>{byId[slot.productId].name}</span>
              {isTee ? (
                <select value={sel[i].size} onChange={(e) => update(i, { size: e.target.value })}>
                  <option value="">Size</option>
                  {sizes.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : <span />}
            </div>
          ) : (
            <div key={i}>
              <div className="slot-label">Tee {i + 1}</div>
              <div className="slot">
                <select value={sel[i].productId} onChange={(e) => update(i, { productId: e.target.value })}>
                  <option value="">Choose design</option>
                  {tees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={sel[i].size} onChange={(e) => update(i, { size: e.target.value })}>
                  <option value="">Size</option>
                  {sizes.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          );
        })}
        {err && <span className="error">{err}</span>}
        <button className="btn" onClick={submit}>Add bundle to basket</button>
      </div>
    </div>
  );
}
