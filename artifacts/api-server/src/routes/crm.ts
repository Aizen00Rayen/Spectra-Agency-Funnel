import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import {
  ApproveBookingParams,
  ApproveBookingResponse,
  CreateAvailabilityRuleBody,
  CreateAvailabilityRuleResponse,
  CreateBookingBody,
  CreateBookingResponse,
  CreateLeadBody,
  CreateLeadResponse,
  CreateVideoAssetBody,
  CreateVideoAssetResponse,
  DeleteAvailabilityRuleParams,
  GetAdminSummaryResponse,
  GetAdminVideoResponse,
  GetCalendarStatusResponse,
  GetPublicAvailabilityQueryParams,
  GetPublicAvailabilityResponse,
  GetPublicConfigResponse,
  ListAdminBookingsQueryParams,
  ListAdminBookingsResponse,
  ListAdminLeadsQueryParams,
  ListAdminLeadsResponse,
  ListAvailabilityRulesResponse,
  ListCalendarsResponse,
  PublishVideoAssetParams,
  PublishVideoAssetResponse,
  UpdateBookingStatusBody,
  UpdateBookingStatusParams,
  UpdateBookingStatusResponse,
  UpdateLeadStatusBody,
  UpdateLeadStatusParams,
} from "@workspace/api-zod";
import {
  availabilityRulesTable,
  bookingsTable,
  clientTestimonialsTable,
  db,
  leadsTable,
  portfolioWebsitesTable,
  videoAssetsTable,
} from "@workspace/db";

import {
  createAdminSession,
  requireAdmin,
  revokeAdminSession,
  validateAdminCredentials,
  type AdminRequest,
} from "../middlewares/adminAuth";
import { adminLoginLimiter, leadSubmissionLimiter } from "../middlewares/security";
import { generateStreamTicket } from "./storage";

const router: IRouter = Router();

const leadStatuses = [
  "registered",
  "reviewing",
  "approved",
  "refused",
  "scheduled",
  "met",
  "fit",
  "not_fit",
  "nurture",
] as const;

const bookingStatuses = ["requested", "approved", "cancelled", "completed", "no_show"] as const;

