import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// AI routes
app.use("/api/ai", aiRouter);

app.use((err, _req, res, _next) => {
  // Basic error handler
  const status = err?.status || 500;
  res
    .status(status)
    .json({ success: false, message: err?.message || "Server error" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
