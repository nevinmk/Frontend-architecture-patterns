import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { bootRemotes } from "./remotes";

// Remotes must be registered before any widget lazy-loads.
await bootRemotes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
