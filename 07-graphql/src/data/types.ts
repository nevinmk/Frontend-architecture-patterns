// Domain shapes. Deliberately free of any GraphQL, HTTP or React import — the
// data layer knows nothing about the transports built on top of it.

export type User = {
  id: string;
  name: string;
  emoji: string;
  city: string;
  joinedAt: string;
};

export type Review = {
  id: string;
  productId: string;
  authorId: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type Spec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  priceCents: number;
  category: string;
  emoji: string;
  stock: number;
  favorite: boolean;
  // Deliberately bulky. A REST endpoint returns these whether or not the screen
  // needs them; a GraphQL query only returns them if you ask.
  description: string;
  specs: Spec[];
};
