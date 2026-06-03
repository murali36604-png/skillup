import { Router, type IRouter } from "express";
import { db, usersTable, messagesTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

async function getSessionUser(req: any) {
  if (!req.session.userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  return user ?? null;
}

function fmt(d: Date) { return d.toISOString(); }

// GET /messages/unread-count  (must be before /messages/:userId)
router.get("/messages/unread-count", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messagesTable)
    .where(and(eq(messagesTable.receiverId, user.id), eq(messagesTable.isRead, false)));

  res.json({ count: row?.count ?? 0 });
});

// GET /messages/conversations
router.get("/messages/conversations", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  // Get all messages involving this user, pick distinct conversation partners
  const rows = await db
    .select()
    .from(messagesTable)
    .where(or(eq(messagesTable.senderId, user.id), eq(messagesTable.receiverId, user.id)))
    .orderBy(desc(messagesTable.createdAt));

  // Group by conversation partner
  const convMap = new Map<number, { lastMessage: string; lastMessageAt: Date; unreadCount: number }>();
  for (const m of rows) {
    const partnerId = m.senderId === user.id ? m.receiverId : m.senderId;
    if (!convMap.has(partnerId)) {
      convMap.set(partnerId, {
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    if (m.receiverId === user.id && !m.isRead) {
      const c = convMap.get(partnerId)!;
      c.unreadCount++;
    }
  }

  if (convMap.size === 0) { res.json([]); return; }

  // Fetch partner user details
  const partnerIds = [...convMap.keys()];
  const partners = await db
    .select({ id: usersTable.id, name: usersTable.name, role: usersTable.role })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${partnerIds})`);

  const conversations = partners.map(p => {
    const c = convMap.get(p.id)!;
    return {
      userId: p.id,
      userName: p.name,
      userRole: p.role,
      lastMessage: c.lastMessage,
      lastMessageAt: fmt(c.lastMessageAt),
      unreadCount: c.unreadCount,
    };
  }).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

  res.json(conversations);
});

// GET /messages/:userId — thread between current user and partner
router.get("/messages/:userId", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const partnerId = parseInt(req.params.userId);
  if (isNaN(partnerId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.senderId, user.id), eq(messagesTable.receiverId, partnerId)),
        and(eq(messagesTable.senderId, partnerId), eq(messagesTable.receiverId, user.id))
      )
    )
    .orderBy(messagesTable.createdAt);

  res.json(messages.map(m => ({ ...m, createdAt: fmt(m.createdAt) })));
});

// POST /messages/:userId — send message
router.post("/messages/:userId", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const receiverId = parseInt(req.params.userId);
  if (isNaN(receiverId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const { content } = req.body;
  if (!content?.trim()) { res.status(400).json({ error: "Message content is required" }); return; }

  // Verify receiver exists
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, receiverId));
  if (!receiver) { res.status(404).json({ error: "User not found" }); return; }

  const [msg] = await db.insert(messagesTable).values({
    senderId: user.id,
    receiverId,
    content: content.trim(),
    isRead: false,
  }).returning();

  res.status(201).json({ ...msg, createdAt: fmt(msg.createdAt) });
});

// POST /messages/:userId/read — mark all from partner as read
router.post("/messages/:userId/read", async (req, res): Promise<void> => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const partnerId = parseInt(req.params.userId);
  if (isNaN(partnerId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.senderId, partnerId), eq(messagesTable.receiverId, user.id)));

  res.json({ success: true });
});

export default router;
