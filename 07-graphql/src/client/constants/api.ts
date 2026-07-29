// The client talks to the API across origins rather than through a Vite proxy,
// keeping the two halves of the architecture visibly separate — exactly how
// they would be deployed.

export const API_ORIGIN = "http://localhost:3071";

export const GRAPHQL_URL = `${API_ORIGIN}/graphql`;
