// Tiny static server for the hub landing page — no dependencies.
const http = require("http");
const fs = require("fs");
const path = require("path");

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  })
  .listen(3000, () => console.log("Hub running at http://localhost:3000"));
