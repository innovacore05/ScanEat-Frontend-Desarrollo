import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Todo lo que llegue a /api se reenvia al backend
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.BACKEND_INTERNAL_URL,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/" },
  })
);

// Socket.IO 
const socketProxy = createProxyMiddleware({
  target: process.env.BACKEND_INTERNAL_URL,
  changeOrigin: true,
  ws: true,
  pathFilter: "/socket.io",
});
app.use(socketProxy);

app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

//para que el upgrade a WebSocket pase por el proxy
server.on("upgrade", socketProxy.upgrade);