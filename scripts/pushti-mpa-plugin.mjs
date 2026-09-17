/**
 * Serve the Pushti Sahitya static MPA from /public ahead of TanStack Start.
 * Dev + vite preview. Production copy is handled by scripts/copy-mpa.mjs.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, relative, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".map": "application/json",
};

function skipPath(pathname) {
  return (
    pathname.startsWith("/@") ||
    pathname.startsWith("/src/") ||
    pathname.startsWith("/node_modules") ||
    pathname.startsWith("/__grok") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/__app-env")
  );
}

function safeFile(siteDir, pathname) {
  let rel = decodeURIComponent(pathname.split("?")[0] || "/");
  if (rel === "/") rel = "/index.html";
  const raw = join(siteDir, rel);
  const resolved = normalize(raw);
  const root = normalize(siteDir + sep);
  if (resolved !== siteDir && !resolved.startsWith(root)) return null;
  return resolved;
}

function sendFile(res, filePath, status) {
  const ext = extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.statusCode = status || 200;
  res.setHeader("Content-Type", type);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=120");
  /* Do NOT set X-Frame-Options: the live preview is an iframe. */
  createReadStream(filePath).pipe(res);
}

function tryServe(siteDir, req, res) {
  const url = req.url || "/";
  const pathname = url.split("?")[0] || "/";
  if (skipPath(pathname)) return false;

  let file = safeFile(siteDir, pathname);
  if (!file) return false;

  if (existsSync(file)) {
    const st = statSync(file);
    if (st.isDirectory()) {
      const idx = join(file, "index.html");
      if (existsSync(idx) && statSync(idx).isFile()) {
        sendFile(res, idx, 200);
        return true;
      }
      return false;
    }
    if (st.isFile()) {
      sendFile(res, file, 200);
      return true;
    }
  }

  if (!extname(pathname)) {
    const html = safeFile(siteDir, pathname.replace(/\/?$/, "") + ".html");
    if (html && existsSync(html) && statSync(html).isFile()) {
      sendFile(res, html, 200);
      return true;
    }
  }

  if ((req.method || "GET").toUpperCase() !== "GET") return false;
  if (pathname.startsWith("/.") ) return false;

  const notFound = join(siteDir, "404.html");
  if (
    existsSync(notFound) &&
    !pathname.includes(".") &&
    !skipPath(pathname)
  ) {
    /* Let Vite handle unknown asset paths; HTML-like misses get 404.html */
  }
  return false;
}

function attach(server, siteDir) {
  server.middlewares.use(function pushtiMpa(req, res, next) {
    try {
      const method = (req.method || "GET").toUpperCase();
      if (method !== "GET" && method !== "HEAD") {
        next();
        return;
      }
      if (tryServe(siteDir, req, res)) return;
      const pathname = (req.url || "/").split("?")[0] || "/";
      if (
        !skipPath(pathname) &&
        !pathname.includes(".") &&
        existsSync(join(siteDir, "404.html"))
      ) {
        sendFile(res, join(siteDir, "404.html"), 404);
        return;
      }
      next();
    } catch (err) {
      console.error("[pushti-mpa]", err);
      next();
    }
  });
}

export function pushtiMpaPlugin() {
  return {
    name: "pushti-static-mpa",
    enforce: "pre",
    configureServer(server) {
      const siteDir = join(server.config.root, "public");
      attach(server, siteDir);
    },
    configurePreviewServer(server) {
      const siteDir = join(server.config.root, "public");
      attach(server, siteDir);
    },
  };
}

void relative;
