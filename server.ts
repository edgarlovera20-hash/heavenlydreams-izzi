import compression from "compression";
import express from "express";
import path from "path";

const appRoot = process.cwd();
const app = express();
const PORT = process.env.PORT ?? 3011;
const isDev = process.env.NODE_ENV !== "production";

app.use(compression());

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, service: "HD-CAPTURA-EXPRESS", ts: new Date().toISOString() });
});

async function startServer() {
  if (!isDev) {
    const clientDist = path.join(appRoot, "dist");

    // Assets con hash en el nombre (vite) y los binarios de OCR se pueden
    // cachear de forma agresiva; el resto (index.html, manifest, sw.js) no,
    // para que un despliegue nuevo se refleje sin que el navegador se quede
    // con una versión vieja.
    app.use(
      "/assets",
      express.static(path.join(clientDist, "assets"), { immutable: true, maxAge: "1y" })
    );
    app.use(
      "/tesseract-core",
      express.static(path.join(clientDist, "tesseract-core"), { immutable: true, maxAge: "1y" })
    );
    app.use(
      express.static(clientDist, {
        index: false,
        setHeaders: (res) => res.setHeader("Cache-Control", "no-cache"),
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24711 } },
      appType: "spa",
      base: "/",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`HD-CAPTURA-EXPRESS server running on port ${PORT}`);
  });
}

startServer();
