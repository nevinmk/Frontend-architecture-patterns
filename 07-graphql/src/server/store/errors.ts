/**
 * The store raises plain domain errors and stays ignorant of GraphQL. The
 * resolver layer translates them into a GraphQL error the client can read —
 * without that translation Yoga masks every non-GraphQL error as "Unexpected
 * error", which is the right default in production and useless in a form.
 */
export class NotFoundError extends Error {}
