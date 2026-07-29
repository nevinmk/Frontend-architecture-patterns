import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GRAPHQL_URL } from "../constants/api";

// This is the whole client-side data layer. No per-endpoint fetch wrapper, no
// hand-written request/response plumbing, no loading-flag reducer — the cache
// below is the store, and a query is all a component writes to read from it.
export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),

  // InMemoryCache is *normalized*: a result is shredded into entities keyed by
  // `__typename:id` (Product:p1, Review:r4, User:u2) rather than filed under
  // the query that fetched it. Two unrelated queries touching the same product
  // therefore share one record — write it once, both re-render.
  cache: new InMemoryCache(),
});
