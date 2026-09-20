import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable("admin_users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email"),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessType: text("business_type"),
  budget: text("budget"),
  projectDescription: text("project_description").notNull(),
  interestedServices: jsonb("interested_services").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("registered"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const videoAssetsTable = pgTable("video_assets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  objectPath: text("object_path").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const availabilityRulesTable = pgTable("availability_rules", {
  id: serial("id").primaryKey(),
  weekday: integer("weekday").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  timezone: text("timezone").notNull().default("Africa/Algiers"),
  enabled: boolean("enabled").notNull().default(true),
});

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leadsTable.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull(),
  status: text("status").notNull().default("requested"),
  meetingUrl: text("meeting_url"),
  calendarEventId: text("calendar_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type Lead = typeof leadsTable.$inferSelect;
export type VideoAsset = typeof videoAssetsTable.$inferSelect;
export type AvailabilityRule = typeof availabilityRulesTable.$inferSelect;
export type Booking = typeof bookingsTable.$inferSelect;