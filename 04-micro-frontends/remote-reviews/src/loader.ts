import type { ReviewsData } from "./data";

// Server-only data loader: the remote owns its data fetching and
// hands the host finished state. Stands in for a real reviews API call;
// REVIEWS_DELAY_MS simulates a slow backend to exercise the shell's timeout.
export async function loadReviews(): Promise<ReviewsData> {
  const delay = Number(process.env.REVIEWS_DELAY_MS ?? 0);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  return {
    renderedAt: new Date().toISOString(),
    reviews: [
      { id: 1, product: "Keyboard", author: "Asha", text: "Great switches, loud though.", helpful: 12 },
      { id: 2, product: "Mouse", author: "Ravi", text: "Light and accurate.", helpful: 7 },
      { id: 3, product: "Monitor", author: "Mei", text: "Sharp panel, weak stand.", helpful: 3 },
    ],
  };
}
