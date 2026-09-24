// Static file server for local development. Browsers won't load ES modules from file:// URLs.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT) || 8000;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async ({ url }, response) => {
  try {
    // normalize() stops ".." escaping root. decodeURIComponent throws on malformed escapes, caught below.
    const path = normalize(decodeURIComponent(new URL(url, "http://x").pathname)).replace(/\/$/, "/index.html");
    const body = await readFile(join(root, path));
    response.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Serving on http://127.0.0.1:${port}/`));
