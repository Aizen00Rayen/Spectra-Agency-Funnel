import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  Clock3,
  FileVideo,
  Gauge,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
  Video,
  X,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import {
  BookingStatus,
  LeadStatus,
  UploadRequestContentType,
  getGetAdminSummaryQueryKey,
  getGetAdminVideoQueryKey,
  getGetCalendarStatusQueryKey,
  getListAdminBookingsQueryKey,
  getListAdminLeadsQueryKey,
  getListAvailabilityRulesQueryKey,
  useApproveBooking,
  useCreateAvailabilityRule,
  useCreateVideoAsset,
  useDeleteAvailabilityRule,
  useGetAdminSummary,
  useGetAdminVideo,
  useGetCalendarStatus,
  useListAdminBookings,
  useListAdminLeads,
  useListAvailabilityRules,
  useListCalendars,
  usePublishVideoAsset,
  useRequestUploadUrl,
  useUpdateBookingStatus,
  useUpdateLeadStatus,
} from "@workspace/api-client-react";

const leadStatuses = [
  { value: LeadStatus.registered, label: "Registered", tone: "slate" },
  { value: LeadStatus.reviewing, label: "Reviewing", tone: "blue" },
  { value: LeadStatus.approved, label: "Approved", tone: "cyan" },
  { value: LeadStatus.refused, label: "Refused", tone: "rose" },
  { value: LeadStatus.scheduled, label: "Scheduled", tone: "violet" },
  { value: LeadStatus.met, label: "Met", tone: "amber" },
  { value: LeadStatus.fit, label: "Qualified", tone: "green" },
  { value: LeadStatus.not_fit, label: "Not a fit", tone: "rose" },
  { value: LeadStatus.nurture, label: "Nurture", tone: "gold" },
] as const;

const bookingStatuses = [
  { value: BookingStatus.requested, label: "Requested" },
  { value: BookingStatus.approved, label: "Approved" },
  { value: BookingStatus.cancelled, label: "Cancelled" },
  { value: BookingStatus.completed, label: "Completed" },
  { value: BookingStatus.no_show, label: "No show" },
] as const;

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value?: string | null, timezone?: string | null) {
  if (!value) return "—";
  return `${new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value))}${timezone ? ` · ${timezone}` : ""}`;
}

function initials(name?: string) {
  return (name || "SP").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function StateMessage({ kind, title, detail, onRetry }: { kind: "loading" | "empty" | "error" | "success"; title: string; detail?: string; onRetry?: () => void }) {
  const Icon = kind === "error" ? AlertCircle : kind === "success" ? Check : kind === "empty" ? Gauge : RefreshCw;
  return (
    <div className={`admin-state admin-state-${kind}`} data-testid={`state-${kind}`}>
      <span className="admin-state-icon"><Icon size={17} className={kind === "loading" ? "admin-spin" : ""} /></span>
      <div><strong>{title}</strong>{detail && <p>{detail}</p>}{onRetry && <button className="admin-text-button" onClick={onRetry} data-testid="button-retry">Try again <ArrowUpRight size={13} /></button>}</div>
    </div>
  );
}

function StatusPill({ value, booking = false }: { value: string; booking?: boolean }) {
  const item = booking ? bookingStatuses.find((status) => status.value === value) : leadStatuses.find((status) => status.value === value);
  return <span className={`admin-pill admin-pill-${booking ? value : item?.tone || "slate"}`} data-testid={`status-${value}`}>{item?.label || value.replaceAll("_", " ")}</span>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/video", label: "Video library", icon: Video },
    { href: "/admin/availability", label: "Availability", icon: Clock3 },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  ];
  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <img src="/assets/spectra-logo.jpeg" alt="Spectra" />
          <div><strong>SPECTRA</strong><span>OPERATING ROOM</span></div>
          <button className="admin-icon-button admin-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={17} /></button>
        </div>
        <div className="admin-sidebar-rule" />
        <p className="admin-nav-label">Workspace</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location === href ? "is-active" : ""} onClick={() => setMobileOpen(false)} data-testid={`link-admin-${label.toLowerCase().replaceAll(" ", "-")}`}><Icon size={16} /><span>{label}</span>{location === href && <ChevronRight size={14} className="admin-nav-arrow" />}</Link>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-secure-note"><ShieldCheck size={15} /><span><strong>Private workspace</strong><small>Session encrypted</small></span></div>
          <button className="admin-user" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL || "/" })} data-testid="button-sign-out"><span className="admin-avatar">{initials(user?.fullName || user?.firstName || "SP")}</span><span className="admin-user-copy"><strong>{user?.firstName || "Studio admin"}</strong><small>Sign out</small></span><LogOut size={14} /></button>
        </div>
      </aside>
      {mobileOpen && <button className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-navigation-backdrop" />}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={19} /></button>
          <div><p className="admin-kicker">Spectra / secure workspace</p><p className="admin-breadcrumb">Operating room <ChevronRight size={13} /> {nav.find((item) => item.href === location)?.label || "Overview"}</p></div>
          <div className="admin-topbar-right"><span className="admin-live"><i /> Live data</span><div className="admin-top-avatar">{initials(user?.fullName || user?.firstName || "SP")}</div></div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function PageHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="admin-page-header"><div><p className="admin-kicker">{eyebrow}</p><h1>{title}</h1><p className="admin-page-detail">{detail}</p></div>{action && <div className="admin-page-action">{action}</div>}</div>;
}

