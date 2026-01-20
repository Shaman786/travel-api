import { zValidator } from "@hono/zod-validator";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { db } from "../../db";
import { users } from "../../db/schema";
import { generateId } from "../../lib/id";

const app = new Hono<{ Bindings: { JWT_SECRET: string } }>();

// 1. REGISTER
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json"); // Auto-typed from Zod!

  // Check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email));
  if (existing.length > 0) return c.json({ error: "User already exists" }, 400);

  // Hash & Save
  const hashedPassword = await hash(body.password, 10);
  const publicId = generateId("usr");

  await db.insert(users).values({
    publicId,
    email: body.email,
    name: body.name,
    passwordHash: hashedPassword,
  });

  return c.json({ message: "User created", id: publicId });
});

// 2. LOGIN
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email));
  if (!user || !user.passwordHash)
    return c.json({ error: "Invalid credentials" }, 401);

  const valid = await compare(body.password, user.passwordHash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  // Sign Token
  const token = await sign(
    {
      id: user.publicId,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    c.env.JWT_SECRET,
  );

  return c.json({ token, user: { name: user.name, email: user.email } });
});

export default app;
