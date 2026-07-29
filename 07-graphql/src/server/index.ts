import { createServer } from "node:http";
import { API_PORT, GRAPHQL_PATH } from "./config";
import { yoga } from "./graphql/yoga";

// The entire HTTP surface. Yoga is already a valid Node request listener, so
// there is nothing to route: every query and every mutation, present and
// future, arrives at this one handler.
createServer(yoga).listen(API_PORT, () => {
  console.log(`GraphQL API + GraphiQL  http://localhost:${API_PORT}${GRAPHQL_PATH}`);
});
