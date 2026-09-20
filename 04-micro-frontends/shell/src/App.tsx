import { Suspense, lazy } from "react";
import { loadWidget } from "./remotes";

// Loaded over the network from whatever URL remotes.json lists for each team.
// The shell has no copy of this code — check the Network tab.
const ProductsWidget = lazy(() => loadWidget("products/ProductsWidget"));
const CartWidget = lazy(() => loadWidget("cart/CartWidget"));

export function App() {
  return (
    <main>
      <h1>Shell (container app)</h1>
      <p>
        The shell owns layout and mount points only. Each box below is an
        independently deployed micro-frontend, fetched at runtime via Module
        Federation.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ border: "2px solid steelblue", padding: "1rem", flex: 1 }}>
          <Suspense fallback={<p>Loading products…</p>}>
            <ProductsWidget />
          </Suspense>
        </div>
        <div style={{ border: "2px solid seagreen", padding: "1rem", flex: 1 }}>
          <Suspense fallback={<p>Loading cart…</p>}>
            <CartWidget />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
