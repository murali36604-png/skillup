import bcrypt from "bcryptjs";
import { db, usersTable, coursesTable, enrollmentsTable, liveClassesTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const trainerHash = await bcrypt.hash("trainer123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  // Seed users
  const users = await db.insert(usersTable).values([
    { name: "Admin User", email: "admin@skillup.com", passwordHash: adminHash, role: "admin", phone: "+91-9000000001" },
    { name: "Murali Krishna", email: "murali@skillup.com", passwordHash: trainerHash, role: "trainer", phone: "+91-9704849209" },
    { name: "Priya Sharma", email: "priya@skillup.com", passwordHash: trainerHash, role: "trainer", phone: "+91-9000000003" },
    { name: "Arjun Reddy", email: "arjun@skillup.com", passwordHash: studentHash, role: "student", phone: "+91-9000000004" },
    { name: "Sneha Patel", email: "sneha@skillup.com", passwordHash: studentHash, role: "student", phone: "+91-9000000005" },
  ] as any[]).onConflictDoNothing().returning();

  console.log(`Seeded ${users.length} users`);

  // Get trainer IDs
  const allUsers = await db.select().from(usersTable);
  const murali = allUsers.find(u => u.email === "murali@skillup.com");
  const priya = allUsers.find(u => u.email === "priya@skillup.com");
  const arjun = allUsers.find(u => u.email === "arjun@skillup.com");

  // Seed courses
  const courses = await db.insert(coursesTable).values([
    {
      title: "Python Programming",
      description: "Learn Python from scratch — variables, loops, functions, OOP, and real-world projects. Ideal for beginners and career switchers.",
      category: "Programming",
      duration: "3 months",
      status: "active",
      trainerId: murali?.id ?? null,
    },
    {
      title: "Web Development",
      description: "Full-stack web development with HTML, CSS, JavaScript, React, and Node.js. Build and deploy complete web applications.",
      category: "Web",
      duration: "4 months",
      status: "active",
      trainerId: priya?.id ?? null,
    },
    {
      title: "Data Entry",
      description: "Master data entry techniques, MS Office tools (Excel, Word), and productivity software for professional environments.",
      category: "Office Skills",
      duration: "1 month",
      status: "active",
      trainerId: murali?.id ?? null,
    },
  ] as any[]).onConflictDoNothing().returning();

  console.log(`Seeded ${courses.length} courses`);

  const allCourses = await db.select().from(coursesTable);
  const pythonCourse = allCourses.find(c => c.title === "Python Programming");
  const webCourse = allCourses.find(c => c.title === "Web Development");

  // Seed enrollments
  if (arjun && pythonCourse) {
    await db.insert(enrollmentsTable).values([
      { userId: arjun.id, courseId: pythonCourse.id },
    ] as any[]).onConflictDoNothing();
  }

  const sneha = allUsers.find(u => u.email === "sneha@skillup.com");
  if (sneha && webCourse) {
    await db.insert(enrollmentsTable).values([
      { userId: sneha.id, courseId: webCourse.id },
    ] as any[]).onConflictDoNothing();
  }

  console.log("Seeded enrollments");

  // Seed live classes
  await db.insert(liveClassesTable).values([
    {
      title: "Python Intro — Week 1",
      roomName: "SkillUp_Live_Classroom_Murali",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      description: "First live session: Python basics, variables, and data types.",
    },
    {
      title: "Web Dev: React Fundamentals",
      roomName: "SkillUp_WebDev_Priya",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      description: "Introduction to React components, props, and state management.",
    },
  ] as any[]).onConflictDoNothing();

  console.log("Seeded live classes");
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
