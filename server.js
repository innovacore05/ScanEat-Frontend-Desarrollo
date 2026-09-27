import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Todo lo que llegue a /api se reenvía al backend
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.BACKEND_INTERNAL_URL,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/" },
  })
);

app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ESTO FALTABA:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});