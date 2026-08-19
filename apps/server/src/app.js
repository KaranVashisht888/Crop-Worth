import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import listingsRoutes from "./modules/listings/listings.routes.js";
import bidsRoutes from "./modules/bids/bids.routes.js";
import transactionsRoutes from "./modules/transactions/transactions.routes.js";
import pricesRoutes from "./modules/prices/prices.routes.js";
import advisoryRoutes from "./modules/advisory/advisory.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(
    helmet({
      // This backend serves JSON + static images, never HTML, so CSP is
      // inert here - what actually matters is CORP, which defaults to
      // same-origin and would otherwise block the frontend (a different
      // origin) from loading listing photos out of /uploads.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      // TEMPORARY diagnostic for the Render proxy-chain investigation -
      // remove once trust proxy is set correctly.
      xForwardedFor: req.headers["x-forwarded-for"] || null,
      socketRemoteAddress: req.socket.remoteAddress,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/listings", listingsRoutes);
  app.use("/api/bids", bidsRoutes);
  app.use("/api/transactions", transactionsRoutes);
  app.use("/api/prices", pricesRoutes);
  app.use("/api/advisory", advisoryRoutes);

  // Temporary smoke-test route for the auth middleware chain; superseded by
  // real profile/dashboard routes in a later feature.
  app.get("/api/me", authenticate, (req, res) => {
    res.json({ user: req.user });
  });

  app.use(errorHandler);

  return app;
}
