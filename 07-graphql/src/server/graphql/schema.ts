import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

/**
 * Types and behaviour, bound together into the executable schema. The context
 * type is declared here so a resolver reaching for something the context does
 * not carry is a compile error rather than an `undefined` at runtime.
 */
export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
