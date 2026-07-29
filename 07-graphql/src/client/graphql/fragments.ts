/**
 * A fragment names a reusable selection. Every document that renders a review
 * spreads this one, which means all of them fetch the identical field set —
 * and that is what lets the cache satisfy one query with another query's
 * result, and lets a mutation payload update views it has never heard of.
 */
export const REVIEW_CARD = `fragment ReviewCard on Review {
  id
  rating
  body
  createdAt
  author {
    id
    name
    emoji
    city
  }
}`;
