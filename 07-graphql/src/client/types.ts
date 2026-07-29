// Shared client-side shapes. The view models mirror the selections in
// ./graphql — when a document changes, its type changes next to it. Note that
// none of them match a server table: they are the shape of the *query*.

export type AuthorNode = {
  id: string;
  name: string;
  emoji: string;
  city: string;
};

export type ReviewNode = {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  author: AuthorNode;
};

export type CatalogProduct = {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  price: string;
  stock: number;
  favorite: boolean;
  averageRating: number | null;
  reviewCount: number;
  reviews: ReviewNode[];
};
