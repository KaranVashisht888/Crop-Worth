import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);

  // Temporary smoke-test route for the auth middleware chain; superseded by
  // real profile/dashboard routes in a later feature.
  app.get("/api/me", authenticate, (req, res) => {
    res.json({ user: req.user });
  });

  app.use(errorHandler);

  return app;
}
