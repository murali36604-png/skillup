import { Router, type IRouter } from "express";
import { db, usersTable, coursesTable, enrollmentsTable, enquiriesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [studentsResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [trainersResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "trainer"));
  const [coursesResult] = await db.select({ count: count() }).from(coursesTable);
  const [enrollmentsResult] = await db.select({ count: count() }).from(enrollmentsTable);
  const [enquiriesResult] = await db.select({ count: count() }).from(enquiriesTable);
  const [newEnquiriesResult] = await db.select({ count: count() }).from(enquiriesTable).where(eq(enquiriesTable.status, "new"));

  res.json({
    totalStudents: studentsResult.count,
    totalTrainers: trainersResult.count,
    totalCourses: coursesResult.count,
    totalEnrollments: enrollmentsResult.count,
    totalEnquiries: enquiriesResult.count,
    newEnquiries: newEnquiriesResult.count,
  });
});

router.get("/dashboard/recent-enquiries", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const enquiries = await db.select().from(enquiriesTable).orderBy(enquiriesTable.createdAt).limit(10);
  res.json(enquiries.map(e => ({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: undefined })));
});

export default router;
