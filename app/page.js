import Store from "../components/Store.js";
import { STORE, PRODUCTS, BUNDLES, SIZES } from "../lib/products.js";

export default function Home() {
  return <Store store={STORE} products={PRODUCTS} bundles={BUNDLES} sizes={SIZES} />;
}
