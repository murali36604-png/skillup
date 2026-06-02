import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const liveClassesTable = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  roomName: text("room_name").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLiveClassSchema = createInsertSchema(liveClassesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLiveClass = z.infer<typeof insertLiveClassSchema>;
export type LiveClass = typeof liveClassesTable.$inferSelect;
