import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
};

createServer(async (request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filepath = normalize(join(root, pathname));

  if (!filepath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filepath);
    response.writeHead(200, {
      "Content-Type": types[extname(filepath)] || "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Mandarin Tone Trainer running at http://${host}:${port}`);
});
