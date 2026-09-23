import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRouter } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();
const port = Number(process.env.PORT ?? 5000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`faceb0ok API listening on http://localhost:${port}`));
}