import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Hardcoded superadmin credentials
const SUPERADMIN_EMAIL = "murali36604@gmail.com";
const SUPERADMIN_PASSWORD = "murali@&143";
const SUPERADMIN_NAME = "Murali Admin";

const router: IRouter = Router();

const RegisterBody = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["freelancer", "client"]),
  phone: z.string().optional(),
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed: " + parsed.error.message });
    return;
  }

  const { name, email, password, role, phone } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role, phone: phone ?? null }).returning();

  req.session.userId = user.id;
  req.log.info({ userId: user.id, role }, "New registration");

  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  // Superadmin bypass — check hardcoded credentials first
  if (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, SUPERADMIN_EMAIL));
    let superAdmin;

    if (existing.length > 0) {
      const [updated] = await db
        .update(usersTable)
        .set({ role: "admin", name: SUPERADMIN_NAME })
        .where(eq(usersTable.email, SUPERADMIN_EMAIL))
        .returning();
      superAdmin = updated;
    } else {
      const [created] = await db
        .insert(usersTable)
        .values({ name: SUPERADMIN_NAME, email: SUPERADMIN_EMAIL, passwordHash, role: "admin" })
        .returning();
      superAdmin = created;
    }

    req.session.userId = superAdmin.id;
    req.log.info({ userId: superAdmin.id }, "Superadmin login");

    res.json({ id: superAdmin.id, name: superAdmin.name, email: superAdmin.email, role: superAdmin.role });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Error destroying session");
    }
  });
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export default router;
