import type { Review } from "./types";

export const REVIEWS: readonly Review[] = [
  { id: "r1", productId: "p1", authorId: "u2", rating: 5, body: "Pulls a better shot than the machine I left at home.", createdAt: "2024-04-02" },
  { id: "r2", productId: "p1", authorId: "u4", rating: 4, body: "Brilliant, but the basket needs a firm tamp or it channels.", createdAt: "2024-05-19" },
  { id: "r3", productId: "p1", authorId: "u5", rating: 5, body: "Lives in my pannier. Three months, zero complaints.", createdAt: "2024-09-08" },
  { id: "r4", productId: "p2", authorId: "u3", rating: 5, body: "Four days on the Pennine Way and nothing chafed.", createdAt: "2024-06-30" },
  { id: "r5", productId: "p2", authorId: "u1", rating: 4, body: "Fits the bin on every airline I've tried so far.", createdAt: "2024-07-15" },
  { id: "r6", productId: "p3", authorId: "u4", rating: 5, body: "Mixes finally translate to the car stereo.", createdAt: "2024-02-11" },
  { id: "r7", productId: "p3", authorId: "u2", rating: 3, body: "Superb sound, but the fan hiss is audible in a quiet room.", createdAt: "2024-03-27" },
  { id: "r8", productId: "p4", authorId: "u1", rating: 5, body: "The warm end is genuinely warm. Rare.", createdAt: "2024-08-05" },
  { id: "r9", productId: "p4", authorId: "u5", rating: 4, body: "Clamp fits a 40 mm desk edge with room to spare.", createdAt: "2024-10-22" },
  { id: "r10", productId: "p5", authorId: "u3", rating: 5, body: "Took it up a wet crag and the pages held ink fine.", createdAt: "2024-01-18" },
  { id: "r11", productId: "p6", authorId: "u5", rating: 4, body: "Silent under load. The old one sounded like a tin of bolts.", createdAt: "2024-11-03" },
  { id: "r12", productId: "p6", authorId: "u2", rating: 5, body: "Two winters of grit and it still shifts clean.", createdAt: "2025-02-14" },
];
