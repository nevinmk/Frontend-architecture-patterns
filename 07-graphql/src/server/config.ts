/** The API listens here; the Vite client sits on 3007 and calls across. */
export const API_PORT = 3071;

export const GRAPHQL_PATH = "/graphql";

/**
 * The client is served from a different origin, so the API has to say so. Yoga
 * applies these itself — there is no hand-rolled OPTIONS handler anywhere.
 */
export const CORS = {
  origin: ["http://localhost:3007"],
  methods: ["GET", "POST", "OPTIONS"],
};
