// Team A's widget. It knows nothing about the cart team — cross-MFE
// communication happens only through loosely-coupled DOM events.
const PRODUCTS = ["Keyboard", "Mouse", "Monitor"];

export default function ProductsWidget() {
  const addToCart = (product: string) => {
    window.dispatchEvent(new CustomEvent("add-to-cart", { detail: product }));
  };

  return (
    <section>
      <h2>
        Products <small>(Team A)</small>
      </h2>
      {PRODUCTS.map((p) => (
        <p key={p}>
          {p} <button onClick={() => addToCart(p)}>Add to cart</button>
        </p>
      ))}
    </section>
  );
}
