// Seed constants only — frozen inputs, never mutated. The server's store layer
// copies these at boot and owns every change made after that.

export type { Product, Review, Spec, User } from "./types";
export { PRODUCTS } from "./products";
export { REVIEWS } from "./reviews";
export { USERS } from "./users";
