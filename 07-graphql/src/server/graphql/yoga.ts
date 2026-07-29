import { createYoga, type Plugin } from "graphql-yoga";
import { CORS, GRAPHQL_PATH } from "../config";
import { createContext, type GraphQLContext } from "./context";
import { schema } from "./schema";

/**
 * Prints the store tally after each operation, so the N+1 shows up as a number
 * in the terminal instead of a claim in a comment. A plugin is the right place
 * for it: it sees the whole operation, which is exactly the view an individual
 * resolver lacks.
 */
const storeTally: Plugin<GraphQLContext> = {
  onExecute({ args }) {
    const ctx = args.contextValue;
    return {
      onExecuteDone() {
        const mode = ctx.batch ? "batched" : "naive";
        console.log(`[${ctx.requestId}] ${mode}: ${ctx.counter.hits} store calls`);
        for (const call of ctx.counter.calls) console.log(`[${ctx.requestId}]   ${call}`);
      },
    };
  },
};

// Yoga is a fetch-shaped handler, and Node's `createServer` accepts it directly
// as a listener — see ../index.ts. One endpoint serves every operation, so
// there is no router in this app and never needs to be one.
//
// GraphiQL comes built in: open the endpoint in a browser.
export const yoga = createYoga({
  schema,
  graphqlEndpoint: GRAPHQL_PATH,
  landingPage: false,
  cors: CORS,

  // Called once per request. Its return value is the third argument every
  // resolver receives.
  context: createContext,

  plugins: [storeTally],
});
