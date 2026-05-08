import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const port = (() => {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return 3000;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return parsedPort;
})();

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

const getContentType = (filePath) =>
  mimeTypes.get(path.extname(filePath).toLowerCase()) ??
  "application/octet-stream";

const resolvePath = (pathname) => {
  const resolvedPath = path.resolve(rootDir, `.${pathname}`);

  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }

  return resolvedPath;
};

const serveFile = async (filePath, res, method) => {
  const data = await readFile(filePath);

  res.statusCode = 200;
  res.setHeader("Content-Type", getContentType(filePath));
  res.setHeader("Content-Length", data.length);

  if (method === "HEAD") {
    res.end();
    return;
  }

  res.end(data);
};

createServer(async (req, res) => {
  try {
    const method = req.method ?? "GET";

    if (method !== "GET" && method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET, HEAD");
      res.end();
      return;
    }

    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname.endsWith("/")) {
      pathname += "index.html";
    }

    const isAssetRequest = path.extname(pathname) !== "";
    const resolvedPath = resolvePath(pathname);

    if (!resolvedPath) {
      res.statusCode = 400;
      res.end("Bad Request");
      return;
    }

    try {
      await serveFile(resolvedPath, res, method);
      return;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    if (isAssetRequest) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    await serveFile(path.join(rootDir, "index.html"), res, method);
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(port);
