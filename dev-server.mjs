import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleCheckRequest } from "./api/check.js";
import { handleMetaRequest } from "./api/meta.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = __dirname;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(root, safePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return false;
    }

    const body = await readFile(filePath);
    send(res, 200, body, {
      "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream"
    });
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost:3000");

  if (url.pathname === "/api/check") {
    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    const parsedBody = rawBody ? JSON.parse(rawBody) : {};
    const result = await handleCheckRequest({
      method: req.method,
      query: Object.fromEntries(url.searchParams),
      body: parsedBody
    });

    send(res, result.statusCode, JSON.stringify(result.body), {
      "Content-Type": "application/json; charset=utf-8"
    });
    return;
  }

  if (url.pathname === "/api/meta") {
    const result = await handleMetaRequest({
      headers: req.headers
    });

    send(res, result.statusCode, JSON.stringify(result.body), {
      "Content-Type": "application/json; charset=utf-8"
    });
    return;
  }

  const served = await serveStatic(res, url.pathname);
  if (!served) {
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
