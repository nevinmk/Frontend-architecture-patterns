// Team B's widget. It never imports Team A's code — it only listens for the
// "add-to-cart" event on the window.
import { useEffect, useState } from "react";

export default function CartWidget() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const onAdd = (e: Event) => {
      setItems((prev) => [...prev, (e as CustomEvent<string>).detail]);
    };
    window.addEventListener("add-to-cart", onAdd);
    return () => window.removeEventListener("add-to-cart", onAdd);
  }, []);

  return (
    <section>
      <h2>
        Cart <small>(Team B)</small>
      </h2>
      {items.length === 0 ? (
        <p>Empty.</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
