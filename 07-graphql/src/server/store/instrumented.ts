import * as catalogue from "./catalogue";

// The N+1 problem is invisible when the store is a local array — every lookup
// costs nothing, so nothing hurts. This wrapper makes each store call leave a
// trace, which is the only reason the problem is teachable in a demo without a
// real database and a real query log behind it.
//
// A counter is created per request, so what it reports is "how many times did
// resolving THIS query hit the store", not a global total.

export type StoreCounter = { hits: number; calls: string[] };

export const createCounter = (): StoreCounter => ({ hits: 0, calls: [] });

export function countingStore(counter: StoreCounter) {
  const track = <T>(label: string, run: () => T): T => {
    counter.hits += 1;
    counter.calls.push(label);
    return run();
  };

  return {
    listProducts: () => track("listProducts", catalogue.listProducts),
    findProduct: (id: string) => track(`findProduct(${id})`, () => catalogue.findProduct(id)),

    listUsers: () => track("listUsers", catalogue.listUsers),
    findUser: (id: string) => track(`findUser(${id})`, () => catalogue.findUser(id)),
    // Counts as ONE hit no matter how many ids it is given — that is the whole
    // point of the batch, and the number the scoreboard is meant to reward.
    findUsersByIds: (ids: readonly string[]) =>
      track(`findUsersByIds([${ids.join(", ")}])`, () => catalogue.findUsersByIds(ids)),

    reviewsForProduct: (productId: string) =>
      track(`reviewsForProduct(${productId})`, () => catalogue.reviewsForProduct(productId)),
    reviewsByAuthor: (authorId: string) =>
      track(`reviewsByAuthor(${authorId})`, () => catalogue.reviewsByAuthor(authorId)),
    averageRating: (productId: string) =>
      track(`averageRating(${productId})`, () => catalogue.averageRating(productId)),
  };
}

export type Store = ReturnType<typeof countingStore>;
