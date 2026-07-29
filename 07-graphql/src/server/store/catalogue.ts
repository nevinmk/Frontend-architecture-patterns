import { PRODUCTS, REVIEWS, USERS } from "../../data";
import type { Product, Review, User } from "../../data";
import { NotFoundError } from "./errors";

// The repository layer: the only place that knows how the catalogue is stored.
// Every resolver goes through these functions and none of them knows whether
// the data came from an array, Postgres or another service. Swap this file for
// a real database and nothing above it changes.

// Seed constants are copied once at boot so mutations never write to them.
const products: Product[] = PRODUCTS.map((p) => ({ ...p, specs: p.specs.map((s) => ({ ...s })) }));
const reviews: Review[] = REVIEWS.map((r) => ({ ...r }));
const users: User[] = USERS.map((u) => ({ ...u }));

export const listProducts = (): Product[] => products;
export const findProduct = (id: string): Product | undefined => products.find((p) => p.id === id);

export const listUsers = (): User[] => users;
export const findUser = (id: string): User | undefined => users.find((u) => u.id === id);

/**
 * The batched twin of `findUser`. One call, one pass over the table, N results
 * in the order asked for — the shape every real database already supports as
 * `WHERE id IN (...)`. Nothing can batch on top of a store that only offers
 * single-row lookups, which is why the fix for N+1 starts down here.
 */
export const findUsersByIds = (ids: readonly string[]): (User | undefined)[] => {
  const byId = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => byId.get(id));
};

export const reviewsForProduct = (productId: string): Review[] =>
  reviews.filter((r) => r.productId === productId);
export const reviewsByAuthor = (authorId: string): Review[] =>
  reviews.filter((r) => r.authorId === authorId);

export function averageRating(productId: string): number | null {
  const mine = reviewsForProduct(productId);
  if (mine.length === 0) return null;
  const mean = mine.reduce((sum, r) => sum + r.rating, 0) / mine.length;
  return Math.round(mean * 10) / 10;
}

export function toggleFavorite(productId: string): Product {
  const product = findProduct(productId);
  if (!product) throw new NotFoundError(`No product with id ${productId}`);
  product.favorite = !product.favorite;
  return product;
}
