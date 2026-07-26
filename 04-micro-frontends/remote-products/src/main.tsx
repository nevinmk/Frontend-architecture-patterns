// Standalone entry: lets Team A develop this widget in isolation.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProductsWidget from "./ProductsWidget";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <h1>Products remote (standalone dev mode)</h1>
    <ProductsWidget />
  </StrictMode>,
);
