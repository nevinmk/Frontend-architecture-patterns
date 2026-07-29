import { define } from "./define";

/**
 * The cheapest possible cache update: return the entity's id and the field that
 * changed. Apollo matches `Product:p1` in the cache, writes `favorite`, and
 * re-renders every component reading it. No update callback, no refetch, and
 * the `Catalog` query above is never sent again.
 */
export const TOGGLE_FAVORITE = define(`mutation ToggleFavorite($productId: ID!) {
  toggleFavorite(productId: $productId) {
    id
    favorite
  }
}`);
