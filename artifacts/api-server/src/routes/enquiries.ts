import { Router, type IRouter } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { SubmitEnquiryBody } from "@workspace/api-zod";
import nodemailer from "nodemailer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function buildWhatsAppUrl(name: string, course: string, phone: string): string {
  const message = encodeURIComponent(
    `Hi, I am ${name}. I am interested in the ${course} course at SkillUp. My phone number is ${phone}.`
  );
  return `https://wa.me/919704849209?text=${message}`;
}

async function sendEnquiryEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  course: string;
}): Promise<void> {
  const mailUser = process.env.MAIL_USERNAME;
  const mailPass = process.env.MAIL_PASSWORD;

  if (!mailUser || !mailPass) {
    logger.warn("MAIL_USERNAME or MAIL_PASSWORD not set — skipping email notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  await transporter.sendMail({
    from: mailUser,
    to: "mstechsolutions91@gmail.com",
    subject: `New Course Enquiry: ${data.course} — ${data.fullName}`,
    html: `
      <h2>New Course Enquiry — SkillUp Portal</h2>
      <table>
        <tr><td><strong>Full Name:</strong></td><td>${data.fullName}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>
        <tr><td><strong>WhatsApp:</strong></td><td>${data.whatsapp}</td></tr>
        <tr><td><strong>Course:</strong></td><td>${data.course}</td></tr>
      </table>
    `,
  });
}

router.get("/enquiries", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const enquiries = await db.select().from(enquiriesTable).orderBy(enquiriesTable.createdAt);
  res.json(enquiries.map(e => ({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: undefined })));
});

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = SubmitEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [enquiry] = await db.insert(enquiriesTable).values(parsed.data).returning();

  // Send email notification (non-blocking)
  sendEnquiryEmail(parsed.data).catch(err => {
    logger.error({ err }, "Failed to send enquiry email");
  });

  const whatsappUrl = buildWhatsAppUrl(parsed.data.fullName, parsed.data.course, parsed.data.phone);

  res.status(201).json({
    id: enquiry.id,
    whatsappUrl,
  });
});

export default router;
