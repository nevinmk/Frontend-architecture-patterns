import type { YogaInitialContext } from "graphql-yoga";
import type { User } from "../../data";
import * as catalogue from "../store/catalogue";
import { countingStore, createCounter, type Store, type StoreCounter } from "../store/instrumented";
import { createUserLoader, type UserLoader } from "./loaders";

/**
 * The third resolver argument. Built once per request and handed to every
 * resolver in that request, which makes it the right home for anything that is
 * per-request rather than per-field: who is asking, a request id for logs, and
 * the loaders that batch this request's store calls.
 *
 * Per-request is not a detail. A loader shared between requests would serve one
 * user data batched for another, and cache it — the classic way a "performance
 * fix" turns into a data leak.
 */
export type GraphQLContext = {
  requestId: string;
  /** Resolved from a header. Real apps verify a token here instead. */
  viewer: User | null;
  /** Header switch, so the same query can be run both ways — see the README. */
  batch: boolean;
  store: Store;
  counter: StoreCounter;
  loaders: { user: UserLoader };
};

let requests = 0;

export function createContext({ request }: YogaInitialContext): GraphQLContext {
  const counter = createCounter();
  const store = countingStore(counter);
  const viewerId = request.headers.get("x-viewer-id");

  return {
    requestId: `req-${++requests}`,
    viewer: viewerId ? (catalogue.findUser(viewerId) ?? null) : null,
    batch: request.headers.get("x-batch") === "on",
    store,
    counter,
    loaders: { user: createUserLoader(store) },
  };
}
