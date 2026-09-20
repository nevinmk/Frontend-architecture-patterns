import { renderToString } from "react-dom/server";
import { Reviews } from "./Reviews";
import { loadReviews } from "./loader";

// The server half of this remote. server.mjs calls it per request.
export async function render() {
  const state = await loadReviews();
  return { html: renderToString(<Reviews initial={state} />), state };
}
