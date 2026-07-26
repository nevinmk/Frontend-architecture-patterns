import { Layout } from "./Layout";

const PRODUCTS = ["Keyboard", "Mouse", "Monitor"];

export function Home() {
  return (
    <Layout title="Home">
      <h1>Home</h1>
      <p>
        A classic multi-page app: React runs only on the server, as a templating
        engine. No JavaScript is shipped to the browser at all.
      </p>
    </Layout>
  );
}

export function About() {
  return (
    <Layout title="About">
      <h1>About</h1>
      <p>Every URL maps to a server route that returns a complete HTML document.</p>
    </Layout>
  );
}

export function Products() {
  return (
    <Layout title="Products">
      <h1>Products</h1>
      <ul>
        {PRODUCTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </Layout>
  );
}

export function NotFound() {
  return (
    <Layout title="404">
      <h1>404</h1>
      <p>No such page.</p>
    </Layout>
  );
}
