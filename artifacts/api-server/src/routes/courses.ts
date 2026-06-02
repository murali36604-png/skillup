import { Router, type IRouter } from "express";
import { db, coursesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateCourseBody,
  UpdateCourseBody,
  GetCourseParams,
  UpdateCourseParams,
  DeleteCourseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeCourse(course: typeof coursesTable.$inferSelect, trainerName: string | null = null) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    duration: course.duration,
    status: course.status,
    trainerId: course.trainerId,
    trainerName,
    createdAt: course.createdAt.toISOString(),
  };
}

router.get("/courses", async (_req, res): Promise<void> => {
  const courses = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
  const trainerIds = [...new Set(courses.map(c => c.trainerId).filter(Boolean))] as number[];
  
  const trainers = trainerIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable)
    : [];
  
  const trainerMap = new Map(trainers.map(t => [t.id, t.name]));
  
  res.json(courses.map(c => serializeCourse(c, c.trainerId ? (trainerMap.get(c.trainerId) ?? null) : null)));
});

router.post("/courses", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json(serializeCourse(course));
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(serializeCourse(course));
});

router.patch("/courses/:id", async (req, res): Promise<void> => {
  const params = UpdateCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db.update(coursesTable).set(parsed.data).where(eq(coursesTable.id, params.data.id)).returning();
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(serializeCourse(course));
});

router.delete("/courses/:id", async (req, res): Promise<void> => {
  const params = DeleteCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(coursesTable).where(eq(coursesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
