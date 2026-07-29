import { createGraphQLError } from "graphql-yoga";
import * as catalogue from "../../store/catalogue";
import { NotFoundError } from "../../store/errors";

/**
 * The boundary between domain errors and the wire. The store throws plain
 * errors; anything not translated here would be masked by Yoga as
 * "Unexpected error", which is correct for a leaked stack trace and unhelpful
 * for a client that could have handled it.
 */
function translateErrors<T>(run: () => T): T {
  try {
    return run();
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw createGraphQLError(error.message, { extensions: { code: "NOT_FOUND" } });
    }
    throw error;
  }
}

// The mutation returns the updated Product rather than a bare `{ ok: true }`.
// That is what lets the client's normalized cache repair itself from the
// response and skip a follow-up refetch — the single most useful convention in
// GraphQL mutation design.
export const Mutation = {
  toggleFavorite: (_: unknown, { productId }: { productId: string }) =>
    translateErrors(() => catalogue.toggleFavorite(productId)),
};
