import { useQuery } from "@apollo/client/react";
import { CodePane } from "./components/CodePane";
import { ProductCard } from "./components/ProductCard";
import { API_ORIGIN } from "./constants/api";
import { CATALOG } from "./graphql/queries";
import type { CatalogProduct } from "./types";

type CatalogData = { products: CatalogProduct[] };

export function App() {
  // The whole data layer of this screen. No fetch, no useEffect, no loading
  // reducer, no URL — a query, and the cache behind it.
  const { data, loading, error } = useQuery<CatalogData>(CATALOG.document);

  const reviewCount = data?.products.reduce((n, p) => n + p.reviews.length, 0) ?? 0;

  return (
    <div className="wrap">
      <h1>GraphQL data layer</h1>
      <p className="lede">
        One endpoint, one schema, one round-trip. The query on the left is the
        shape of the page below it: <code>price</code> and{" "}
        <code>averageRating</code> are computed on the server and exist in no
        table, and <code>author</code> is a resolved relationship, not a foreign
        key. The client never learns how any of it is stored — or that three
        different collections were involved.
      </p>

      <div className="panel split">
        <div>
          <CodePane title="Sent" code={CATALOG.source} />
        </div>
        <div>
          <h3>Received</h3>
          {loading && <p className="muted">Loading…</p>}
          {error && <p className="err">{error.message}</p>}
          {data && (
            <p>
              <b>{data.products.length}</b> products, <b>{reviewCount}</b> reviews
              and every reviewer's profile — three levels deep, out of a single
              HTTP request.
            </p>
          )}
          <p className="muted">
            <small>
              Tap a ☆ to run the <code>ToggleFavorite</code> mutation. It selects
              only <code>id</code> and <code>favorite</code>, yet the card
              re-renders correctly: Apollo normalises the response into{" "}
              <code>Product:p1</code> and every view reading that entity follows.
            </small>
          </p>
        </div>
      </div>

      <div className="cards">
        {data?.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p>
        <small>
          Explore the schema yourself in GraphiQL at{" "}
          <a href={`${API_ORIGIN}/graphql`} target="_blank" rel="noopener">
            {API_ORIGIN}/graphql
          </a>{" "}
          — press Ctrl+Space for autocomplete driven entirely by the schema, with
          no client-side config.
        </small>
      </p>
    </div>
  );
}
