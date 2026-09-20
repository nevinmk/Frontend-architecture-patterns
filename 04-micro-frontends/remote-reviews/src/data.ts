// Shape of the state the server serialises into the fragment and the client
// re-uses on hydrate, instead of re-fetching.
export type Review = { id: number; product: string; author: string; text: string; helpful: number };
export type ReviewsData = { reviews: Review[]; renderedAt: string };
