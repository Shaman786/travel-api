import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./modules/auth/auth.routes";

// Define Env Types
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Global Middleware
app.use("*", logger());
app.use("*", cors());

// 2. Base Route
app.get("/", (c) => c.json({ status: "ok", service: "Travel API" }));

// 3. Mount Modules
// All auth routes will be prefixed with /auth (e.g., /auth/login)
app.route("/auth", authRoutes);

export default app;