function serializeLead(lead: typeof leadsTable.$inferSelect) {
  return {
    ...lead,
    interestedServices: lead.interestedServices ?? [],
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

function serializeVideo(video: typeof videoAssetsTable.$inferSelect) {
  return {
    ...video,
    createdAt: video.createdAt.toISOString(),
  };
}

function serializeBooking(booking: typeof bookingsTable.$inferSelect) {
  return {
    ...booking,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    createdAt: booking.createdAt.toISOString(),
  };
}

function serializeRule(rule: typeof availabilityRulesTable.$inferSelect) {
  return rule;
}

function parseDateOnly(value: Date | string) {
  if (value instanceof Date) return value;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

async function buildAvailability(from: Date | string, to: Date | string) {
  const rules = await db
    .select()
    .from(availabilityRulesTable)
    .where(eq(availabilityRulesTable.enabled, true));
  const existingBookings = await db
    .select()
    .from(bookingsTable)
    .where(ne(bookingsTable.status, "cancelled"));
  const slots: Array<{ startsAt: string; endsAt: string; timezone: string }> = [];

  for (let date = parseDateOnly(from); date < parseDateOnly(to); date = addMinutes(date, 24 * 60)) {
    const weekday = date.getUTCDay();
    for (const rule of rules.filter((candidate) => candidate.weekday === weekday)) {
      const start = new Date(`${date.toISOString().slice(0, 10)}T${rule.startTime}:00.000Z`);
      const end = new Date(`${date.toISOString().slice(0, 10)}T${rule.endTime}:00.000Z`);
      for (let cursor = start; addMinutes(cursor, 30) <= end; cursor = addMinutes(cursor, 30)) {
        const slotEnd = addMinutes(cursor, 30);
        const unavailable = existingBookings.some(
          (booking) =>
            booking.startsAt < slotEnd &&
            booking.endsAt > cursor &&
            booking.status !== "cancelled",
        );
        if (!unavailable && cursor.getTime() > Date.now()) {
          slots.push({
            startsAt: cursor.toISOString(),
            endsAt: slotEnd.toISOString(),
            timezone: rule.timezone,
          });
        }
      }
    }
  }

  return slots;
}

router.get("/public/config", async (req, res) => {
  const videos = await db
    .select()
    .from(videoAssetsTable)
    .where(eq(videoAssetsTable.isPublished, true))
    .orderBy(desc(videoAssetsTable.createdAt))
    .limit(1);
  const rules = await db.select().from(availabilityRulesTable).where(eq(availabilityRulesTable.enabled, true)).limit(1);
  const video = videos[0];

  const rawHost = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5000";
  const host = Array.isArray(rawHost) ? rawHost[0] : String(rawHost);
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";

  let videoUrl: string | null = null;
  if (video) {
    if (video.objectPath.startsWith("http://") || video.objectPath.startsWith("https://")) {
      videoUrl = video.objectPath;
    } else {
      const filename = video.objectPath.replace(/^\/objects\//, "");
      const ticket = generateStreamTicket(filename);
      videoUrl = `${protocol}://${host}/api/storage/objects/${filename}?ticket=${ticket}`;
    }
  }

  const payload = {
    video: video
      ? {
          title: video.title,
          url: videoUrl!,
        }
      : null,
    bookingDurationMinutes: 30,
    timezone: rules[0]?.timezone ?? "Africa/Algiers",
  };
  res.json(GetPublicConfigResponse.parse(payload));
});

router.post("/leads", leadSubmissionLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const company = String(body.company || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    let projectDescription = String(body.projectDescription || "").trim();
    const businessType = body.businessType ? String(body.businessType).trim() : null;
    const budget = body.budget ? String(body.budget).trim() : null;
    let interestedServices = Array.isArray(body.interestedServices) ? body.interestedServices : [];

    if (!name) {
      res.status(400).json({ error: "Name is required." });
      return;
    }
    if (!company) {
      res.status(400).json({ error: "Company name is required." });
      return;
    }
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }
    if (!phone) {
      res.status(400).json({ error: "Phone number is required." });
      return;
    }

    if (!projectDescription) {
      projectDescription = "Strategic consultation request";
    } else if (projectDescription.length < 10) {
      projectDescription = `${projectDescription} (strategic consultation)`;
    }

    if (interestedServices.length === 0) {
      interestedServices = ["Digital Strategy"];
    }

    const [lead] = await db
      .insert(leadsTable)
      .values({
        name,
        company,
        email,
        phone,
        businessType,
        budget,
        projectDescription,
        interestedServices,
        status: "registered",
      })
      .returning();

    res.status(201).json(serializeLead(lead));
  } catch (err: any) {
    req.log.error({ err }, "Lead creation error");
    res.status(400).json({ error: err.message || "Failed to create lead" });
  }
});

async function ensurePortfolioInitialized() {
  try {
    // Delete any test rows containing Astra or Nadir if any were inserted
    await db.delete(portfolioWebsitesTable).where(
      or(
        ilike(portfolioWebsitesTable.title, "%astra%"),
        ilike(portfolioWebsitesTable.title, "%nadir%"),
        ilike(portfolioWebsitesTable.url, "%astra%"),
        ilike(portfolioWebsitesTable.url, "%nadir%")
      )
    );

    const existing = await db.select({ id: portfolioWebsitesTable.id }).from(portfolioWebsitesTable);
    if (existing.length === 0) {
      await db.insert(portfolioWebsitesTable).values([
        {
          title: "The Results Academy",
          url: "https://theresults-academy.com/",
          category: "E-Learning Platform",
          description: "Interactive modern educational portal and digital curriculum system.",
          displayOrder: 1,
          isPublished: true,
        },
        {
          title: "The Bequer",
          url: "https://thebequer.tech/",
          category: "Cosmetics & Tech",
          description: "Luxury e-commerce and branded cosmetic retail experience.",
          displayOrder: 2,
          isPublished: true,
        },
        {
          title: "FYN Beauty",
          url: "https://fynbeauty.shop/",
          category: "Cosmetics Store",
          description: "High-converting boutique beauty showcase and checkout flow.",
          displayOrder: 3,
          isPublished: true,
        },
      ]);
    }
  } catch (err) {
    console.error("Error ensuring portfolio initialized:", err);
  }
}

router.get("/public/portfolio", async (_req, res) => {
  await ensurePortfolioInitialized();
  const items = await db
    .select()
    .from(portfolioWebsitesTable)
    .where(eq(portfolioWebsitesTable.isPublished, true))
    .orderBy(portfolioWebsitesTable.displayOrder, desc(portfolioWebsitesTable.createdAt));
  res.json(items);
});

async function ensureAvailabilityInitialized(force = false) {
  try {
    const existing = await db.select({ id: availabilityRulesTable.id }).from(availabilityRulesTable);
    if (existing.length === 0 || force) {
      if (force && existing.length > 0) {
        await db.delete(availabilityRulesTable);
      }
      await db.insert(availabilityRulesTable).values([
        // Sunday (0) through Thursday (4) - standard Algerian/MENA business week
        { weekday: 0, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers", enabled: true },
        { weekday: 1, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers", enabled: true },
        { weekday: 2, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers", enabled: true },
        { weekday: 3, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers", enabled: true },
        { weekday: 4, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers", enabled: true },
        { weekday: 6, startTime: "10:00", endTime: "15:00", timezone: "Africa/Algiers", enabled: true },
      ]);
    }
  } catch (err) {
    console.error("Error ensuring availability initialized:", err);
  }
}

router.get("/public/availability", async (req, res) => {
  await ensureAvailabilityInitialized();
  const fromQuery = typeof req.query.from === "string" ? req.query.from : undefined;
  const toQuery = typeof req.query.to === "string" ? req.query.to : undefined;

  const from = fromQuery || new Date().toISOString().slice(0, 10);
  let to = toQuery;
  if (!to) {
    const future = new Date();
    future.setDate(future.getDate() + 21);
    to = future.toISOString().slice(0, 10);
  }

  const slots = await buildAvailability(from, to);
  res.json(slots);
});

router.post("/bookings", leadSubmissionLimiter, async (req, res) => {
  try {
    const input = CreateBookingBody.parse(req.body);
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, input.leadId)).limit(1);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      res.status(400).json({ error: "Invalid booking window" });
      return;
    }

    const overlaps = await db
      .select()
      .from(bookingsTable)
      .where(ne(bookingsTable.status, "cancelled"));
    if (overlaps.some((booking) => booking.startsAt < endsAt && booking.endsAt > startsAt)) {
      res.status(409).json({ error: "That time is no longer available" });
      return;
    }

    const [booking] = await db
      .insert(bookingsTable)
      .values({
        leadId: lead.id,
        clientName: lead.name,
        clientEmail: lead.email,
        startsAt,
        endsAt,
        timezone: input.timezone,
        status: "requested",
      })
      .returning();

    await db
      .update(leadsTable)
      .set({ status: "reviewing", updatedAt: new Date() })
      .where(eq(leadsTable.id, lead.id));

    res.status(201).json(CreateBookingResponse.parse(serializeBooking(booking)));
  } catch (err: any) {
    req.log.error({ err }, "Booking creation error");
    res.status(400).json({ error: err.message || "Failed to create booking" });
  }
});

router.get("/public/testimonials", async (req, res) => {
  const rawHost = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5000";
  const host = Array.isArray(rawHost) ? rawHost[0] : String(rawHost);
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";

  const testimonials = await db
    .select()
    .from(clientTestimonialsTable)
    .where(eq(clientTestimonialsTable.isPublished, true))
    .orderBy(desc(clientTestimonialsTable.createdAt));

  const signedTestimonials = testimonials.map((t) => {
    let videoUrl = t.videoUrl;
    if (videoUrl) {
      if (videoUrl.includes("/api/storage/objects/")) {
        const filename = videoUrl.split("/api/storage/objects/")[1]?.split("?")[0];
        if (filename) {
          const ticket = generateStreamTicket(filename);
          videoUrl = `${protocol}://${host}/api/storage/objects/${filename}?ticket=${ticket}`;
        }
      } else if (videoUrl.startsWith("/objects/")) {
        const filename = videoUrl.replace(/^\/objects\//, "").split("?")[0];
        const ticket = generateStreamTicket(filename);
        videoUrl = `${protocol}://${host}/api/storage/objects/${filename}?ticket=${ticket}`;
      }
    }
    return {
      ...t,
      videoUrl,
    };
  });

  res.json(signedTestimonials);
});

router.post("/admin/login", adminLoginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const result = validateAdminCredentials(email, password);
  if (!result.valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = createAdminSession(result.email!);
  res.cookie("spectra_admin_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    success: true,
    token,
    user: { email: result.email, role: "owner" },
  });
});

router.post("/admin/logout", async (req, res) => {
  const token = req.cookies?.["spectra_admin_token"] || (req.headers["x-admin-token"] as string);
  revokeAdminSession(token);
  res.clearCookie("spectra_admin_token", { path: "/" });
  res.json({ success: true });
});



router.use("/admin", requireAdmin);

router.get("/admin/me", async (_req, res) => {
  res.json({ authenticated: true, user: { email: "admin@spectra.agency", role: "owner" } });
});

router.get("/admin/testimonials", async (_req, res) => {
  const testimonials = await db
    .select()
    .from(clientTestimonialsTable)
    .orderBy(desc(clientTestimonialsTable.createdAt));
  res.json(testimonials);
});

router.post("/admin/testimonials", async (req, res) => {
  const { clientName, clientRole, company, quote, videoUrl, thumbnailUrl, metric, metricLabel } = req.body || {};
  if (!clientName || !company || !quote || !videoUrl) {
    res.status(400).json({ error: "clientName, company, quote, and videoUrl are required" });
    return;
  }
  const [created] = await db
    .insert(clientTestimonialsTable)
    .values({
      clientName,
      clientRole: clientRole || "Client",
      company,
      quote,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      metric: metric || null,
      metricLabel: metricLabel || null,
      isPublished: true,
    })
    .returning();
  res.status(201).json(created);
});

router.patch("/admin/testimonials/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { isPublished, clientName, clientRole, company, quote, videoUrl, metric, metricLabel } = req.body || {};
  const updateData: Record<string, unknown> = {};
  if (typeof isPublished === "boolean") updateData.isPublished = isPublished;
  if (clientName) updateData.clientName = clientName;
  if (clientRole) updateData.clientRole = clientRole;
  if (company) updateData.company = company;
  if (quote) updateData.quote = quote;
  if (videoUrl) updateData.videoUrl = videoUrl;
  if (metric !== undefined) updateData.metric = metric;
  if (metricLabel !== undefined) updateData.metricLabel = metricLabel;

  const [updated] = await db
    .update(clientTestimonialsTable)
    .set(updateData)
    .where(eq(clientTestimonialsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Testimonial not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/testimonials/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(clientTestimonialsTable).where(eq(clientTestimonialsTable.id, id));
  res.status(204).end();
});

router.get("/admin/portfolio", async (_req, res) => {
  await ensurePortfolioInitialized();
  const items = await db
    .select()
    .from(portfolioWebsitesTable)
    .orderBy(portfolioWebsitesTable.displayOrder, desc(portfolioWebsitesTable.createdAt));
  res.json(items);
});

router.post("/admin/portfolio", async (req, res) => {
  const { title, url, imageUrl, category, description, displayOrder, isPublished } = req.body || {};
  if (!title || !url) {
    res.status(400).json({ error: "Title and URL are required" });
    return;
  }
  const [created] = await db
    .insert(portfolioWebsitesTable)
    .values({
      title: title.trim(),
      url: url.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : null,
      category: category ? category.trim() : "Digital System",
      description: description ? description.trim() : null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
    })
    .returning();
  res.status(201).json(created);
});

router.patch("/admin/portfolio/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, url, imageUrl, category, description, displayOrder, isPublished } = req.body || {};
  const updateData: Record<string, unknown> = {};
  if (title) updateData.title = title.trim();
  if (url) updateData.url = url.trim();
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? imageUrl.trim() : null;
  if (category) updateData.category = category.trim();
  if (description !== undefined) updateData.description = description;
  if (typeof displayOrder === "number") updateData.displayOrder = displayOrder;
  if (typeof isPublished === "boolean") updateData.isPublished = isPublished;

  const [updated] = await db
    .update(portfolioWebsitesTable)
    .set(updateData)
    .where(eq(portfolioWebsitesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Portfolio item not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/portfolio/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(portfolioWebsitesTable).where(eq(portfolioWebsitesTable.id, id));
  res.status(204).end();
});

router.get("/admin/summary", async (_req: AdminRequest, res) => {
  const leads = await db.select().from(leadsTable);
  const bookings = await db.select().from(bookingsTable);
  const videos = await db.select().from(videoAssetsTable).where(eq(videoAssetsTable.isPublished, true)).limit(1);

  const payload = {
    totalLeads: leads.length,
    registered: leads.filter((lead) => lead.status === "registered").length,
    awaitingApproval: leads.filter((lead) => ["reviewing", "registered"].includes(lead.status)).length,
    approved: leads.filter((lead) => ["approved", "scheduled", "met", "fit"].includes(lead.status)).length,
    upcomingMeetings: bookings.filter(
      (booking) => booking.status === "approved" && booking.startsAt.getTime() > Date.now(),
    ).length,
    publishedVideo: videos.length > 0,
    calendarConnected: false,
  };
  res.json(GetAdminSummaryResponse.parse(payload));
});

router.get("/admin/leads", async (req, res) => {
  const input = ListAdminLeadsQueryParams.parse(req.query);
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  const filtered = input.status ? leads.filter((lead) => lead.status === input.status) : leads;
  res.json(ListAdminLeadsResponse.parse(filtered.map(serializeLead)));
});

router.patch("/admin/leads/:id/status", async (req, res) => {
  const params = UpdateLeadStatusParams.parse(req.params);
  const input = UpdateLeadStatusBody.parse(req.body);
  if (!leadStatuses.includes(input.status)) {
    res.status(400).json({ error: "Unsupported lead status" });
    return;
  }
  const [lead] = await db
    .update(leadsTable)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(leadsTable.id, params.id))
    .returning();
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json((await import("@workspace/api-zod")).UpdateLeadStatusResponse.parse(serializeLead(lead)));
});

router.delete("/admin/leads/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid lead ID" });
    return;
  }
  await db.delete(bookingsTable).where(eq(bookingsTable.leadId, id));
  const [deleted] = await db.delete(leadsTable).where(eq(leadsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.status(204).end();
});

router.get("/admin/video", async (_req, res) => {
  const [video] = await db.select().from(videoAssetsTable).orderBy(desc(videoAssetsTable.createdAt)).limit(1);
  if (!video) {
    res.json(null);
    return;
  }
  res.json(GetAdminVideoResponse.parse(serializeVideo(video)));
});

router.post("/admin/video", async (req, res) => {
  const input = CreateVideoAssetBody.parse(req.body);
  const [video] = await db
    .insert(videoAssetsTable)
    .values({
      title: input.title,
      objectPath: input.objectPath,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      isPublished: false,
    })
    .returning();
  res.status(201).json(CreateVideoAssetResponse.parse(serializeVideo(video)));
});

router.patch("/admin/video/:id/publish", async (req, res) => {
  const params = PublishVideoAssetParams.parse(req.params);
  await db.update(videoAssetsTable).set({ isPublished: false });
  const [video] = await db
    .update(videoAssetsTable)
    .set({ isPublished: true })
    .where(eq(videoAssetsTable.id, params.id))
    .returning();
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  res.json(PublishVideoAssetResponse.parse(serializeVideo(video)));
});

router.get("/admin/availability", async (_req, res) => {
  await ensureAvailabilityInitialized();
  const rules = await db.select().from(availabilityRulesTable).orderBy(availabilityRulesTable.weekday);
  res.json(ListAvailabilityRulesResponse.parse(rules.map(serializeRule)));
});

router.post("/admin/availability/reset-defaults", async (_req, res) => {
  await ensureAvailabilityInitialized(true);
  const rules = await db.select().from(availabilityRulesTable).orderBy(availabilityRulesTable.weekday);
  res.json(ListAvailabilityRulesResponse.parse(rules.map(serializeRule)));
});

router.post("/admin/availability", async (req, res) => {
  const input = CreateAvailabilityRuleBody.parse(req.body);
  const [rule] = await db.insert(availabilityRulesTable).values({
    ...input,
    enabled: input.enabled ?? true,
  }).returning();
  res.status(201).json(CreateAvailabilityRuleResponse.parse(serializeRule(rule)));
});

router.delete("/admin/availability/:id", async (req, res) => {
  const params = DeleteAvailabilityRuleParams.parse(req.params);
  await db.delete(availabilityRulesTable).where(eq(availabilityRulesTable.id, params.id));
  res.status(204).end();
});

router.get("/admin/bookings", async (req, res) => {
  const input = ListAdminBookingsQueryParams.parse(req.query);
  const bookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.startsAt));
  const filtered = input.status ? bookings.filter((booking) => booking.status === input.status) : bookings;
  res.json(ListAdminBookingsResponse.parse(filtered.map(serializeBooking)));
});

router.patch("/admin/bookings/:id/approve", async (req, res) => {
  const params = ApproveBookingParams.parse(req.params);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.id)).limit(1);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const [updated] = await db
    .update(bookingsTable)
    .set({
      status: "approved",
    })
    .where(eq(bookingsTable.id, booking.id))
    .returning();
  await db.update(leadsTable).set({ status: "scheduled", updatedAt: new Date() }).where(eq(leadsTable.id, booking.leadId));
  res.json(ApproveBookingResponse.parse(serializeBooking(updated)));
});

router.patch("/admin/bookings/:id/status", async (req, res) => {
  const params = UpdateBookingStatusParams.parse(req.params);
  const input = UpdateBookingStatusBody.parse(req.body);
  if (!bookingStatuses.includes(input.status)) {
    res.status(400).json({ error: "Unsupported booking status" });
    return;
  }
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: input.status })
    .where(eq(bookingsTable.id, params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (input.status === "completed") {
    await db.update(leadsTable).set({ status: "met", updatedAt: new Date() }).where(eq(leadsTable.id, updated.leadId));
  }
  res.json(UpdateBookingStatusResponse.parse(serializeBooking(updated)));
});

router.get("/admin/calendar/status", async (_req, res) => {
  res.json({
    connected: false,
    provider: "none",
    calendarId: null,
    accountEmail: null,
    hasCredentials: false,
  });
});

router.get("/admin/calendar/calendars", async (_req, res) => {
  res.json([]);
});

export default router;