export function AdminOverview() {
  const summary = useGetAdminSummary();
  const calendar = useGetCalendarStatus();
  const video = useGetAdminVideo();
  const { data, isLoading, isError, refetch } = summary;
  const metrics = [
    { label: "Total leads", value: data?.totalLeads ?? "—", note: `${data?.registered ?? 0} newly registered`, icon: Users },
    { label: "Awaiting approval", value: data?.awaitingApproval ?? "—", note: "Needs a decision", icon: ShieldCheck },
    { label: "Upcoming meetings", value: data?.upcomingMeetings ?? "—", note: "Confirmed conversations", icon: Calendar },
    { label: "Qualified pipeline", value: data?.approved ?? "—", note: "Approved opportunities", icon: Gauge },
  ];
  return <AdminShell><PageHeader eyebrow="Workspace overview" title="Good morning, make the next move." detail="A concise view of the decisions waiting for the studio today." action={<Link className="admin-button admin-button-primary" href="/admin/leads">Review leads <ArrowUpRight size={15} /></Link>} />
    {isLoading ? <div className="admin-metric-grid">{[1, 2, 3, 4].map((item) => <div className="admin-skeleton admin-metric-skeleton" key={item} />)}</div> : isError ? <StateMessage kind="error" title="Summary unavailable" detail="We couldn't reach the workspace data." onRetry={() => refetch()} /> : <div className="admin-metric-grid">{metrics.map(({ label, value, note, icon: Icon }) => <div className="admin-metric-card" key={label} data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}><div className="admin-metric-top"><span>{label}</span><Icon size={16} /></div><strong>{value}</strong><small>{note}</small></div>)}</div>}
    <div className="admin-overview-grid">
      <section className="admin-panel admin-panel-large"><div className="admin-panel-heading"><div><p className="admin-kicker">Pipeline pulse</p><h2>What needs attention</h2></div><Link href="/admin/leads" className="admin-panel-link">Open pipeline <ArrowUpRight size={13} /></Link></div><div className="admin-pulse-list"><PulseRow label="New registrations" value={data?.registered ?? 0} tone="blue" href="/admin/leads" /><PulseRow label="Awaiting approval" value={data?.awaitingApproval ?? 0} tone="amber" href="/admin/leads" /><PulseRow label="Confirmed meetings" value={data?.upcomingMeetings ?? 0} tone="green" href="/admin/bookings" /></div></section>
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Readiness</p><h2>Studio systems</h2></div><Settings2 size={16} className="admin-muted-icon" /></div><div className="admin-readiness-list"><ReadinessRow label="VSL published" ready={Boolean(data?.publishedVideo || video.data?.isPublished)} href="/admin/video" /><ReadinessRow label="Calendar connected" ready={Boolean(data?.calendarConnected || calendar.data?.connected)} href="/admin/bookings" /><ReadinessRow label="Availability configured" ready={true} href="/admin/availability" /></div></section>
    </div>
    <section className="admin-panel admin-brief"><div className="admin-panel-heading"><div><p className="admin-kicker">Operating note</p><h2>Keep the funnel honest.</h2></div><span className="admin-note-date">Updated just now</span></div><p>Every lead deserves a clear next step. Review context before moving a registration, and let the public promise stay aligned with what the studio can actually deliver.</p><div className="admin-brief-footer"><span><Globe2 size={14} /> Public funnel is live</span><Link href="/admin/availability" className="admin-text-button">Check capacity <ArrowUpRight size={13} /></Link></div></section>
  </AdminShell>;
}

