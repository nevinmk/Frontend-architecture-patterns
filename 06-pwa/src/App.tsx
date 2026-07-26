import { useEffect, useState } from "react";

export function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    navigator.serviceWorker?.ready.then(() => setSwReady(true));
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <main>
      <h1>Progressive Web App</h1>
      <p>
        Network: <strong>{online ? "online" : "offline"}</strong> · Service
        worker: <strong>{swReady ? "active — app is cached" : "installing…"}</strong>
      </p>
      <h2>Try it</h2>
      <ol>
        <li>Open DevTools → Application → Service Workers: one is registered.</li>
        <li>
          Switch DevTools → Network to <em>Offline</em> and reload — the app
          still loads, served entirely from the service worker cache.
        </li>
        <li>
          In a Chromium browser, look for the install icon in the address bar —
          the manifest makes the app installable like a native one.
        </li>
      </ol>
      <p>
        <small>
          PWA is a delivery layer, not a rendering strategy — this same service
          worker + manifest pair could wrap the MPA, SPA, SSR, or JAMstack demos.
        </small>
      </p>
    </main>
  );
}
