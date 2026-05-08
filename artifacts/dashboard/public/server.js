import { createServer } from "node:http";
import { constants, createReadStream, existsSync } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const indexPath = path.join(rootDir, "index.html");

if (!existsSync(indexPath)) {
  throw new Error(`Static server index.html not found in ${rootDir}`);
}

const port = (() => {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return 3000;
  }

  const parsedPort = Number(rawPort);

  if (
    !Number.isInteger(parsedPort) ||
    parsedPort <= 0 ||
    parsedPort > 65535
  ) {
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
  await access(filePath, constants.R_OK);
  const fileStats = await stat(filePath);

  res.statusCode = 200;
  res.setHeader("Content-Type", getContentType(filePath));
  res.setHeader("Content-Length", fileStats.size);

  if (method === "HEAD") {
    res.end();
    return;
  }

  const stream = createReadStream(filePath);

  stream.on("error", (error) => {
    console.error("Static server stream error", error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
      return;
    }

    res.destroy(error);
  });

  stream.pipe(res);
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

    const baseUrl = req.headers.host
      ? `http://${req.headers.host}`
      : "http://localhost";
    const requestUrl = new URL(req.url ?? "/", baseUrl);
    let pathname;

    try {
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      res.statusCode = 400;
      res.end("Bad Request");
      return;
    }

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

    await serveFile(indexPath, res, method);
  } catch (error) {
    console.error("Static server error", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}).listen(port, () => {
  console.log(`Static server listening on port ${port}`);
});
