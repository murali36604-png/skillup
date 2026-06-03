import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const freelancerProfilesTable = pgTable("freelancer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  title: text("title"),
  bio: text("bio"),
  skills: text("skills"),
  hourlyRate: doublePrecision("hourly_rate"),
  location: text("location"),
  portfolioUrl: text("portfolio_url"),
  availability: text("availability", { enum: ["available", "busy", "unavailable"] }).default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type FreelancerProfile = typeof freelancerProfilesTable.$inferSelect;
