import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const indexPath = path.join(rootDir, "index.html");
const BASE_URL = "http://dummy";

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
  const normalizedPath = path
    .normalize(pathname)
    .replace(/^([/\\])+/, "")
    .replace(/^(\.\.(?:[/\\]|$))+/, "");
  const resolvedPath = path.join(rootDir, normalizedPath);

  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }

  return resolvedPath;
};

const serveFile = async (filePath, res, method) => {
  if (method !== "GET" && method !== "HEAD") {
    throw new Error(`Unsupported method: ${method}`);
  }
  if (!existsSync(filePath)) {
    const error = new Error("File not found");
    error.code = "ENOENT";
    throw error;
  }

  const fileStats = await stat(filePath);

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);

    const cleanup = () => {
      stream.removeListener("error", handleError);
      res.removeListener("finish", handleFinish);
      res.removeListener("close", handleFinish);
    };

    const handleFinish = () => {
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      console.error("Static server stream error", error);
      cleanup();

      if (!res.headersSent && error?.code === "ENOENT") {
        reject(error);
        return;
      }

      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
        resolve();
        return;
      }

      res.destroy(error);
      resolve();
    };

    stream.once("open", () => {
      res.statusCode = 200;
      res.setHeader("Content-Type", getContentType(filePath));
      res.setHeader("Content-Length", fileStats.size);

      if (method === "HEAD") {
        stream.destroy();
        res.end();
        return;
      }

      stream.pipe(res);
    });

    stream.on("error", handleError);
    res.on("finish", handleFinish);
    res.on("close", handleFinish);
  });
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

    const requestUrl = new URL(req.url ?? "/", BASE_URL);
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

    const extension = path.extname(pathname).toLowerCase();
    const hasKnownExtension = extension !== "" && mimeTypes.has(extension);
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

    if (hasKnownExtension) {
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
