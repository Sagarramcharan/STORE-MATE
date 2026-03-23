import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check for the platform
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      mode: process.env.NODE_ENV || 'development',
      time: new Date().toISOString()
    });
  });

  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // SPA fallback for production
    app.get("*", (req, res) => {
      // Don't catch API routes
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not Found' });
      
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Production index.html missing. Please rebuild.");
      }
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        root: process.cwd(),
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      console.error("[Server] Failed to initialize Vite:", viteError);
      app.get("*", (req, res) => {
        res.status(500).send("Vite initialization failed. Check server logs.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] FATAL ERROR:", err);
});