function PulseRow({ label, value, tone, href }: { label: string; value: number; tone: string; href: string }) {
  return <Link href={href} className="admin-pulse-row" data-testid={`pulse-${label.toLowerCase().replaceAll(" ", "-")}`}><span className={`admin-pulse-dot ${tone}`} /><span>{label}</span><strong>{value}</strong><ChevronRight size={14} /></Link>;
}
function ReadinessRow({ label, ready, href }: { label: string; ready: boolean; href: string }) {
  return <Link href={href} className="admin-readiness-row"><span className={ready ? "admin-check is-ready" : "admin-check"}>{ready ? <Check size={12} /> : <X size={12} />}</span><span>{label}</span><small>{ready ? "Ready" : "Needs setup"}</small><ChevronRight size={14} /></Link>;
}

export function AdminLeads() {
  const [filter, setFilter] = useState<string>("all");
  const params = filter === "all" ? undefined : { status: filter as typeof LeadStatus[keyof typeof LeadStatus] };
  const query = useListAdminLeads(params);
  const mutation = useUpdateLeadStatus();
  const client = useQueryClient();
  const leads = query.data || [];
  const update = (id: number, status: string) => mutation.mutate({ id, data: { status: status as typeof LeadStatus[keyof typeof LeadStatus] } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListAdminLeadsQueryKey(params) }); client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); } });
  return <AdminShell><PageHeader eyebrow="Lead pipeline" title="Make every conversation legible." detail="Review context, choose the next honest step, and keep the pipeline moving." action={<select className="admin-select admin-filter-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter leads" data-testid="select-lead-status"><option value="all">All statuses</option>{leadStatuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select>} />
    <section className="admin-panel admin-table-panel">{query.isLoading ? <div className="admin-table-skeleton">{[1, 2, 3, 4].map((item) => <div key={item} className="admin-skeleton admin-row-skeleton" />)}</div> : query.isError ? <StateMessage kind="error" title="Leads unavailable" detail="The pipeline could not be loaded." onRetry={() => query.refetch()} /> : leads.length === 0 ? <StateMessage kind="empty" title="No leads in this view" detail="New consultation requests will appear here." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Lead</th><th>Company</th><th>Received</th><th>Status</th><th>Next step</th><th /></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} data-testid={`row-lead-${lead.id}`}><td><div className="admin-person"><span className="admin-avatar">{initials(lead.name)}</span><span><strong>{lead.name}</strong><small>{lead.email}</small></span></div></td><td><span className="admin-company">{lead.company}</span><small className="admin-secondary">{lead.interestedServices?.slice(0, 2).join(" · ") || "General consultation"}</small></td><td><span className="admin-secondary">{formatDate(lead.createdAt)}</span></td><td><StatusPill value={lead.status} /></td><td><select className="admin-select admin-status-select" value={lead.status} disabled={mutation.isPending} onChange={(event) => update(lead.id, event.target.value)} aria-label={`Change status for ${lead.name}`} data-testid={`select-lead-status-${lead.id}`}>{leadStatuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></td><td><button className="admin-more-button" title={lead.projectDescription} data-testid={`button-lead-detail-${lead.id}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>}</section>
  </AdminShell>;
}

export function AdminVideo() {
  const query = useGetAdminVideo();
  const requestUpload = useRequestUploadUrl();
  const createAsset = useCreateVideoAsset();
  const publish = usePublishVideoAsset();
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<"idle" | "requesting" | "uploading" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const accept = "video/mp4,video/webm,video/quicktime";
  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim()) { setMessage("Add a title and choose a supported video file."); return; }
    try {
      setMessage(""); setProgress("requesting");
      const contentType = file.type as typeof UploadRequestContentType[keyof typeof UploadRequestContentType];
      const response = await requestUpload.mutateAsync({ data: { name: file.name, size: file.size, contentType } });
      setProgress("uploading");
      const direct = await fetch(response.uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!direct.ok) throw new Error("Direct upload failed");
      setProgress("saving");
      await createAsset.mutateAsync({ data: { title: title.trim(), objectPath: response.objectPath, mimeType: file.type, sizeBytes: file.size } });
      setProgress("success"); setMessage("The VSL is uploaded and ready to review."); setFile(null); setTitle("");
      client.invalidateQueries({ queryKey: getGetAdminVideoQueryKey() }); client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    } catch { setProgress("error"); setMessage("Upload could not be completed. Nothing was published."); }
  };
  const current = query.data;
  return <AdminShell><PageHeader eyebrow="Video library" title="Publish the lesson with confidence." detail="The public lesson is a promise. Keep its source file versioned, visible, and deliberate." />
    <div className="admin-video-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Current VSL</p><h2>{current?.title || "No published lesson"}</h2></div>{current && <StatusPill value={current.isPublished ? "Published" : "Draft"} />}</div>{query.isLoading ? <div className="admin-skeleton admin-video-skeleton" /> : query.isError ? <StateMessage kind="error" title="Video status unavailable" detail="Try again in a moment." onRetry={() => query.refetch()} /> : current ? <div className="admin-video-preview"><div className="admin-video-placeholder"><Play size={22} /><span>Video asset ready</span></div><div className="admin-video-meta"><span><FileVideo size={14} />{current.mimeType}</span><span>{(current.sizeBytes / 1024 / 1024).toFixed(1)} MB</span><span>Added {formatDate(current.createdAt)}</span></div>{!current.isPublished && <button className="admin-button admin-button-primary" onClick={() => publish.mutate({ id: current.id }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminVideoQueryKey() }); client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); } })} disabled={publish.isPending} data-testid="button-publish-video">{publish.isPending ? "Publishing…" : "Publish to public lesson"} <ArrowUpRight size={15} /></button>}</div> : <StateMessage kind="empty" title="Nothing uploaded yet" detail="Upload the approved lesson source to make it available to the public funnel." />}</section>
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">New asset</p><h2>Upload a VSL</h2></div><UploadCloud size={17} className="admin-muted-icon" /></div><form className="admin-upload-form" onSubmit={upload}><label className="admin-field"><span>Asset title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="The quiet decisions behind growth" data-testid="input-video-title" /></label><label className="admin-dropzone"><input type="file" accept={accept} onChange={(event) => setFile(event.target.files?.[0] || null)} data-testid="input-video-file" /><UploadCloud size={24} /><strong>{file ? file.name : "Choose a video file"}</strong><small>MP4, WebM, or QuickTime · up to 500 MB</small></label>{progress !== "idle" && progress !== "error" && progress !== "success" && <div className="admin-upload-status"><span className="admin-upload-line"><i style={{ width: progress === "requesting" ? "25%" : progress === "uploading" ? "65%" : "90%" }} /></span><small>{progress === "requesting" ? "Requesting secure upload…" : progress === "uploading" ? "Uploading directly to object storage…" : "Saving asset metadata…"}</small></div>}{message && <p className={`admin-form-message ${progress === "error" ? "is-error" : progress === "success" ? "is-success" : ""}`}>{message}</p>}<button className="admin-button admin-button-primary admin-full-button" disabled={progress !== "idle" && progress !== "error" && progress !== "success"} data-testid="button-upload-video"><UploadCloud size={15} /> Upload securely</button><small className="admin-form-caption">Your video goes directly to object storage through a presigned URL. The API never receives the file bytes.</small></form></section></div>
  </AdminShell>;
}

export function AdminAvailability() {
  const query = useListAvailabilityRules();
  const create = useCreateAvailabilityRule();
  const remove = useDeleteAvailabilityRule();
  const client = useQueryClient();
  const [form, setForm] = useState({ weekday: 0, startTime: "09:00", endTime: "17:00", timezone: "Europe/London" });
  const rules = query.data || [];
  const addRule = (event: FormEvent) => { event.preventDefault(); create.mutate({ data: { ...form, weekday: Number(form.weekday), enabled: true } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListAvailabilityRulesQueryKey() }); } }); };
  const grouped = useMemo(() => weekDays.map((label, weekday) => ({ label, weekday, rules: rules.filter((rule) => rule.weekday === weekday) })), [rules]);
  return <AdminShell><PageHeader eyebrow="Capacity settings" title="Make availability easy to trust." detail="A clear weekly rhythm helps good-fit clients choose a time without a back-and-forth." action={<span className="admin-timezone-badge"><Globe2 size={14} /> {rules[0]?.timezone || form.timezone}</span>} />
    <div className="admin-availability-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Weekly hours</p><h2>Consultation windows</h2></div><span className="admin-secondary">{rules.length} active {rules.length === 1 ? "window" : "windows"}</span></div>{query.isLoading ? <div className="admin-week-skeleton">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="admin-skeleton admin-day-skeleton" />)}</div> : query.isError ? <StateMessage kind="error" title="Availability unavailable" detail="We could not load your weekly rules." onRetry={() => query.refetch()} /> : <div className="admin-week-list">{grouped.map((day) => <div className={`admin-day-row ${day.rules.length ? "" : "is-empty"}`} key={day.weekday}><strong>{day.label}</strong><div className="admin-day-rules">{day.rules.length ? day.rules.map((rule) => <div className="admin-time-rule" key={rule.id}><Clock3 size={14} /><span>{rule.startTime} — {rule.endTime}</span><small>{rule.timezone}</small><button className="admin-delete-button" onClick={() => remove.mutate({ id: rule.id }, { onSuccess: () => client.invalidateQueries({ queryKey: getListAvailabilityRulesQueryKey() }) })} aria-label={`Delete ${day.label} availability`} data-testid={`button-delete-rule-${rule.id}`}><Trash2 size={13} /></button></div>) : <span className="admin-day-off">No consultation window</span>}</div></div>)}</div>}</section>
      <section className="admin-panel admin-add-rule"><div className="admin-panel-heading"><div><p className="admin-kicker">Add a window</p><h2>Open capacity</h2></div><Plus size={17} className="admin-muted-icon" /></div><form onSubmit={addRule} className="admin-rule-form"><label className="admin-field"><span>Day</span><select className="admin-select" value={form.weekday} onChange={(event) => setForm({ ...form, weekday: Number(event.target.value) })} data-testid="select-availability-day">{weekDays.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label><div className="admin-field-grid"><label className="admin-field"><span>Starts</span><input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} data-testid="input-availability-start" /></label><label className="admin-field"><span>Ends</span><input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} data-testid="input-availability-end" /></label></div><label className="admin-field"><span>Timezone</span><input value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} data-testid="input-availability-timezone" /></label><button className="admin-button admin-button-primary admin-full-button" disabled={create.isPending} data-testid="button-add-availability"><Plus size={15} /> {create.isPending ? "Saving…" : "Add availability"}</button></form></section></div>
  </AdminShell>;
}

export function AdminBookings() {
  const query = useListAdminBookings();
  const calendar = useGetCalendarStatus();
  const calendars = useListCalendars();
  const approve = useApproveBooking();
  const update = useUpdateBookingStatus();
  const client = useQueryClient();
  const refresh = () => { query.refetch(); calendar.refetch(); calendars.refetch(); };
  const mutateBooking = (id: number, action: "approve" | "status", status?: string) => {
    const onSuccess = () => { client.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() }); client.invalidateQueries({ queryKey: getGetCalendarStatusQueryKey() }); };
    if (action === "approve") approve.mutate({ id }, { onSuccess });
    else update.mutate({ id, data: { status: status as typeof BookingStatus[keyof typeof BookingStatus] } }, { onSuccess });
  };
  return <AdminShell><PageHeader eyebrow="Booking requests" title="Confirm the room is ready." detail="Approve the right conversations, keep client context close, and make calendar state visible." action={<div className={`admin-calendar-status ${calendar.data?.connected ? "is-connected" : ""}`}><span /><span>{calendar.isLoading ? "Checking calendar…" : calendar.data?.connected ? "Google Calendar connected" : "Calendar needs attention"}</span></div>} />
    <div className="admin-calendar-strip"><div className="admin-calendar-copy"><div className="admin-calendar-icon"><Calendar size={18} /></div><div><strong>{calendar.data?.connected ? "Calendar is ready for approvals" : "Connect Google Calendar before approving"}</strong><p>{calendar.data?.connected ? `${calendars.data?.find((item) => item.id === calendar.data?.calendarId)?.summary || "Primary calendar"} · ${calendar.data?.provider || "Google Calendar"}` : "Approved bookings will create calendar events once the connection is active."}</p></div></div><button className="admin-button admin-button-secondary" onClick={refresh} data-testid="button-refresh-calendar"><RefreshCw size={14} /> Refresh connection</button></div>
    <section className="admin-panel admin-table-panel">{query.isLoading ? <div className="admin-table-skeleton">{[1, 2, 3].map((item) => <div key={item} className="admin-skeleton admin-row-skeleton" />)}</div> : query.isError ? <StateMessage kind="error" title="Bookings unavailable" detail="We could not load booking requests." onRetry={refresh} /> : !query.data?.length ? <StateMessage kind="empty" title="No booking requests" detail="Approved leads will appear here when they choose a consultation time." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Client</th><th>Requested time</th><th>Status</th><th>Calendar</th><th>Decision</th></tr></thead><tbody>{query.data.map((booking) => <tr key={booking.id} data-testid={`row-booking-${booking.id}`}><td><div className="admin-person"><span className="admin-avatar">{initials(booking.clientName)}</span><span><strong>{booking.clientName}</strong><small>{booking.clientEmail}</small></span></div></td><td><span className="admin-company">{formatDateTime(booking.startsAt, booking.timezone)}</span><small className="admin-secondary">{formatDateTime(booking.endsAt, booking.timezone).split(" · ")[1] || "Consultation"}</small></td><td><StatusPill value={booking.status} booking /></td><td>{booking.meetingUrl ? <a className="admin-panel-link" href={booking.meetingUrl} target="_blank" rel="noreferrer" data-testid={`link-meeting-${booking.id}`}>Meeting link <ArrowUpRight size={12} /></a> : <span className="admin-secondary">{booking.calendarEventId ? "Event created" : "Not scheduled"}</span>}</td><td><div className="admin-action-group">{booking.status === BookingStatus.requested && <button className="admin-button admin-button-primary admin-button-small" onClick={() => mutateBooking(booking.id, "approve")} disabled={approve.isPending || !calendar.data?.connected} data-testid={`button-approve-booking-${booking.id}`}><Check size={13} /> Approve</button>}<select className="admin-select admin-status-select" value={booking.status} onChange={(event) => mutateBooking(booking.id, "status", event.target.value)} data-testid={`select-booking-status-${booking.id}`}><option value="" disabled>Update status</option>{bookingStatuses.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select></div></td></tr>)}</tbody></table></div>}</section>
  </AdminShell>;
}