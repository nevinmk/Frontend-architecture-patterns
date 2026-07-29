import { stars } from "../lib/format";
import type { ReviewNode } from "../types";

/** Renders whatever the ReviewCard fragment selects, wherever it was spread. */
export function ReviewItem({ review }: { review: ReviewNode }) {
  return (
    <div className="review">
      <div>
        {review.author.emoji} <b>{review.author.name}</b>{" "}
        <span className="muted">
          · {review.author.city} · {stars(review.rating)} · {review.createdAt}
        </span>
      </div>
      <div>{review.body}</div>
    </div>
  );
}
