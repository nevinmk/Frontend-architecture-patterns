import { define } from "./define";
import { REVIEW_CARD } from "./fragments";

/**
 * Products, their reviews and every reviewer — three levels, one request.
 *
 * Note what is *not* here: `description`, `specs`, `category`, `priceCents`.
 * They exist on the type and this screen does not want them, so they are never
 * resolved and never sent. A REST endpoint would have shipped all four.
 */
export const CATALOG = define(
  `query Catalog {
  products {
    id
    emoji
    name
    tagline
    price
    stock
    favorite
    averageRating
    reviewCount
    reviews {
      ...ReviewCard
    }
  }
}`,
  REVIEW_CARD,
);
