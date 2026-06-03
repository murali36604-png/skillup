import { Router, type IRouter } from "express";
import { db, usersTable, freelancerProfilesTable, bankDetailsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function requireFreelancer(req: any, res: any) {
  if (!req.session.userId) { res.status(401).json({ error: "Not authenticated" }); return null; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return null; }
  if (user.role !== "freelancer") { res.status(403).json({ error: "Freelancer access required" }); return null; }
  return user;
}

// GET /freelancer/profile
router.get("/freelancer/profile", async (req, res): Promise<void> => {
  const user = await requireFreelancer(req, res);
  if (!user) return;
  const [profile] = await db.select().from(freelancerProfilesTable).where(eq(freelancerProfilesTable.userId, user.id));
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json(profile);
});

// PUT /freelancer/profile
router.put("/freelancer/profile", async (req, res): Promise<void> => {
  const user = await requireFreelancer(req, res);
  if (!user) return;

  const { title, bio, skills, hourlyRate, location, portfolioUrl, availability } = req.body;
  const data = { title, bio, skills, hourlyRate, location, portfolioUrl, availability };

  const [existing] = await db.select().from(freelancerProfilesTable).where(eq(freelancerProfilesTable.userId, user.id));
  if (existing) {
    const [updated] = await db.update(freelancerProfilesTable).set(data).where(eq(freelancerProfilesTable.userId, user.id)).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(freelancerProfilesTable).values({ userId: user.id, ...data }).returning();
    res.json(created);
  }
});

// GET /freelancer/bank-details
router.get("/freelancer/bank-details", async (req, res): Promise<void> => {
  const user = await requireFreelancer(req, res);
  if (!user) return;
  const [details] = await db.select().from(bankDetailsTable).where(eq(bankDetailsTable.userId, user.id));
  if (!details) { res.status(404).json({ error: "Bank details not found" }); return; }
  res.json(details);
});

// PUT /freelancer/bank-details
router.put("/freelancer/bank-details", async (req, res): Promise<void> => {
  const user = await requireFreelancer(req, res);
  if (!user) return;

  const { accountHolder, accountNumber, ifscCode, bankName, branch, upiId } = req.body;
  if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
    res.status(400).json({ error: "accountHolder, accountNumber, ifscCode, bankName are required" });
    return;
  }
  const data = { accountHolder, accountNumber, ifscCode, bankName, branch: branch || null, upiId: upiId || null };

  const [existing] = await db.select().from(bankDetailsTable).where(eq(bankDetailsTable.userId, user.id));
  if (existing) {
    const [updated] = await db.update(bankDetailsTable).set(data).where(eq(bankDetailsTable.userId, user.id)).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(bankDetailsTable).values({ userId: user.id, ...data }).returning();
    res.json(created);
  }
});

// GET /freelancer/my-bids
router.get("/freelancer/my-bids", async (req, res): Promise<void> => {
  const user = await requireFreelancer(req, res);
  if (!user) return;

  const { bidsTable, projectsTable } = await import("@workspace/db");
  const bids = await db
    .select({
      id: bidsTable.id,
      projectId: bidsTable.projectId,
      freelancerId: bidsTable.freelancerId,
      amount: bidsTable.amount,
      duration: bidsTable.duration,
      coverLetter: bidsTable.coverLetter,
      status: bidsTable.status,
      createdAt: bidsTable.createdAt,
      projectTitle: projectsTable.title,
      projectCategory: projectsTable.category,
      projectStatus: projectsTable.status,
    })
    .from(bidsTable)
    .innerJoin(projectsTable, eq(bidsTable.projectId, projectsTable.id))
    .where(eq(bidsTable.freelancerId, user.id));

  res.json(bids.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

// GET /freelancers — public browse
router.get("/freelancers", async (req, res): Promise<void> => {
  const freelancers = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      title: freelancerProfilesTable.title,
      bio: freelancerProfilesTable.bio,
      skills: freelancerProfilesTable.skills,
      hourlyRate: freelancerProfilesTable.hourlyRate,
      location: freelancerProfilesTable.location,
      availability: freelancerProfilesTable.availability,
    })
    .from(usersTable)
    .leftJoin(freelancerProfilesTable, eq(usersTable.id, freelancerProfilesTable.userId))
    .where(eq(usersTable.role, "freelancer"));

  res.json(freelancers);
});

export default router;
