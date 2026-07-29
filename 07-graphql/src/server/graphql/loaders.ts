import type { User } from "../../data";
import type { Store } from "../store/instrumented";

/**
 * A minimal DataLoader, hand-rolled so the mechanism is visible.
 *
 * The trick is the event loop, not caching. GraphQL resolves each level of the
 * tree in parallel, so every `Review.author` on that level calls `load()`
 * during the SAME tick. Each call only records the id it wants and parks a
 * promise; nothing touches the store yet. When the tick drains, `flush` runs
 * once with every id collected — one store call for the whole level.
 *
 * Real projects use the `dataloader` package, which is this plus caching,
 * error-per-key handling and a pluggable scheduler.
 */
export function createUserLoader(store: Store) {
  let waiting: Array<{ id: string; resolve: (user: User | undefined) => void }> = [];
  let scheduled = false;

  const flush = () => {
    const batch = waiting;
    waiting = [];
    scheduled = false;

    // Deduplicated: five reviews by the same author ask the store for one id.
    const ids = [...new Set(batch.map((entry) => entry.id))];
    const found = store.findUsersByIds(ids);
    const byId = new Map(ids.map((id, index) => [id, found[index]]));

    for (const entry of batch) entry.resolve(byId.get(entry.id));
  };

  return {
    load(id: string): Promise<User | undefined> {
      return new Promise((resolve) => {
        waiting.push({ id, resolve });
        if (!scheduled) {
          scheduled = true;
          // Deferred to the end of the current tick — late enough that every
          // sibling resolver has queued its id, early enough that the response
          // is not delayed.
          process.nextTick(flush);
        }
      });
    },
  };
}

export type UserLoader = ReturnType<typeof createUserLoader>;
