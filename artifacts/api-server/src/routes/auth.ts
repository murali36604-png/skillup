import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

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

    // Upsert the superadmin so the session userId always resolves to a real row
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, SUPERADMIN_EMAIL));
    let superAdmin;

    if (existing.length > 0) {
      // Ensure role is admin (in case someone changed it)
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

    res.json({
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    });
    return;
  }

  // Regular DB-based login for all other users
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

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
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

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export default router;
