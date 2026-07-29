// The schema IS the contract, and it is the only contract. There is one
// endpoint and one type graph; each screen picks the sub-tree it needs out of
// it. Contrast REST, where every new screen shape needs a new endpoint — or
// quietly settles for the wrong payload.

export const typeDefs = /* GraphQL */ `
  type Query {
    "Everything in the catalogue."
    products: [Product!]!
    "One product by id."
    product(id: ID!): Product
    users: [User!]!
    user(id: ID!): User
    """
    Whoever the request says it is, sent as an x-viewer-id header. Takes no
    arguments and has no parent: it can only be answered from context.
    """
    me: User
  }

  type Mutation {
    """
    Returns the whole updated Product. Because Apollo Client normalises by
    __typename + id, every component already showing this product updates from
    the response alone — no refetch, no manual cache surgery.
    """
    toggleFavorite(productId: ID!): Product!
  }

  type Product {
    id: ID!
    name: String!
    tagline: String!
    priceCents: Int!
    "Formatted server-side — a computed field, backed by no column anywhere."
    price: String!
    category: String!
    emoji: String!
    stock: Int!
    favorite: Boolean!
    "Deliberately long. Ask for it and you pay for it; leave it out and you don't."
    description: String!
    specs: [Spec!]!
    """
    The relationship REST has to express as a second round-trip. The limit
    argument is what makes this field's resolver interesting: it receives a
    parent (this product), arguments and the request context, all at once.
    """
    reviews(limit: Int): [Review!]!
    reviewCount: Int!
    averageRating: Float
  }

  type Spec {
    label: String!
    value: String!
  }

  type Review {
    id: ID!
    rating: Int!
    body: String!
    createdAt: String!
    "Resolved from authorId — the client never sees a foreign key."
    author: User!
    product: Product!
  }

  type User {
    id: ID!
    name: String!
    emoji: String!
    city: String!
    joinedAt: String!
    reviews: [Review!]!
  }
`;
