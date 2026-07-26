// Standalone entry: lets Team B develop this widget in isolation.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CartWidget from "./CartWidget";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <h1>Cart remote (standalone dev mode)</h1>
    <CartWidget />
  </StrictMode>,
);
