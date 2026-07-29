# 07 — GraphQL Data Layer

The first six architectures answer "**where and when is the HTML produced?**".
This one answers a different question: "**how does the client get its data?**" —
so it is orthogonal to the rest, and could sit underneath the SPA, the SSR app,
or the micro-frontend shell without changing any of them.

REST answers with **resources**. The server decides what a `Product` looks like,
publishes one URL per resource, and the client takes whatever it is given —
then makes more requests for the parts it still needs. GraphQL inverts that:
the server publishes a **typed graph**, and each screen sends a query describing
the exact sub-tree it wants. One endpoint, one round-trip, no field wasted.

```
REST      GET /products ──▶ GET /products/1/reviews ──▶ GET /users/2
                            (URLs unknowable until the previous reply lands)

GraphQL   POST /graphql  ──▶ { products { reviews { author { name } } } }
                            (one request, server walks the graph)
```

## Traits

- **Contract:** a schema, checked at build time and introspectable at runtime.
- **Endpoints:** exactly one, forever. New screens add queries, not routes.
- **Payload:** decided by the client, per query.
- **Caching:** moves from HTTP into a normalized client store keyed by entity id.

## Pros / Cons

| Pros | Cons |
|---|---|
| One round-trip for deeply nested data | HTTP/CDN caching no longer works for free |
| No over-fetching or under-fetching | Naive resolvers cause N+1 queries on the server |
| Schema is a live, typed, self-documenting contract | Depth and complexity limits become a security concern |
| Frontend adds fields without waiting on backend routes | Heavier client library than `fetch` |
| Mutations return entities, so caches self-heal | File uploads and caching need extra convention |

**Use when:** many screens need different slices of the same richly connected
data, several clients (web, mobile, partner) share one backend, or frontend and
backend teams ship on separate cadences.

**Don't bother when:** the app has a handful of screens over flat resources —
REST is less machinery for the same result.

## Demo

Two processes: a **graphql-yoga** API on **:3071** and a **Vite + React + Apollo
Client** app on **:3007**. One page, deliberately small — the point is the
architecture, not the UI.

```sh
npm install
npm run dev          # starts the API (3071) and the client (3007) together
# open http://localhost:3007
```

`npm run dev:api` and `npm run dev:web` run the halves separately.

The page shows the query it sent next to the result it got, then renders the
catalogue. Three things worth watching:

1. **One request, three levels.** Products → their reviews → each reviewer's
   profile, from a single round-trip. `price` and `averageRating` are computed
   server-side and exist in no table; `author` is a resolved edge, not a
   foreign key.
2. **Fields you don't ask for are never resolved.** `description`, `specs`,
   `category` and `priceCents` are all on the `Product` type and none are in the
   query, so their resolvers never run and their bytes are never sent.
3. **The mutation updates views it has never heard of.** Tap a ☆ and
   `ToggleFavorite` selects only `id` and `favorite` — yet the card re-renders,
   because Apollo normalizes the response into `Product:p1` rather than filing
   it under the query that fetched it. No refetch, no update callback.

Open **GraphiQL** at <http://localhost:3071/graphql> and press Ctrl+Space — the
autocomplete is generated from the schema, with nothing configured client-side.
The schema is bigger than the page uses on purpose: `users`, `user`, and
`User.reviews` are there so you can walk the graph the other way
(`user → reviews → product`) without a single new endpoint.

## Layout

Each layer names one job, and the layer below never knows about the layer above:

```
src/
  data/                    seed constants only — no logic, no imports
    types.ts               domain shapes (Product, Review, User)
    products.ts  reviews.ts  users.ts

  server/
    config.ts              port, path, CORS
    store/catalogue.ts     the repository: the only code that knows how data is stored
    store/instrumented.ts  counts store calls per request, so N+1 is a number not a claim
    store/errors.ts        domain errors, so the store never imports GraphQL
    graphql/typeDefs.ts    the schema — the whole contract, in one file
    graphql/context.ts     the third resolver argument, built once per request
    graphql/loaders.ts     a hand-rolled DataLoader — the N+1 fix
    graphql/resolvers/     queries.ts (reads: Query + field resolvers), mutations.ts (writes)
    graphql/schema.ts      typeDefs + resolvers → executable schema
    graphql/yoga.ts        the Yoga instance, plus the plugin that prints the tally
    index.ts               bootstrap: bind the port, hand every request to Yoga

  client/
    constants/api.ts       where the API lives
    graphql/               every document, kept as source text *and* parsed node
    apollo/client.ts       the single ApolloClient
    lib/format.ts          display helpers
    components/            ProductCard, ReviewItem, CodePane
    App.tsx                the one page
```

