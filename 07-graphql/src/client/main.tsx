import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import { App } from "./App";
import "./styles.css";

// One provider at the root is the entire wiring. Every component below can ask
// for data by writing a query — nothing drilled through props, no fetch layer.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
