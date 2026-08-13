import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { initDatabase } from "./models/database";
import uploadRouter from "./routes/upload";
import dashboardRouter from "./routes/dashboard";
import exportRouter from "./routes/export";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST", "DELETE"] }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/dashboards", dashboardRouter);
app.use("/api/export", exportRouter);

app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

initDatabase();
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`n8n webhook: ${process.env.N8N_WEBHOOK_URL || "NOT SET — check .env"}`);
});
