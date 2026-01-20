import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return c.json(
      {
        error: "Unauthorized:Missing Token",
      },
      401,
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");

    c.set("user", payload);
    await next();
  } catch (err) {
    console.error("Auth Error:", err);
    return c.json({ error: "Unauthorized: Invalid Token" }, 401);
  }
});

declare module "hono" {
  interface ContextVariableMap {
    user: unknown;
  }
}
