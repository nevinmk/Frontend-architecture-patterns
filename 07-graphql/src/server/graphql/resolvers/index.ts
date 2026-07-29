import { Mutation } from "./mutations";
import { Product, Query, Review, User } from "./queries";

// Split by what the resolver does, not by which type it hangs off: reads in
// one file, writes in the other. This is only the assembly point.
export const resolvers = { Query, Mutation, Product, Review, User };
