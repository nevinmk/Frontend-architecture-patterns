import type { GraphQLContext } from "../context";
import type { Product as ProductRecord, Review as ReviewRecord, User as UserRecord } from "../../../data";

// Everything that answers a read lives here: the root entry points and the
// field resolvers that expand the graph from them. Mutations are the only
// resolvers that change state, so they are the only ones kept separate.
//
// Every resolver is called with the same four arguments:
//
//   (parent, args, context, info)
//
//   parent  — what the level above resolved to. `undefined` at the root.
//   args    — the field's arguments from the query document.
//   context — one object per request, shared by every resolver in it.
//   info    — the parsed query and where in it we currently are. Rarely needed.

// Root resolvers are entry points into the graph, nothing more. They fetch a
// node and hand it on; the type resolvers below decide what it costs to expand.
export const Query = {
  // The "1" in "1 + N": one call fetches the list, and then the fields below
  // are left to fetch everything hanging off it.
  products: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => ctx.store.listProducts(),
  product: (parent: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
    console.log("debug: parent ->", parent);
    return ctx.store.findProduct(id) ?? null;
  },
  users: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => ctx.store.listUsers(),
  user: (parent: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
    console.log("debug: parent ->", parent);
    return ctx.store.findUser(id) ?? null;
  },

  // Context-only: no parent above it, no arguments in the query. The answer
  // comes entirely from who the request says it is.
  me: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
    console.log(`[${ctx.requestId}] Query.me  viewer -> ${ctx.viewer?.name ?? "anonymous"}`);
    return ctx.viewer;
  },
};

// Field resolvers run only when a query selects the field. Leave `reviews` out
// of your query and this function is never called — the store is never asked
// for data nobody wanted. That is the whole economics of GraphQL, in one map.
export const Product = {
  price: (product: ProductRecord) => `$${(product.priceCents / 100).toFixed(2)}`,

  /**
   * All three arguments carrying something real at the same time — the example
   * worth reading twice:
   *
   *   parent  → the product this field hangs off, so we know whose reviews
   *   args    → `limit` from the query document
   *   context → the per-request store, and who is asking
   *
   * Note that `parent` is a Product RECORD, not a resolved Product. The parent
   * passed down is whatever the level above returned, before any of its own
   * field resolvers ran — `parent.price` is undefined here, `priceCents` is not.
   */
  reviews: (product: ProductRecord, args: { limit?: number | null }, ctx: GraphQLContext) => {
    console.log(
      `debug : [${ctx.requestId}] Product.reviews` +
        `  parent=${product.id} (${product.name})` +
        `  args=${JSON.stringify(args)}` +
        `  ctx.viewer=${ctx.viewer?.name ?? "anonymous"}`,
    );
    const all = ctx.store.reviewsForProduct(product.id);
    return args.limit == null ? all : all.slice(0, args.limit);
  },

  reviewCount: (product: ProductRecord, _args: unknown, ctx: GraphQLContext) =>
    ctx.store.reviewsForProduct(product.id).length,
  averageRating: (product: ProductRecord, _args: unknown, ctx: GraphQLContext) =>
    ctx.store.averageRating(product.id),
};

// `authorId` and `productId` are storage details. The graph exposes the edges
// instead, so a client asks for `author { name }` and never learns that a join
// happened — or that it was a foreign key in the first place.
export const Review = {
  /**
   * Where N+1 is born, and where it is fixed.
   *
   * This resolver runs once per review. Ask for every product's reviews with
   * their authors and the store is hit once for the products, once per product
   * for its reviews, then once per REVIEW for the author — dozens of lookups
   * for a handful of distinct users, most of them asking for a user already
   * fetched a microsecond earlier.
   *
   * Nothing in the query is wrong. Nothing in this resolver is wrong either:
   * it cannot see its siblings, so it cannot know it is one of thirteen. The
   * fix has to live somewhere that CAN see them — the loader on the context,
   * which collects the ids of the whole level and asks the store once.
   *
   * Send `x-batch: on` to take the second path and watch the hit count drop.
   */
  author: (review: ReviewRecord, _args: unknown, ctx: GraphQLContext) =>
    ctx.batch ? ctx.loaders.user.load(review.authorId) : ctx.store.findUser(review.authorId),

  product: (review: ReviewRecord, _args: unknown, ctx: GraphQLContext) =>
    ctx.store.findProduct(review.productId),
};

// The graph is walkable in both directions: product → reviews → author, or
// user → reviews → product. Same schema, no extra endpoints.
export const User = {
  reviews: (user: UserRecord, _args: unknown, ctx: GraphQLContext) =>
    ctx.store.reviewsByAuthor(user.id),
};
