import { Router, type IRouter } from "express";
import { db, liveClassesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateLiveClassBody, DeleteLiveClassParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeLiveClass(lc: typeof liveClassesTable.$inferSelect) {
  return {
    id: lc.id,
    title: lc.title,
    roomName: lc.roomName,
    scheduledAt: lc.scheduledAt.toISOString(),
    description: lc.description,
    createdAt: lc.createdAt.toISOString(),
  };
}

router.get("/live-classes", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const classes = await db.select().from(liveClassesTable).orderBy(liveClassesTable.scheduledAt);
  res.json(classes.map(serializeLiveClass));
});

router.post("/live-classes", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateLiveClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [liveClass] = await db.insert(liveClassesTable).values({
    ...parsed.data,
    scheduledAt: new Date(parsed.data.scheduledAt),
  }).returning();

  res.status(201).json(serializeLiveClass(liveClass));
});

router.delete("/live-classes/:id", async (req, res): Promise<void> => {
  const params = DeleteLiveClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(liveClassesTable).where(eq(liveClassesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
