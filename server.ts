import express from "express";
import path from "path";

const appRoot = process.cwd();
const app = express();
const PORT = process.env.PORT ?? 3011;
const isDev = process.env.NODE_ENV !== "production";

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, service: "HD-CAPTURA-EXPRESS", ts: new Date().toISOString() });
});

async function startServer() {
  if (!isDev) {
    const clientDist = path.join(appRoot, "dist");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
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