There is no router on the server: `createServer(yoga)` is the whole HTTP
surface, because one endpoint is all GraphQL ever needs. Adding a screen to the
client adds no server code at all.

Both `data/` and `store/` exist on purpose: `data/` holds frozen seed constants,
and the store copies them at boot so a mutation never writes back into the
seeds — restart the API and the catalogue is pristine again.

Two conventions in `client/graphql/` are worth copying into real projects.
Documents are exported as `{ source, document }` so the page can render the
exact text it sends, which keeps the on-screen explanation from drifting away
from the code. And every document that renders a review spreads the same
`ReviewCard` fragment, so they all fetch an identical field set — that is what
lets a mutation payload update a component whose query it has never seen.

## The four resolver arguments

Every resolver is called the same way:

```ts
(parent, args, context, info) => …
```

| | what it is | when it's empty |
|---|---|---|
| `parent` | what the level above resolved to | `undefined` at the root — nothing is above it |
| `args` | the field's arguments from the query | `{}` when the field takes none |
| `context` | one object per request, shared by every resolver in it | never |
| `info` | the parsed query and the current position in it | never, but rarely needed |

`Product.reviews` is the example where the first three all carry something at
once. Run this with an `x-viewer-id: u3` header:

```graphql
{ me { name } product(id: "p1") { name reviews(limit: 2) { author { name } } } }
```

```
[req-3] Query.me  viewer -> Carys Doyle
[req-3] Product.reviews  parent=p1 (Pocket Espresso)  args={"limit":2}  ctx.viewer=Carys Doyle
```

Two details worth pausing on. `Query.me` takes no arguments and has no parent —
it is answerable *only* from context, which is what context is for. And the
`parent` handed to `Product.reviews` is a product **record**, not a resolved
`Product`: `parent.priceCents` is there, `parent.price` is not, because the
sibling `price` resolver has not run and may never run.

## The N+1 problem

Ask for every product's reviews and each review's author:

```graphql
{ products { name reviews { rating author { name } } } }
```

`Review.author` runs **once per review**. It cannot see its siblings, so it
cannot know it is one of twelve — it asks the store for one user, twelve times,
for five distinct people:

```
[req-1] naive: 19 store calls
  listProducts                 ← the "1"
  reviewsForProduct(p1) … (p6) ← 6
  findUser(u2)  findUser(u4)  findUser(u5)
  findUser(u3)  findUser(u1)  …   ← 12, mostly repeats
```

That is 1 + N, and it compounds one level deeper. Nothing here is written
badly; the fix simply cannot live inside a resolver that only ever sees one
review. It lives on the context, which spans the whole request.

Send the same query with `x-batch: on`:

```
[req-2] batched: 8 store calls
  listProducts
  reviewsForProduct(p1) … (p6)
  findUsersByIds([u2, u4, u5, u3, u1])   ← twelve lookups, deduped, one call
```

**19 → 8, byte-identical responses.** The loader in `graphql/loaders.ts` takes
each id, parks a promise, and defers the real lookup to the end of the tick —
by which time every sibling on that level has queued its id. GraphQL resolves a
level in parallel, which is exactly what makes this work.

Two rules the demo encodes:

- **Loaders are per-request, built in `createContext`.** A loader shared across
  requests would hand one user data batched — and cached — for another.
- **The store has to offer a batch call.** `findUsersByIds` is one pass for many
  ids, the `WHERE id IN (…)` every real database already has. Without it there
  is nothing to batch *into*.

The header switch exists only so the two paths can be compared in one running
server. Real code picks the loader and deletes the naive branch, and reaches for
the `dataloader` package rather than hand-rolling one.

## What this demo doesn't show

- **Depth and cost limits.** A public endpoint needs them — `reviews { product {
  reviews { … } } }` nests forever here.
- **Cache misses on list membership.** A mutation that creates a *new* entity
  would not appear in a cached list, because the cache cannot guess which lists
  it belongs to. That needs `cache.modify` or a refetch. `toggleFavorite`
  sidesteps it entirely by only ever changing a field on an entity the cache
  already holds.
- **Input types and validation.** A mutation taking an `input` object and
  rejecting bad values with a `BAD_USER_INPUT` extension is the other half of
  the mutation story; only the not-found path is wired here.
- **Subscriptions, persisted queries, federation** — all real parts of the
  ecosystem, all out of scope here.
