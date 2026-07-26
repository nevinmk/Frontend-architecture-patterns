export function Counter({ count, onIncrement }: { count: number; onIncrement: () => void }) {
  return (
    <>
      <h1>Counter</h1>
      <p>
        Count: <strong>{count}</strong>
      </p>
      <button onClick={onIncrement}>+1</button>
      <p>Navigate away and back — the count survives. That's client-side state.</p>
    </>
  );
}
