import { gql } from "@apollo/client";
import type { DocumentNode } from "@apollo/client";

/**
 * Every document is kept as source text *and* parsed node: the panels render
 * the source on screen next to the result, so the two must not drift apart.
 * Extra parts are appended to the same document, which is how fragments get
 * bundled with the operation that spreads them.
 */
export type GqlDocument = { source: string; document: DocumentNode };

export function define(operation: string, ...fragments: string[]): GqlDocument {
  const source = [operation, ...fragments].join("\n\n");
  return { source, document: gql(source) };
}
