import { Router, type IRouter } from "express";
import { db, usersTable, projectsTable, bidsTable, freelancerProfilesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router: IRouter = Router();

async function getSessionUser(req: any) {
  if (!req.session.userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  return user ?? null;
}

function serializeProject(p: any) {
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

// GET /projects — public list of open projects
router.get("/projects", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: projectsTable.id,
      clientId: projectsTable.clientId,
      clientName: usersTable.name,
      title: projectsTable.title,
      description: projectsTable.description,
      category: projectsTable.category,
      skillsRequired: projectsTable.skillsRequired,
      budgetMin: projectsTable.budgetMin,
      budgetMax: projectsTable.budgetMax,
      deadline: projectsTable.deadline,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .innerJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
    .orderBy(desc(projectsTable.createdAt));

  // Attach bid counts
  const bidCounts = await db.select({ projectId: bidsTable.projectId, cnt: count() }).from(bidsTable).groupBy(bidsTable.projectId);
  const bidMap = Object.fromEntries(bidCounts.map(b => [b.projectId, Number(b.cnt)]));

  res.json(rows.map(r => serializeProject({ ...r, bidCount: bidMap[r.id] ?? 0 })));
});

// GET /projects/my — client's own projects
router.get("/projects/my", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (user.role !== "client") { res.status(403).json({ error: "Client access required" }); return; }

  const rows = await db
    .select({
      id: projectsTable.id,
      clientId: projectsTable.clientId,
      clientName: usersTable.name,
      title: projectsTable.title,
      description: projectsTable.description,
      category: projectsTable.category,
      skillsRequired: projectsTable.skillsRequired,
      budgetMin: projectsTable.budgetMin,
      budgetMax: projectsTable.budgetMax,
      deadline: projectsTable.deadline,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .innerJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
    .where(eq(projectsTable.clientId, user.id))
    .orderBy(desc(projectsTable.createdAt));

  const bidCounts = await db.select({ projectId: bidsTable.projectId, cnt: count() }).from(bidsTable).groupBy(bidsTable.projectId);
  const bidMap = Object.fromEntries(bidCounts.map(b => [b.projectId, Number(b.cnt)]));

  res.json(rows.map(r => serializeProject({ ...r, bidCount: bidMap[r.id] ?? 0 })));
});

// POST /projects — create project (client only)
router.post("/projects", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (user.role !== "client") { res.status(403).json({ error: "Client access required" }); return; }

  const { title, description, category, skillsRequired, budgetMin, budgetMax, deadline } = req.body;
  if (!title || !description || !category) {
    res.status(400).json({ error: "title, description, category are required" });
    return;
  }

  const [project] = await db.insert(projectsTable).values({
    clientId: user.id, title, description, category,
    skillsRequired: skillsRequired || null,
    budgetMin: budgetMin ?? null,
    budgetMax: budgetMax ?? null,
    deadline: deadline || null,
    status: "open",
  }).returning();

  res.status(201).json(serializeProject({ ...project, clientName: user.name, bidCount: 0 }));
});

// GET /projects/:id
router.get("/projects/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db
    .select({
      id: projectsTable.id,
      clientId: projectsTable.clientId,
      clientName: usersTable.name,
      title: projectsTable.title,
      description: projectsTable.description,
      category: projectsTable.category,
      skillsRequired: projectsTable.skillsRequired,
      budgetMin: projectsTable.budgetMin,
      budgetMax: projectsTable.budgetMax,
      deadline: projectsTable.deadline,
      status: projectsTable.status,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .innerJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
    .where(eq(projectsTable.id, id));

  if (!row) { res.status(404).json({ error: "Project not found" }); return; }

  const [bidCount] = await db.select({ cnt: count() }).from(bidsTable).where(eq(bidsTable.projectId, id));
  res.json(serializeProject({ ...row, bidCount: Number(bidCount?.cnt ?? 0) }));
});

// PATCH /projects/:id
router.patch("/projects/:id", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const id = parseInt(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  if (project.clientId !== user.id && user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const { title, description, category, skillsRequired, budgetMin, budgetMax, deadline, status } = req.body;
  const [updated] = await db.update(projectsTable).set({
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(category !== undefined && { category }),
    ...(skillsRequired !== undefined && { skillsRequired }),
    ...(budgetMin !== undefined && { budgetMin }),
    ...(budgetMax !== undefined && { budgetMax }),
    ...(deadline !== undefined && { deadline }),
    ...(status !== undefined && { status }),
  }).where(eq(projectsTable.id, id)).returning();

  res.json(serializeProject({ ...updated, clientName: user.name, bidCount: 0 }));
});

// DELETE /projects/:id
router.delete("/projects/:id", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const id = parseInt(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  if (project.clientId !== user.id && user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.sendStatus(204);
});

// GET /projects/:id/bids
router.get("/projects/:id/bids", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const bids = await db
    .select({
      id: bidsTable.id,
      projectId: bidsTable.projectId,
      freelancerId: bidsTable.freelancerId,
      freelancerName: usersTable.name,
      freelancerEmail: usersTable.email,
      freelancerTitle: freelancerProfilesTable.title,
      amount: bidsTable.amount,
      duration: bidsTable.duration,
      coverLetter: bidsTable.coverLetter,
      status: bidsTable.status,
      createdAt: bidsTable.createdAt,
    })
    .from(bidsTable)
    .innerJoin(usersTable, eq(bidsTable.freelancerId, usersTable.id))
    .leftJoin(freelancerProfilesTable, eq(bidsTable.freelancerId, freelancerProfilesTable.userId))
    .where(eq(bidsTable.projectId, id))
    .orderBy(desc(bidsTable.createdAt));

  res.json(bids.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

// POST /projects/:id/bids
router.post("/projects/:id/bids", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (user.role !== "freelancer") { res.status(403).json({ error: "Freelancer access required" }); return; }

  const projectId = parseInt(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  if (project.status !== "open") { res.status(400).json({ error: "Project is not accepting bids" }); return; }

  const { amount, duration, coverLetter } = req.body;
  if (!amount || isNaN(Number(amount))) { res.status(400).json({ error: "amount is required" }); return; }

  const [bid] = await db.insert(bidsTable).values({
    projectId, freelancerId: user.id, amount: Number(amount),
    duration: duration || null, coverLetter: coverLetter || null, status: "pending",
  }).returning();

  res.status(201).json({ ...bid, createdAt: bid.createdAt.toISOString() });
});

// PATCH /bids/:id
router.patch("/bids/:id", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (user.role !== "client") { res.status(403).json({ error: "Client access required" }); return; }

  const bidId = parseInt(req.params.id);
  const [bid] = await db.select().from(bidsTable).where(eq(bidsTable.id, bidId));
  if (!bid) { res.status(404).json({ error: "Bid not found" }); return; }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, bid.projectId));
  if (!project || project.clientId !== user.id) { res.status(403).json({ error: "Forbidden" }); return; }

  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) { res.status(400).json({ error: "status must be accepted or rejected" }); return; }

  const [updated] = await db.update(bidsTable).set({ status }).where(eq(bidsTable.id, bidId)).returning();

  // If accepting, mark project in_progress
  if (status === "accepted") {
    await db.update(projectsTable).set({ status: "in_progress" }).where(eq(projectsTable.id, bid.projectId));
  }

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

export default router;
