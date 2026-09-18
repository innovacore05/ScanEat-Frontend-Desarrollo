import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.BACKEND_URL,
    changeOrigin: true,
  }),
);
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Front+proxy en puerto " + PORT));
