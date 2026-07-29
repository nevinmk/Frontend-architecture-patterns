import { useMutation } from "@apollo/client/react";
import { TOGGLE_FAVORITE } from "../graphql/mutations";
import { plural } from "../lib/format";
import type { CatalogProduct } from "../types";
import { ReviewItem } from "./ReviewItem";

export function ProductCard({ product }: { product: CatalogProduct }) {
  // The component asks for the mutation it needs and nothing else — no action
  // creator, no dispatch, no lifted state. The response updates the cache, and
  // the cache updates this card.
  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE.document);

  return (
    <article className="card">
      <header>
        <span className="emoji">{product.emoji}</span>
        <span className="name">{product.name}</span>
        <button
          className="fav"
          aria-pressed={product.favorite}
          disabled={loading}
          onClick={() => void toggleFavorite({ variables: { productId: product.id } })}
        >
          {product.favorite ? "★" : "☆"}
        </button>
        <span className="muted">{product.price}</span>
      </header>
      <div className="muted">{product.tagline}</div>
      <div>
        <small>
          {product.averageRating ? `★ ${product.averageRating}` : "no ratings"} ·{" "}
          {plural(product.reviewCount, "review")} · {product.stock} in stock
        </small>
      </div>
      {product.reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </article>
  );
}
