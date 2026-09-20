import { hydrateRoot } from "react-dom/client";
import { Reviews } from "./Reviews";
import type { ReviewsData } from "./data";

// The browser half. The fragment inlined its state under a namespace so it
// can't collide with another remote's; hydrate from that, don't re-fetch.
const state = (window as unknown as { __MFE_STATE__: { reviews: ReviewsData } })
  .__MFE_STATE__.reviews;

hydrateRoot(document.getElementById("reviews-root")!, <Reviews initial={state} />);
