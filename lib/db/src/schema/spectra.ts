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

export const clientTestimonialsTable = pgTable("client_testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientRole: text("client_role").notNull(),
  company: text("company").notNull(),
  quote: text("quote").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  metric: text("metric"),
  metricLabel: text("metric_label"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const googleCalendarSettingsTable = pgTable("google_calendar_settings", {
  id: serial("id").primaryKey(),
  adminEmail: text("admin_email").notNull().default("admin@spectra.agency"),
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  redirectUri: text("redirect_uri"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry", { withTimezone: true }),
  calendarId: text("calendar_id").default("primary"),
  accountEmail: text("account_email"),
  connected: boolean("connected").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const portfolioWebsitesTable = pgTable("portfolio_websites", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull().default("Digital System"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type Lead = typeof leadsTable.$inferSelect;
export type VideoAsset = typeof videoAssetsTable.$inferSelect;
export type AvailabilityRule = typeof availabilityRulesTable.$inferSelect;
export type Booking = typeof bookingsTable.$inferSelect;
export type ClientTestimonial = typeof clientTestimonialsTable.$inferSelect;
export type GoogleCalendarSettings = typeof googleCalendarSettingsTable.$inferSelect;
export type PortfolioWebsite = typeof portfolioWebsitesTable.$inferSelect;