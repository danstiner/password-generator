// Static file server for local development. Browsers won't load ES modules from file:// URLs.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT) || 8000;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  let path = normalize(decodeURIComponent(new URL(request.url, "http://localhost").pathname));
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(root, path));
    response.writeHead(200, { "Content-Type": contentTypes[extname(path)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Serving on http://127.0.0.1:${port}/`));
