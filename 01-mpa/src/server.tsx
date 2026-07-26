import express from "express";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { Home, About, Products, NotFound } from "./pages";

const app = express();

// renderToStaticMarkup (not renderToString): pure HTML output, no hydration
// markers — the browser gets a document, never a React app.
const html = (page: ReactElement) => "<!doctype html>" + renderToStaticMarkup(page);

app.get("/", (_req, res) => res.send(html(<Home />)));
app.get("/about", (_req, res) => res.send(html(<About />)));
app.get("/products", (_req, res) => res.send(html(<Products />)));
app.use((_req, res) => res.status(404).send(html(<NotFound />)));

app.listen(3001, () => console.log("MPA demo running at http://localhost:3001"));
