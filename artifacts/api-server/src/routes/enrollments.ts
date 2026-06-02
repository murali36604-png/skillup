import { Router, type IRouter } from "express";
import { db, enrollmentsTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateEnrollmentBody, DeleteEnrollmentParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/enrollments", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const enrollments = await db.select().from(enrollmentsTable).orderBy(enrollmentsTable.enrolledAt);
  res.json(enrollments.map(e => ({
    id: e.id,
    userId: e.userId,
    courseId: e.courseId,
    enrolledAt: e.enrolledAt.toISOString(),
  })));
});

router.post("/enrollments", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateEnrollmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [enrollment] = await db.insert(enrollmentsTable).values(parsed.data).returning();
  res.status(201).json({
    id: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    enrolledAt: enrollment.enrolledAt.toISOString(),
  });
});

router.delete("/enrollments/:id", async (req, res): Promise<void> => {
  const params = DeleteEnrollmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, params.data.id));
  res.sendStatus(204);
});

// Student's own enrollments with course details
router.get("/dashboard/my-enrollments", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, req.session.userId));
  
  const result = await Promise.all(enrollments.map(async (e) => {
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
    return {
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      enrolledAt: e.enrolledAt.toISOString(),
      course: course ? {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        status: course.status,
        trainerId: course.trainerId,
        trainerName: null,
        createdAt: course.createdAt.toISOString(),
      } : null,
    };
  }));

  res.json(result);
});

export default router;
