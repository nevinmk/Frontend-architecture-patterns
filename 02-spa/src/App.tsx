import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Counter } from "./pages/Counter";

// Captured once, when the shell first loads. It never changes while you
// navigate — proof that the page never reloads.
const loadedAt = new Date().toLocaleTimeString();

export function App() {
  // State lives at the app level, so it survives route changes —
  // something an MPA can't do without a server round-trip.
  const [count, setCount] = useState(0);

  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{" "}
        <Link to="/counter">Counter</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/counter" element={<Counter count={count} onIncrement={() => setCount(count + 1)} />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
      <p>
        <small>
          Page loaded at {loadedAt} — this timestamp never changes while you
          navigate, because the page never reloads.
        </small>
      </p>
    </>
  );
}
