import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FileVideo,
  Gauge,
  Globe2,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  MoreHorizontal,
  Phone,
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
import {
  BookingStatus,
  LeadStatus,
  UploadRequestContentType,
  getGetAdminSummaryQueryKey,
  getGetAdminVideoQueryKey,
  getListAdminBookingsQueryKey,
  getListAdminLeadsQueryKey,
  getListAvailabilityRulesQueryKey,
  useApproveBooking,
  useCreateAvailabilityRule,
  useCreateVideoAsset,
  useDeleteAvailabilityRule,
  useGetAdminSummary,
  useGetAdminVideo,
  useListAdminBookings,
  useListAdminLeads,
  useListAvailabilityRules,
  usePublishVideoAsset,
  useRequestUploadUrl,
  useUpdateBookingStatus,
  useUpdateLeadStatus,
} from "@workspace/api-client-react";
import { apiUrl } from "@/lib/api";
import { extractGoogleDriveEmbedUrl } from "@/components/ProtectedVideoPlayer";
import { useAdminLang, type AdminLang } from "./admin-i18n";

function getAdminSessionUser(): { fullName: string; firstName: string; email: string } {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("spectra_admin_user") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const email = parsed.email || "admin@spectra.agency";
      const fullName = parsed.name || parsed.fullName || email;
      const firstName = fullName.split(" ")[0] || "Admin";
      return { fullName, firstName, email };
    }
  } catch {}
  return { fullName: "Studio Admin", firstName: "Admin", email: "admin@spectra.agency" };
}

export function handleAdminSignOut() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("spectra_admin_token") : null;
    fetch(apiUrl("/api/admin/logout"), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
  } catch {}
  if (typeof window !== "undefined") {
    localStorage.removeItem("spectra_admin_token");
    localStorage.removeItem("spectra_admin_user");
    window.location.href = "/admin/login";
  }
}

const leadStatusStyles: Record<
  string,
  { bg: string; border: string; color: string; dot: string }
> = {
  [LeadStatus.registered]: {
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.3)",
    color: "#cbd5e1",
    dot: "#94a3b8",
  },
  [LeadStatus.reviewing]: {
    bg: "rgba(59, 130, 246, 0.14)",
    border: "rgba(59, 130, 246, 0.38)",
    color: "#93c5fd",
    dot: "#3b82f6",
  },
  [LeadStatus.approved]: {
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.38)",
    color: "#6ee7b7",
    dot: "#10b981",
  },
  [LeadStatus.scheduled]: {
    bg: "rgba(139, 92, 246, 0.15)",
    border: "rgba(139, 92, 246, 0.38)",
    color: "#c4b5fd",
    dot: "#8b5cf6",
  },
  [LeadStatus.met]: {
    bg: "rgba(6, 182, 212, 0.14)",
    border: "rgba(6, 182, 212, 0.38)",
    color: "#67e8f9",
    dot: "#06b6d4",
  },
  [LeadStatus.fit]: {
    bg: "rgba(34, 197, 94, 0.18)",
    border: "rgba(34, 197, 94, 0.45)",
    color: "#86efac",
    dot: "#22c55e",
  },
  [LeadStatus.nurture]: {
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.38)",
    color: "#fde047",
    dot: "#f59e0b",
  },
  [LeadStatus.refused]: {
    bg: "rgba(244, 63, 94, 0.13)",
    border: "rgba(244, 63, 94, 0.35)",
    color: "#fda4af",
    dot: "#f43f5e",
  },
  [LeadStatus.not_fit]: {
    bg: "rgba(225, 29, 72, 0.13)",
    border: "rgba(225, 29, 72, 0.38)",
    color: "#fecdd3",
    dot: "#e11d48",
  },
};

const bookingStatusStyles: Record<
  string,
  { bg: string; border: string; color: string; dot: string }
> = {
  [BookingStatus.requested]: {
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.35)",
    color: "#fde047",
    dot: "#f59e0b",
  },
  [BookingStatus.approved]: {
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.38)",
    color: "#6ee7b7",
    dot: "#10b981",
  },
  [BookingStatus.completed]: {
    bg: "rgba(59, 130, 246, 0.14)",
    border: "rgba(59, 130, 246, 0.35)",
    color: "#93c5fd",
    dot: "#3b82f6",
  },
  [BookingStatus.cancelled]: {
    bg: "rgba(239, 68, 68, 0.13)",
    border: "rgba(239, 68, 68, 0.35)",
    color: "#fca5a5",
    dot: "#ef4444",
  },
  [BookingStatus.no_show]: {
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.3)",
    color: "#cbd5e1",
    dot: "#94a3b8",
  },
};

const leadStatusTones: Record<string, string> = {
  [LeadStatus.registered]: "slate",
  [LeadStatus.reviewing]: "blue",
  [LeadStatus.approved]: "green",
  [LeadStatus.refused]: "rose",
  [LeadStatus.scheduled]: "violet",
  [LeadStatus.met]: "cyan",
  [LeadStatus.fit]: "lime",
  [LeadStatus.not_fit]: "darkrose",
  [LeadStatus.nurture]: "amber",
};

const leadStatusesKeys = [
  LeadStatus.registered,
  LeadStatus.reviewing,
  LeadStatus.approved,
  LeadStatus.refused,
  LeadStatus.scheduled,
  LeadStatus.met,
  LeadStatus.fit,
  LeadStatus.not_fit,
  LeadStatus.nurture,
] as const;

const bookingStatusesKeys = [
  BookingStatus.requested,
  BookingStatus.approved,
  BookingStatus.cancelled,
  BookingStatus.completed,
  BookingStatus.no_show,
] as const;

function initials(name?: string) {
  return (name || "SP").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function StateMessage({
  kind,
  title,
  detail,
  onRetry,
}: {
  kind: "loading" | "empty" | "error" | "success";
  title: string;
  detail?: string;
  onRetry?: () => void;
}) {
  const { t } = useAdminLang();
  const Icon = kind === "error" ? AlertCircle : kind === "success" ? Check : kind === "empty" ? Gauge : RefreshCw;
  return (
    <div className={`admin-state admin-state-${kind}`} data-testid={`state-${kind}`}>
      <span className="admin-state-icon">
        <Icon size={17} className={kind === "loading" ? "admin-spin" : ""} />
      </span>
      <div>
        <strong>{title}</strong>
        {detail && <p>{detail}</p>}
        {onRetry && (
          <button className="admin-text-button" onClick={onRetry} data-testid="button-retry">
            {t.common.tryAgain} <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ value, booking = false }: { value: string; booking?: boolean }) {
  const { t } = useAdminLang();
  const label = booking
    ? t.bookingStatuses[value] || value.replaceAll("_", " ")
    : t.leadStatuses[value] || value.replaceAll("_", " ");

  const style = booking ? bookingStatusStyles[value] : leadStatusStyles[value];

  if (style) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          minHeight: "22px",
          padding: "2px 8px",
          borderRadius: "5px",
          border: `1px solid ${style.border}`,
          backgroundColor: style.bg,
          color: style.color,
          fontFamily: "var(--font-code)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
        data-testid={`status-${value}`}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: style.dot,
            boxShadow: `0 0 6px ${style.dot}`,
            flexShrink: 0,
          }}
        />
        {label}
      </span>
    );
  }

  const tone = !booking && leadStatusTones[value] ? leadStatusTones[value] : "slate";
  return (
    <span className={`admin-pill admin-pill-${booking ? value : tone}`} data-testid={`status-${value}`}>
      {label}
    </span>
  );
}

function AdminLangPicker({ className = "" }: { className?: string }) {
  const { lang, setLang } = useAdminLang();
  return (
    <div className={`admin-lang-picker ${className}`} aria-label="Admin language selector">
      {(["en", "fr", "ar"] as AdminLang[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLang(item)}
          className={`admin-lang-btn ${lang === item ? "is-active" : ""}`}
          data-testid={`button-admin-lang-${item}`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getAdminSessionUser();
  const { lang, setLang, t, isRtl } = useAdminLang();

  const nav = [
    { href: "/admin", label: t.nav.overview, icon: LayoutDashboard },
    { href: "/admin/leads", label: t.nav.leads, icon: Users },
    { href: "/admin/testimonials", label: t.nav.feedback, icon: MessageSquareQuote },
    { href: "/admin/portfolio", label: t.nav.portfolio, icon: Globe2 },
    { href: "/admin/video", label: t.nav.video, icon: Video },
    { href: "/admin/availability", label: t.nav.availability, icon: Clock3 },
    { href: "/admin/bookings", label: t.nav.bookings, icon: Calendar },
  ];

  return (
    <div className="admin-app" dir={isRtl ? "rtl" : "ltr"}>
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <img src="/assets/spectra-logo.jpeg" alt="Spectra" />
          <div>
            <strong>SPECTRA</strong>
            <span>{t.nav.operatingRoom.toUpperCase()}</span>
          </div>
          <button
            className="admin-icon-button admin-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            data-testid="button-close-navigation"
          >
            <X size={17} />
          </button>
        </div>
        <div className="admin-sidebar-rule" />

        {/* Language selector in sidebar */}
        <div style={{ padding: "0 18px 12px" }}>
          <div className="admin-lang-picker" style={{ width: "100%", justifyContent: "space-between" }}>
            {(["en", "fr", "ar"] as AdminLang[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLang(item)}
                className={`admin-lang-btn ${lang === item ? "is-active" : ""}`}
                style={{ flex: 1, textAlign: "center" }}
                data-testid={`button-sidebar-lang-${item}`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <p className="admin-nav-label">{t.nav.workspace}</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={location === href ? "is-active" : ""}
              onClick={() => setMobileOpen(false)}
              data-testid={`link-admin-${href.replace("/admin", "") || "overview"}`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {location === href && <ChevronRight size={14} className="admin-nav-arrow" />}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-secure-note">
            <ShieldCheck size={15} />
            <span>
              <strong>{t.nav.privateWorkspace}</strong>
              <small>{t.nav.sessionEncrypted}</small>
            </span>
          </div>
          <button className="admin-user" onClick={handleAdminSignOut} data-testid="button-sign-out">
            <span className="admin-avatar">{initials(user?.fullName || user?.firstName || "SP")}</span>
            <span className="admin-user-copy">
              <strong>{user?.firstName || "Studio admin"}</strong>
              <small>{t.nav.signOut} ({user?.email})</small>
            </span>
            <LogOut size={14} />
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          data-testid="button-navigation-backdrop"
        />
      )}
      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            data-testid="button-open-navigation"
          >
            <Menu size={19} />
          </button>
          <div>
            <p className="admin-kicker">{t.nav.secureWorkspace}</p>
            <p className="admin-breadcrumb">
              {t.nav.operatingRoom} <ChevronRight size={13} /> {nav.find((item) => item.href === location)?.label || t.nav.overview}
            </p>
          </div>
          <div className="admin-topbar-right">
            {/* Topbar Language Selector */}
            <AdminLangPicker />
            <span className="admin-live">
              <i /> {t.nav.liveData}
            </span>
            <div className="admin-top-avatar">{initials(user?.fullName || user?.firstName || "SP")}</div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="admin-page-detail">{detail}</p>
      </div>
      {action && <div className="admin-page-action">{action}</div>}
    </div>
  );
}

export function AdminOverview() {
  const summary = useGetAdminSummary();
  const video = useGetAdminVideo();
  const { data, isLoading, isError, refetch } = summary;
  const { t } = useAdminLang();

  const metrics = [
    { label: t.overview.totalLeads, value: data?.totalLeads ?? "—", note: `${data?.registered ?? 0} ${t.overview.newlyRegistered}`, icon: Users },
    { label: t.overview.awaitingApproval, value: data?.awaitingApproval ?? "—", note: t.overview.needsDecision, icon: ShieldCheck },
    { label: t.overview.upcomingMeetings, value: data?.upcomingMeetings ?? "—", note: t.overview.confirmedConversations, icon: Calendar },
    { label: t.overview.qualifiedPipeline, value: data?.approved ?? "—", note: t.overview.approvedOpportunities, icon: Gauge },
  ];

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t.overview.eyebrow}
        title={t.overview.title}
        detail={t.overview.detail}
        action={
          <Link className="admin-button admin-button-primary" href="/admin/leads">
            {t.overview.reviewLeads} <ArrowUpRight size={15} />
          </Link>
        }
      />
      {isLoading ? (
        <div className="admin-metric-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="admin-skeleton admin-metric-skeleton" key={item} />
          ))}
        </div>
      ) : isError ? (
        <StateMessage
          kind="error"
          title="Summary unavailable"
          detail="We couldn't reach the workspace data."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="admin-metric-grid">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <div className="admin-metric-card" key={label} data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}>
              <div className="admin-metric-top">
                <span>{label}</span>
                <Icon size={16} />
              </div>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
      )}
      <div className="admin-overview-grid">
        <section className="admin-panel admin-panel-large">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.overview.pipelinePulse}</p>
              <h2>{t.overview.whatNeedsAttention}</h2>
            </div>
            <Link href="/admin/leads" className="admin-panel-link">
              {t.overview.openPipeline} <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="admin-pulse-list">
            <PulseRow label={t.overview.newRegistrations} value={data?.registered ?? 0} tone="blue" href="/admin/leads" />
            <PulseRow label={t.overview.awaitingApproval} value={data?.awaitingApproval ?? 0} tone="amber" href="/admin/leads" />
            <PulseRow label={t.overview.confirmedMeetings} value={data?.upcomingMeetings ?? 0} tone="green" href="/admin/bookings" />
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.overview.readiness}</p>
              <h2>{t.overview.studioSystems}</h2>
            </div>
            <Settings2 size={16} className="admin-muted-icon" />
          </div>
          <div className="admin-readiness-list">
            <ReadinessRow
              label={t.overview.vslPublished}
              ready={Boolean(data?.publishedVideo || video.data?.isPublished)}
              href="/admin/video"
              readyLabel={t.overview.ready}
              needsSetupLabel={t.overview.needsSetup}
            />
            <ReadinessRow
              label={t.overview.availabilityConfigured}
              ready={true}
              href="/admin/availability"
              readyLabel={t.overview.ready}
              needsSetupLabel={t.overview.needsSetup}
            />
          </div>
        </section>
      </div>
      <section className="admin-panel admin-brief">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-kicker">{t.overview.operatingNote}</p>
            <h2>{t.overview.keepFunnelHonest}</h2>
          </div>
          <span className="admin-note-date">{t.overview.updatedJustNow}</span>
        </div>
        <p>{t.overview.noteParagraph}</p>
        <div className="admin-brief-footer">
          <span>
            <Globe2 size={14} /> {t.overview.publicFunnelLive}
          </span>
          <Link href="/admin/availability" className="admin-text-button">
            {t.overview.checkCapacity} <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}

function PulseRow({ label, value, tone, href }: { label: string; value: number; tone: string; href: string }) {
  return (
    <Link href={href} className="admin-pulse-row" data-testid={`pulse-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <span className={`admin-pulse-dot ${tone}`} />
      <span>{label}</span>
      <strong>{value}</strong>
      <ChevronRight size={14} />
    </Link>
  );
}

function ReadinessRow({
  label,
  ready,
  href,
  readyLabel = "Ready",
  needsSetupLabel = "Needs setup",
}: {
  label: string;
  ready: boolean;
  href: string;
  readyLabel?: string;
  needsSetupLabel?: string;
}) {
  return (
    <Link href={href} className="admin-readiness-row">
      <span className={ready ? "admin-check is-ready" : "admin-check"}>
        {ready ? <Check size={12} /> : <X size={12} />}
      </span>
      <span>{label}</span>
      <small>{ready ? readyLabel : needsSetupLabel}</small>
      <ChevronRight size={14} />
    </Link>
  );
}

export function AdminLeads() {
  const [filter, setFilter] = useState<string>("all");
  const params = filter === "all" ? undefined : { status: filter as typeof LeadStatus[keyof typeof LeadStatus] };
  const query = useListAdminLeads(params);
  const mutation = useUpdateLeadStatus();
  const client = useQueryClient();
  const { t, formatAdminDate } = useAdminLang();

  type LeadItem = NonNullable<typeof query.data>[number];

  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<LeadItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("spectra_admin_token") : null;
  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const leads = query.data || [];
  const update = (id: number, status: string) =>
    mutation.mutate(
      { id, data: { status: status as typeof LeadStatus[keyof typeof LeadStatus] } },
      {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getListAdminLeadsQueryKey(params) });
          client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
          if (selectedLead && selectedLead.id === id) {
            setSelectedLead({ ...selectedLead, status: status as typeof LeadStatus[keyof typeof LeadStatus] });
          }
        },
      }
    );

  const handleDeleteLead = async (id: number) => {
    try {
      setIsDeleting(true);
      const res = await fetch(apiUrl(`/api/admin/leads/${id}`), {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete lead");
      }
      client.invalidateQueries({ queryKey: getListAdminLeadsQueryKey(params) });
      client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
      client.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
      setLeadToDelete(null);
      if (selectedLead?.id === id) setSelectedLead(null);
      setOpenMenuId(null);
      setToast({ kind: "success", text: t.leads.deleteLeadSuccess });
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t.leads.eyebrow}
        title={t.leads.title}
        detail={t.leads.detail}
        action={
          <select
            className="admin-select admin-filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter leads"
            data-testid="select-lead-status"
          >
            <option value="all">{t.leads.allStatuses}</option>
            {leadStatusesKeys.map((item) => (
              <option value={item} key={item}>
                {t.leadStatuses[item] || item}
              </option>
            ))}
          </select>
        }
      />

      {toast && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: toast.kind === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${toast.kind === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: toast.kind === "success" ? "#a7f3d0" : "#fca5a5",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {toast.kind === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="admin-panel admin-table-panel">
        {query.isLoading ? (
          <div className="admin-table-skeleton">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="admin-skeleton admin-row-skeleton" />
            ))}
          </div>
        ) : query.isError ? (
          <StateMessage
            kind="error"
            title="Leads unavailable"
            detail="The pipeline could not be loaded."
            onRetry={() => query.refetch()}
          />
        ) : leads.length === 0 ? (
          <StateMessage kind="empty" title={t.leads.emptyTitle} detail={t.leads.emptyDetail} />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t.leads.lead}</th>
                  <th>{t.leads.company}</th>
                  <th>{t.leads.received}</th>
                  <th>{t.leads.status}</th>
                  <th>{t.leads.nextStep}</th>
                  <th style={{ width: "40px", textAlign: "right" }} />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} data-testid={`row-lead-${lead.id}`}>
                    <td>
                      <div
                        className="admin-person"
                        onClick={() => setSelectedLead(lead)}
                        style={{ cursor: "pointer" }}
                        title={t.leads.viewDetails}
                      >
                        <span className="admin-avatar">{initials(lead.name)}</span>
                        <span>
                          <strong style={{ color: "#dbeaf8" }}>{lead.name}</strong>
                          <small>{lead.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-company">{lead.company}</span>
                      <small className="admin-secondary">
                        {lead.interestedServices?.slice(0, 2).join(" · ") || t.common.generalConsultation}
                      </small>
                    </td>
                    <td>
                      <span className="admin-secondary">{formatAdminDate(lead.createdAt)}</span>
                    </td>
                    <td>
                      <StatusPill value={lead.status} />
                    </td>
                    <td>
                      <select
                        className="admin-select admin-status-select"
                        value={lead.status}
                        disabled={mutation.isPending}
                        onChange={(event) => update(lead.id, event.target.value)}
                        style={{
                          borderColor: leadStatusStyles[lead.status]?.border || "rgba(150, 174, 205, 0.17)",
                          color: leadStatusStyles[lead.status]?.color || "#cbd9e8",
                          fontWeight: 600,
                          backgroundColor: "#101620",
                        }}
                        aria-label={`Change status for ${lead.name}`}
                        data-testid={`select-lead-status-${lead.id}`}
                      >
                        {leadStatusesKeys.map((item) => (
                          <option value={item} key={item}>
                            {t.leadStatuses[item] || item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ position: "relative", textAlign: "right" }}>
                      <button
                        className="admin-more-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                        }}
                        title={t.leads.viewDetails}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          background: openMenuId === lead.id ? "rgba(150, 174, 205, 0.15)" : "transparent",
                        }}
                        data-testid={`button-lead-detail-${lead.id}`}
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {openMenuId === lead.id && (
                        <>
                          <div
                            style={{ position: "fixed", inset: 0, zIndex: 998 }}
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div
                            style={{
                              position: "absolute",
                              right: "8px",
                              top: "100%",
                              zIndex: 999,
                              minWidth: "165px",
                              backgroundColor: "#0d1520",
                              border: "1px solid rgba(150, 174, 205, 0.22)",
                              borderRadius: "8px",
                              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.6)",
                              padding: "4px",
                              display: "grid",
                              gap: "2px",
                              textAlign: "left",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(lead);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                                padding: "8px 10px",
                                border: "none",
                                borderRadius: "5px",
                                background: "transparent",
                                color: "#cbd9e8",
                                fontSize: "12px",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(150, 174, 205, 0.1)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Eye size={14} style={{ color: "#74a8eb" }} />
                              <span>{t.leads.viewDetails}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLeadToDelete(lead);
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                                padding: "8px 10px",
                                border: "none",
                                borderRadius: "5px",
                                background: "transparent",
                                color: "#f87171",
                                fontSize: "12px",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.12)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Trash2 size={14} style={{ color: "#f87171" }} />
                              <span>{t.leads.deleteLead}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(3, 7, 13, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLead(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#0d141f",
              borderRadius: "14px",
              border: "1px solid rgba(150, 174, 205, 0.2)",
              padding: "24px",
              boxShadow: "0 24px 50px rgba(0, 0, 0, 0.7)",
              display: "grid",
              gap: "18px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="admin-avatar" style={{ width: "44px", height: "44px", fontSize: "15px" }}>
                  {initials(selectedLead.name)}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#e2e8f0" }}>{selectedLead.name}</h3>
                  <p style={{ margin: "2px 0 0", color: "#74869c", fontSize: "13px" }}>{selectedLead.company}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <StatusPill value={selectedLead.status} />
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{ background: "transparent", border: "none", color: "#74869c", cursor: "pointer", padding: "4px" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", background: "rgba(150, 174, 205, 0.06)", border: "1px solid rgba(150, 174, 205, 0.12)" }}>
              <span style={{ color: "#8ca0b8", fontSize: "12px", fontWeight: 500 }}>{t.leads.status}</span>
              <select
                className="admin-select admin-status-select"
                value={selectedLead.status}
                disabled={mutation.isPending}
                onChange={(e) => update(selectedLead.id, e.target.value)}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  borderColor: leadStatusStyles[selectedLead.status]?.border || "rgba(150, 174, 205, 0.17)",
                  color: leadStatusStyles[selectedLead.status]?.color || "#cbd9e8",
                  backgroundColor: "#101620",
                }}
              >
                {leadStatusesKeys.map((item) => (
                  <option value={item} key={item}>
                    {t.leadStatuses[item] || item}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div>
              <p className="admin-kicker" style={{ margin: "0 0 8px 0" }}>{t.leads.contactInformation}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(16, 24, 34, 0.6)", border: "1px solid rgba(150, 174, 205, 0.1)" }}>
                  <small style={{ color: "#617387", fontSize: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={11} /> {t.leads.directEmail}
                  </small>
                  <a href={`mailto:${selectedLead.email}`} style={{ color: "#93c5fd", fontSize: "12px", wordBreak: "break-all", textDecoration: "none", marginTop: "4px", display: "block" }}>
                    {selectedLead.email}
                  </a>
                </div>

                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(16, 24, 34, 0.6)", border: "1px solid rgba(150, 174, 205, 0.1)" }}>
                  <small style={{ color: "#617387", fontSize: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={11} /> {t.leads.phoneLabel}
                  </small>
                  <span style={{ color: selectedLead.phone ? "#cbd9e8" : "#617387", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {selectedLead.phone || t.leads.notProvided}
                  </span>
                </div>

                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(16, 24, 34, 0.6)", border: "1px solid rgba(150, 174, 205, 0.1)" }}>
                  <small style={{ color: "#617387", fontSize: "10px", textTransform: "uppercase" }}>{t.leads.businessTypeLabel}</small>
                  <span style={{ color: selectedLead.businessType ? "#cbd9e8" : "#617387", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {selectedLead.businessType || t.leads.notProvided}
                  </span>
                </div>

                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(16, 24, 34, 0.6)", border: "1px solid rgba(150, 174, 205, 0.1)" }}>
                  <small style={{ color: "#617387", fontSize: "10px", textTransform: "uppercase" }}>{t.leads.budgetLabel}</small>
                  <span style={{ color: selectedLead.budget ? "#93c5fd" : "#617387", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: selectedLead.budget ? 600 : 400 }}>
                    {selectedLead.budget || t.leads.notProvided}
                  </span>
                </div>
              </div>
            </div>

            {/* Interested Services */}
            <div>
              <p className="admin-kicker" style={{ margin: "0 0 8px 0" }}>{t.leads.servicesRequested}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedLead.interestedServices && selectedLead.interestedServices.length > 0 ? (
                  selectedLead.interestedServices.map((srv, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "5px",
                        background: "rgba(99, 155, 230, 0.12)",
                        border: "1px solid rgba(99, 155, 230, 0.25)",
                        color: "#9ac4f7",
                        fontSize: "11px",
                      }}
                    >
                      {srv}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#617387", fontSize: "12px" }}>{t.common.generalConsultation}</span>
                )}
              </div>
            </div>

            {/* Project Scope / Description */}
            <div>
              <p className="admin-kicker" style={{ margin: "0 0 8px 0" }}>{t.leads.projectScope}</p>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  background: "rgba(16, 24, 34, 0.7)",
                  border: "1px solid rgba(150, 174, 205, 0.15)",
                  color: "#d1dbe6",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedLead.projectDescription || t.leads.notProvided}
              </div>
            </div>

            {/* Footer metadata & actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid rgba(150, 174, 205, 0.12)" }}>
              <span style={{ color: "#617387", fontSize: "11px", fontFamily: "var(--font-code)" }}>
                {t.leads.received}: {formatAdminDate(selectedLead.createdAt)}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setLeadToDelete(selectedLead)}
                  className="admin-button admin-button-secondary"
                  style={{ color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}
                >
                  <Trash2 size={14} /> {t.leads.deleteLead}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="admin-button admin-button-secondary"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Confirmation Modal */}
      {leadToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(3, 7, 13, 0.88)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setLeadToDelete(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "#111822",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.7)",
              display: "grid",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f87171" }}>
              <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)" }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#fca5a5" }}>{t.leads.deleteConfirmTitle}</h3>
            </div>

            <div>
              <p style={{ margin: "0 0 8px", color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5" }}>
                {t.leads.deleteConfirmMessage}
              </p>
              <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(150, 174, 205, 0.1)", fontSize: "12px" }}>
                <strong style={{ color: "#e2e8f0" }}>{leadToDelete.name}</strong>
                <span style={{ color: "#74869c" }}> — {leadToDelete.company} ({leadToDelete.email})</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setLeadToDelete(null)}
                className="admin-button admin-button-secondary"
              >
                {t.leads.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteLead(leadToDelete.id)}
                className="admin-button admin-button-primary"
                style={{ background: "#dc2626", borderColor: "#ef4444" }}
              >
                <Trash2 size={14} /> {isDeleting ? t.common.loading : t.leads.confirmDeleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export function AdminVideo() {
  const query = useGetAdminVideo();
  const requestUpload = useRequestUploadUrl();
  const createAsset = useCreateVideoAsset();
  const publish = usePublishVideoAsset();
  const client = useQueryClient();
  const { t, formatAdminDate } = useAdminLang();

  const [sourceType, setSourceType] = useState<"link" | "file">("link");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<"idle" | "requesting" | "uploading" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const accept = "video/mp4,video/webm,video/quicktime";

  const detectedDriveEmbed = useMemo(() => {
    return extractGoogleDriveEmbedUrl(linkUrl);
  }, [linkUrl]);

  const saveLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !linkUrl.trim()) {
      setMessage(t.video.titleLinkPrompt);
      return;
    }
    try {
      setMessage("");
      setProgress("saving");
      const driveEmbed = extractGoogleDriveEmbedUrl(linkUrl.trim());
      const finalUrl = driveEmbed || linkUrl.trim();
      const mimeType = driveEmbed ? "video/google-drive" : "video/mp4";
      await createAsset.mutateAsync({
        data: {
          title: title.trim(),
          objectPath: finalUrl,
          mimeType,
          sizeBytes: 1,
        },
      });
      setProgress("success");
      setMessage(t.video.saveLinkSuccess);
      setLinkUrl("");
      setTitle("");
      client.invalidateQueries({ queryKey: getGetAdminVideoQueryKey() });
      client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    } catch (err: any) {
      console.error("VSL save link error:", err);
      setProgress("error");
      setMessage(err?.message || t.video.uploadError);
    }
  };

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim()) {
      setMessage(t.video.titleFilePrompt);
      return;
    }
    try {
      setMessage("");
      setProgress("requesting");
      const contentType = file.type as typeof UploadRequestContentType[keyof typeof UploadRequestContentType];
      const response = await requestUpload.mutateAsync({ data: { name: file.name, size: file.size, contentType } });
      setProgress("uploading");
      const direct = await fetch(response.uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!direct.ok) throw new Error("Direct upload failed");
      setProgress("saving");
      await createAsset.mutateAsync({
        data: { title: title.trim(), objectPath: response.objectPath, mimeType: file.type, sizeBytes: file.size },
      });
      setProgress("success");
      setMessage(t.video.uploadSuccess);
      setFile(null);
      setTitle("");
      client.invalidateQueries({ queryKey: getGetAdminVideoQueryKey() });
      client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    } catch (err: any) {
      console.error("VSL upload error:", err);
      setProgress("error");
      setMessage(err?.message || t.video.uploadError);
    }
  };

  const current = query.data;
  const isCurrentExternal = current?.objectPath?.startsWith("http://") || current?.objectPath?.startsWith("https://");
  const currentDriveEmbed = isCurrentExternal ? extractGoogleDriveEmbedUrl(current.objectPath) : null;

  return (
    <AdminShell>
      <PageHeader eyebrow={t.video.eyebrow} title={t.video.title} detail={t.video.detail} />
      <div className="admin-video-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.video.currentVsl}</p>
              <h2>{current?.title || t.video.noPublishedLesson}</h2>
            </div>
            {current && <StatusPill value={current.isPublished ? "approved" : "registered"} />}
          </div>
          {query.isLoading ? (
            <div className="admin-skeleton admin-video-skeleton" />
          ) : query.isError ? (
            <StateMessage kind="error" title="Video status unavailable" detail="Try again in a moment." onRetry={() => query.refetch()} />
          ) : current ? (
            <div className="admin-video-preview">
              <div style={{ borderRadius: "10px", overflow: "hidden", background: "#05080c", border: "1px solid rgba(255,255,255,0.08)" }}>
                {currentDriveEmbed ? (
                  <iframe
                    src={currentDriveEmbed}
                    title={current.title}
                    style={{ width: "100%", height: "260px", border: "none", display: "block" }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={isCurrentExternal ? current.objectPath : apiUrl(`/api/storage/objects/${current.objectPath.replace(/^\/objects\//, "")}`)}
                    controls
                    style={{ width: "100%", maxHeight: "260px", display: "block" }}
                  />
                )}
              </div>
              <div className="admin-video-meta">
                <span>
                  {currentDriveEmbed ? <Globe2 size={14} /> : <FileVideo size={14} />}
                  {currentDriveEmbed ? "Google Drive Stream" : current.mimeType}
                </span>
                <span>
                  {isCurrentExternal ? t.video.cloudHosted : `${(current.sizeBytes / 1024 / 1024).toFixed(1)} MB`}
                </span>
                <span>
                  {t.video.added} {formatAdminDate(current.createdAt)}
                </span>
              </div>
              {!current.isPublished && (
                <button
                  className="admin-button admin-button-primary"
                  onClick={() =>
                    publish.mutate(
                      { id: current.id },
                      {
                        onSuccess: () => {
                          client.invalidateQueries({ queryKey: getGetAdminVideoQueryKey() });
                          client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
                        },
                      }
                    )
                  }
                  disabled={publish.isPending}
                  data-testid="button-publish-video"
                >
                  {publish.isPending ? t.video.publishing : t.video.publishBtn} <ArrowUpRight size={15} />
                </button>
              )}
            </div>
          ) : (
            <StateMessage kind="empty" title={t.video.nothingUploaded} detail={t.video.uploadApproved} />
          )}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.video.newAsset}</p>
              <h2>{t.video.uploadVsl}</h2>
            </div>
            {sourceType === "link" ? <Link2 size={17} className="admin-muted-icon" /> : <UploadCloud size={17} className="admin-muted-icon" />}
          </div>

          {/* Source Selector Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "8px" }}>
            <button
              type="button"
              onClick={() => {
                setSourceType("link");
                setMessage("");
                setProgress("idle");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                background: sourceType === "link" ? "rgba(121,174,244,0.2)" : "transparent",
                color: sourceType === "link" ? "#9ec5f7" : "#8292a6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <Link2 size={14} />
              {t.video.linkTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceType("file");
                setMessage("");
                setProgress("idle");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                background: sourceType === "file" ? "rgba(121,174,244,0.2)" : "transparent",
                color: sourceType === "file" ? "#9ec5f7" : "#8292a6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <UploadCloud size={14} />
              {t.video.fileTab}
            </button>
          </div>

          {sourceType === "link" ? (
            <form className="admin-upload-form" onSubmit={saveLink}>
              <label className="admin-field">
                <span>{t.video.assetTitle}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t.video.assetTitlePlaceholder}
                  data-testid="input-video-title"
                />
              </label>
              <label className="admin-field">
                <span>{t.video.driveUrlLabel}</span>
                <input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder={t.video.driveUrlPlaceholder}
                  data-testid="input-video-link"
                />
              </label>

              {detectedDriveEmbed && (
                <div style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(121,174,244,0.12)", border: "1px solid rgba(121,174,244,0.25)", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#9ec5f7" }}>
                  <Check size={14} />
                  <span>Google Drive link verified &amp; ready for high-speed streaming</span>
                </div>
              )}

              <small className="admin-form-caption" style={{ display: "block" }}>
                {t.video.driveHelper}
                <br />
                <span style={{ color: "#79aef4", opacity: 0.85 }}>{t.video.driveTip}</span>
              </small>

              {message && (
                <p className={`admin-form-message ${progress === "error" ? "is-error" : progress === "success" ? "is-success" : ""}`}>
                  {message}
                </p>
              )}
              <button
                className="admin-button admin-button-primary admin-full-button"
                disabled={progress === "saving"}
                data-testid="button-save-video-link"
              >
                <Link2 size={15} /> {progress === "saving" ? t.video.savingLink : t.video.saveLinkBtn}
              </button>
            </form>
          ) : (
            <form className="admin-upload-form" onSubmit={upload}>
              <label className="admin-field">
                <span>{t.video.assetTitle}</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t.video.assetTitlePlaceholder}
                  data-testid="input-video-title"
                />
              </label>
              <label className="admin-dropzone">
                <input
                  type="file"
                  accept={accept}
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  data-testid="input-video-file"
                />
                <UploadCloud size={24} />
                <strong>{file ? file.name : t.video.chooseFile}</strong>
                <small>{t.video.fileTypes}</small>
              </label>
              {progress !== "idle" && progress !== "error" && progress !== "success" && (
                <div className="admin-upload-status">
                  <span className="admin-upload-line">
                    <i style={{ width: progress === "requesting" ? "25%" : progress === "uploading" ? "65%" : "90%" }} />
                  </span>
                  <small>
                    {progress === "requesting"
                      ? t.video.requestingUpload
                      : progress === "uploading"
                      ? t.video.uploadingDirect
                      : t.video.savingMetadata}
                  </small>
                </div>
              )}
              {message && (
                <p className={`admin-form-message ${progress === "error" ? "is-error" : progress === "success" ? "is-success" : ""}`}>
                  {message}
                </p>
              )}
              <button
                className="admin-button admin-button-primary admin-full-button"
                disabled={progress !== "idle" && progress !== "error" && progress !== "success"}
                data-testid="button-upload-video"
              >
                <UploadCloud size={15} /> {t.video.uploadSecurely}
              </button>
              <small className="admin-form-caption">{t.video.uploadDirectNote}</small>
            </form>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

export function AdminAvailability() {
  const query = useListAvailabilityRules();
  const create = useCreateAvailabilityRule();
  const remove = useDeleteAvailabilityRule();
  const client = useQueryClient();
  const { t } = useAdminLang();

  const [form, setForm] = useState({ weekday: 0, startTime: "09:00", endTime: "17:00", timezone: "Africa/Algiers" });
  const rules = query.data || [];
  const addRule = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      { data: { ...form, weekday: Number(form.weekday), enabled: true } },
      {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getListAvailabilityRulesQueryKey() });
        },
      }
    );
  };

  const grouped = useMemo(
    () =>
      t.weekDays.map((label, weekday) => ({
        label,
        weekday,
        rules: rules.filter((rule) => rule.weekday === weekday),
      })),
    [rules, t.weekDays]
  );

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t.availability.eyebrow}
        title={t.availability.title}
        detail={t.availability.detail}
        action={
          <span className="admin-timezone-badge">
            <Globe2 size={14} /> {rules[0]?.timezone || form.timezone}
          </span>
        }
      />
      <div className="admin-availability-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.availability.weeklyHours}</p>
              <h2>{t.availability.consultationWindows}</h2>
            </div>
            <span className="admin-secondary">
              {rules.length} {rules.length === 1 ? t.availability.activeWindow : t.availability.activeWindows}
            </span>
          </div>
          {query.isLoading ? (
            <div className="admin-week-skeleton">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="admin-skeleton admin-day-skeleton" />
              ))}
            </div>
          ) : query.isError ? (
            <StateMessage
              kind="error"
              title="Availability unavailable"
              detail="We could not load your weekly rules."
              onRetry={() => query.refetch()}
            />
          ) : (
            <div className="admin-week-list">
              {grouped.map((day) => (
                <div className={`admin-day-row ${day.rules.length ? "" : "is-empty"}`} key={day.weekday}>
                  <strong>{day.label}</strong>
                  <div className="admin-day-rules">
                    {day.rules.length ? (
                      day.rules.map((rule) => (
                        <div className="admin-time-rule" key={rule.id}>
                          <Clock3 size={14} />
                          <span>
                            {rule.startTime} — {rule.endTime}
                          </span>
                          <small>{rule.timezone}</small>
                          <button
                            className="admin-delete-button"
                            onClick={() =>
                              remove.mutate(
                                { id: rule.id },
                                {
                                  onSuccess: () => client.invalidateQueries({ queryKey: getListAvailabilityRulesQueryKey() }),
                                }
                              )
                            }
                            aria-label={`Delete ${day.label} availability`}
                            data-testid={`button-delete-rule-${rule.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="admin-day-off">{t.availability.noWindow}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="admin-panel admin-add-rule">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.availability.addWindow}</p>
              <h2>{t.availability.openCapacity}</h2>
            </div>
            <Plus size={17} className="admin-muted-icon" />
          </div>
          <form onSubmit={addRule} className="admin-rule-form">
            <label className="admin-field">
              <span>{t.availability.day}</span>
              <select
                className="admin-select"
                value={form.weekday}
                onChange={(event) => setForm({ ...form, weekday: Number(event.target.value) })}
                data-testid="select-availability-day"
              >
                {t.weekDays.map((day, index) => (
                  <option value={index} key={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <div className="admin-field-grid">
              <label className="admin-field">
                <span>{t.availability.starts}</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  data-testid="input-availability-start"
                />
              </label>
              <label className="admin-field">
                <span>{t.availability.ends}</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  data-testid="input-availability-end"
                />
              </label>
            </div>
            <label className="admin-field">
              <span>{t.availability.timezone}</span>
              <input
                value={form.timezone}
                onChange={(event) => setForm({ ...form, timezone: event.target.value })}
                data-testid="input-availability-timezone"
              />
            </label>
            <button
              className="admin-button admin-button-primary admin-full-button"
              disabled={create.isPending}
              data-testid="button-add-availability"
            >
              <Plus size={15} /> {create.isPending ? t.availability.saving : t.availability.addAvailability}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

export function AdminBookings() {
  const query = useListAdminBookings();
  const approve = useApproveBooking();
  const update = useUpdateBookingStatus();
  const client = useQueryClient();
  const { t, formatAdminDateTime } = useAdminLang();

  const [notification, setNotification] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const refresh = () => {
    query.refetch();
  };

  const mutateBooking = (id: number, action: "approve" | "status", status?: string) => {
    const onSuccess = () => {
      client.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
      if (action === "approve") {
        setNotification({
          kind: "success",
          text: t.bookings.approvalSuccessNote,
        });
      }
    };
    if (action === "approve") approve.mutate({ id }, { onSuccess });
    else update.mutate({ id, data: { status: status as typeof BookingStatus[keyof typeof BookingStatus] } }, { onSuccess });
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t.bookings.eyebrow}
        title={t.bookings.title}
        detail={t.bookings.detail}
        action={
          <button
            className="admin-button admin-button-secondary"
            onClick={refresh}
            data-testid="button-refresh-bookings"
          >
            <RefreshCw size={13} /> {t.common.refresh}
          </button>
        }
      />

      {notification && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: notification.kind === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${notification.kind === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: notification.kind === "success" ? "#a7f3d0" : "#fca5a5",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {notification.kind === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="admin-panel admin-table-panel">
        {query.isLoading ? (
          <div className="admin-table-skeleton">
            {[1, 2, 3].map((item) => (
              <div key={item} className="admin-skeleton admin-row-skeleton" />
            ))}
          </div>
        ) : query.isError ? (
          <StateMessage kind="error" title="Bookings unavailable" detail="We could not load booking requests." onRetry={refresh} />
        ) : !query.data?.length ? (
          <StateMessage kind="empty" title={t.bookings.noBookingRequests} detail={t.bookings.approvedLeadsAppear} />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t.bookings.client}</th>
                  <th>{t.bookings.requestedTime}</th>
                  <th>{t.bookings.status}</th>
                  <th>{t.bookings.decision}</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((booking) => (
                  <tr key={booking.id} data-testid={`row-booking-${booking.id}`}>
                    <td>
                      <div className="admin-person">
                        <span className="admin-avatar">{initials(booking.clientName)}</span>
                        <span>
                          <strong>{booking.clientName}</strong>
                          <small>{booking.clientEmail}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-company">{formatAdminDateTime(booking.startsAt, booking.timezone)}</span>
                      <small className="admin-secondary">
                        {formatAdminDateTime(booking.endsAt, booking.timezone).split(" · ")[1] || t.common.consultation}
                      </small>
                    </td>
                    <td>
                      <StatusPill value={booking.status} booking />
                    </td>
                    <td>
                      <div className="admin-action-group">
                        {booking.status === BookingStatus.requested && (
                          <button
                            className="admin-button admin-button-primary admin-button-small"
                            onClick={() => mutateBooking(booking.id, "approve")}
                            disabled={approve.isPending}
                            data-testid={`button-approve-booking-${booking.id}`}
                          >
                            <Check size={13} /> {t.bookings.approve}
                          </button>
                        )}
                        <select
                          className="admin-select admin-status-select"
                          value={booking.status}
                          onChange={(event) => mutateBooking(booking.id, "status", event.target.value)}
                          data-testid={`select-booking-status-${booking.id}`}
                        >
                          <option value="" disabled>
                            {t.bookings.updateStatus}
                          </option>
                          {bookingStatusesKeys.map((status) => (
                            <option value={status} key={status}>
                              {t.bookingStatuses[status] || status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

export interface ClientTestimonialItem {
  id: number;
  clientName: string;
  clientRole?: string | null;
  company: string;
  quote: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  metric?: string | null;
  metricLabel?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export function AdminTestimonials() {
  const [items, setItems] = useState<ClientTestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, formatAdminDate } = useAdminLang();

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientRole, setClientRole] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [metric, setMetric] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("spectra_admin_token") : null;
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handleVideoUpload = async (file: File) => {
    try {
      setUploadingVideo(true);
      setFormFeedback(null);
      const reqRes = await fetch(apiUrl("/api/storage/uploads/request-url"), {
        method: "POST",
        headers,
        body: JSON.stringify({ name: file.name, size: file.size }),
      });
      if (!reqRes.ok) throw new Error("Could not request upload URL");
      const { uploadURL, objectPath } = await reqRes.json();
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Could not upload video file");
      setVideoUrl(apiUrl(`/api/storage${objectPath}`));
      setFormFeedback({ text: "Video file uploaded successfully!", kind: "success" });
    } catch (err: any) {
      setFormFeedback({ text: err.message || "Failed to upload video", kind: "error" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl("/api/admin/testimonials"), { headers });
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [headers]);

  const togglePublish = async (id: number, current: boolean) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/testimonials/${id}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      alert("Could not update testimonial status.");
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm(t.feedback.deleteConfirm)) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/testimonials/${id}`), {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("Could not delete testimonial.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !company.trim() || !quote.trim() || !videoUrl.trim()) {
      setFormFeedback({ text: t.feedback.fillRequired, kind: "error" });
      return;
    }

    try {
      setSubmitting(true);
      setFormFeedback(null);
      const res = await fetch(apiUrl("/api/admin/testimonials"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientRole: clientRole.trim() || undefined,
          company: company.trim(),
          quote: quote.trim(),
          videoUrl: videoUrl.trim(),
          metric: metric.trim() || undefined,
          metricLabel: metricLabel.trim() || undefined,
          isPublished,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create testimonial");
      }

      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setFormFeedback({ text: `${t.feedback.addedSuccess} (${clientName})`, kind: "success" });
      setClientName("");
      setClientRole("");
      setCompany("");
      setQuote("");
      setVideoUrl("");
      setMetric("");
      setMetricLabel("");
    } catch (err: any) {
      setFormFeedback({ text: err.message || "Failed to add testimonial", kind: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow={t.feedback.eyebrow}
        title={t.feedback.title}
        detail={t.feedback.detail}
        action={
          <span className="admin-timezone-badge">
            <Video size={14} /> {items.filter((i) => i.isPublished).length} {t.feedback.publishedOnLanding}
          </span>
        }
      />

      <div className="admin-video-grid">
        {/* Left Column: Testimonials List */}
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.feedback.liveProofCollection}</p>
              <h2>{t.feedback.allFeedback} ({items.length})</h2>
            </div>
            <button
              onClick={loadTestimonials}
              className="admin-button admin-button-secondary"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              <RefreshCw size={13} /> {t.feedback.refresh}
            </button>
          </div>

          {loading ? (
            <div className="admin-table-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="admin-skeleton admin-row-skeleton" />
              ))}
            </div>
          ) : error ? (
            <StateMessage kind="error" title="Feedback unavailable" detail={error} onRetry={loadTestimonials} />
          ) : items.length === 0 ? (
            <StateMessage
              kind="empty"
              title={t.feedback.noFeedbackYet}
              detail={t.feedback.noFeedbackDetail}
            />
          ) : (
            <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(150, 174, 205, 0.12)",
                    background: "rgba(16, 24, 34, 0.5)",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: "#dbeaf8", fontSize: "14px" }}>{item.clientName}</strong>
                        <span style={{ color: "#74869c", fontSize: "11px" }}>
                          {item.clientRole ? `${item.clientRole} · ` : ""}{item.company}
                        </span>
                      </div>
                      {item.metric && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "5px", padding: "3px 8px", borderRadius: "4px", background: "rgba(99, 155, 230, 0.12)", border: "1px solid rgba(99, 155, 230, 0.25)" }}>
                          <strong style={{ color: "#9ac4f7", fontSize: "12px" }}>{item.metric}</strong>
                          <small style={{ color: "#8597ad", fontSize: "10px" }}>{item.metricLabel}</small>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`admin-pill ${item.isPublished ? "admin-pill-green" : "admin-pill-slate"}`}>
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                      <button
                        onClick={() => togglePublish(item.id, item.isPublished)}
                        title={item.isPublished ? t.feedback.unpublishTitle : t.feedback.publishTitle}
                        className="admin-icon-button"
                        style={{ padding: "6px", borderRadius: "6px", border: "1px solid rgba(150, 174, 205, 0.15)" }}
                      >
                        {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => deleteTestimonial(item.id)}
                        title={t.feedback.deleteTitle}
                        className="admin-icon-button"
                        style={{ padding: "6px", borderRadius: "6px", border: "1px solid rgba(220, 100, 100, 0.2)", color: "#e2a1a7" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, color: "#8e9eb2", fontSize: "12px", lineHeight: "1.6", fontStyle: "italic" }}>
                    “{item.quote}”
                  </p>

                  {/* Video player preview */}
                  <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(150, 174, 205, 0.1)", background: "#080c10" }}>
                    <video
                      src={item.videoUrl}
                      controls
                      preload="metadata"
                      style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#617387", fontSize: "10px", fontFamily: "var(--font-code)" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "350px" }}>
                      {t.feedback.urlLabel}: {item.videoUrl}
                    </span>
                    <span>{t.feedback.added} {formatAdminDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Upload / Add Form */}
        <section className="admin-panel" style={{ alignSelf: "start" }}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{t.feedback.adminAction}</p>
              <h2>{t.feedback.addClientVideo}</h2>
            </div>
            <Plus size={17} className="admin-muted-icon" />
          </div>

          <form onSubmit={handleSubmit} className="admin-upload-form" style={{ gap: "14px" }}>
            <div className="admin-field-grid">
              <label className="admin-field">
                <span>{t.feedback.clientFullName}</span>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                />
              </label>
              <label className="admin-field">
                <span>{t.feedback.roleTitle}</span>
                <input
                  value={clientRole}
                  onChange={(e) => setClientRole(e.target.value)}
                  placeholder="e.g. Chief Product Officer"
                />
              </label>
            </div>

            <div className="admin-field-grid">
              <label className="admin-field">
                <span>{t.feedback.companyName}</span>
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Health"
                />
              </label>
              <label className="admin-field">
                <span>{t.feedback.metricResult}</span>
                <input
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="e.g. 3.4× or 47%"
                />
              </label>
            </div>

            <label className="admin-field">
              <span>{t.feedback.metricDesc}</span>
              <input
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="e.g. average lead acceleration in 60 days"
              />
            </label>

            <label className="admin-field">
              <span>{t.feedback.quoteLabel}</span>
              <textarea
                required
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder={t.feedback.quotePlaceholder}
                style={{
                  minHeight: "75px",
                  borderRadius: "6px",
                  border: "1px solid rgba(150, 174, 205, 0.17)",
                  backgroundColor: "#111a24",
                  color: "#cbd9e8",
                  padding: "10px",
                  fontSize: "12px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </label>

            <div className="admin-field">
              <span>{t.feedback.videoUrlLabel}</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://... or upload video file"
                  style={{ flex: 1 }}
                />
                <label className="admin-button admin-button-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", padding: "8px 12px", whiteSpace: "nowrap" }}>
                  <UploadCloud size={14} />
                  {uploadingVideo ? "Uploading..." : "Upload File"}
                  <input
                    type="file"
                    accept="video/*"
                    disabled={uploadingVideo}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Helper presets */}
            <div>
              <small style={{ color: "#74859a", fontSize: "10px", display: "block", marginBottom: "6px" }}>
                {t.feedback.quickPresets}
              </small>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(100, 140, 190, 0.12)",
                    border: "1px solid rgba(100, 140, 190, 0.25)",
                    color: "#8bb6ea",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Preset: Blaze (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(100, 140, 190, 0.12)",
                    border: "1px solid rgba(100, 140, 190, 0.25)",
                    color: "#8bb6ea",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Preset: Escapes (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(100, 140, 190, 0.12)",
                    border: "1px solid rgba(100, 140, 190, 0.25)",
                    color: "#8bb6ea",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Preset: Growth (MP4)
                </button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ accentColor: "#74a8eb" }}
              />
              <span style={{ color: "#b8c9db", fontSize: "11px" }}>{t.feedback.publishImmediate}</span>
            </label>

            {formFeedback && (
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: formFeedback.kind === "success" ? "#91d1b0" : "#e2a1a7",
                }}
              >
                {formFeedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="admin-button admin-button-primary admin-full-button"
            >
              <Plus size={15} /> {submitting ? t.feedback.addingFeedback : t.feedback.addFeedbackBtn}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

export interface PortfolioItem {
  id: number;
  title: string;
  url: string;
  imageUrl?: string | null;
  category: string;
  description?: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, formatAdminDate } = useAdminLang();

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [category, setCategory] = useState("Digital System");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("spectra_admin_token") : null;
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl("/api/admin/portfolio"), { headers });
      if (!res.ok) throw new Error("Failed to fetch portfolio websites");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load portfolio websites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [headers]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setFormFeedback(null);
      const reqRes = await fetch(apiUrl("/api/storage/uploads/request-url"), {
        method: "POST",
        headers,
        body: JSON.stringify({ name: file.name, size: file.size }),
      });
      if (!reqRes.ok) throw new Error("Could not request upload URL");
      const { uploadURL, objectPath } = await reqRes.json();

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload screenshot");

      setImageUrl(objectPath);
      setFormFeedback({ text: `Custom screenshot uploaded: ${file.name}`, kind: "success" });
    } catch (err: any) {
      setFormFeedback({ text: err.message || "Failed to upload screenshot image", kind: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  const togglePublish = async (id: number, current: boolean) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/portfolio/${id}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      alert("Could not update website status.");
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to remove this showcase website?")) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/portfolio/${id}`), {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("Could not delete website.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setFormFeedback({ text: "Please enter website title and URL.", kind: "error" });
      return;
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setSubmitting(true);
      setFormFeedback(null);
      const res = await fetch(apiUrl("/api/admin/portfolio"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          url: formattedUrl,
          imageUrl: imageUrl.trim() || undefined,
          category: category.trim() || "Digital System",
          description: description.trim() || undefined,
          isPublished,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add showcase website");
      }

      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setFormFeedback({ text: `Showcase website "${title}" added successfully!`, kind: "success" });
      setTitle("");
      setUrl("");
      setImageUrl("");
      setDescription("");
      setCategory("Digital System");
    } catch (err: any) {
      setFormFeedback({ text: err.message || "Failed to add website", kind: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="PORTFOLIO & SYSTEM SHOWCASE"
        title={t.nav.portfolio}
        detail="Showcase live websites and digital products built by Spectra with interactive scrollable previews on the visitor funnel."
        action={
          <span className="admin-timezone-badge">
            <Globe2 size={14} /> {items.filter((i) => i.isPublished).length} Published
          </span>
        }
      />

      <div className="admin-video-grid">
        {/* Left Column: List */}
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">LIVE SHOWCASE COLLECTION</p>
              <h2>All Showcase Websites ({items.length})</h2>
            </div>
            <button
              onClick={loadPortfolio}
              className="admin-button admin-button-secondary"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              <RefreshCw size={13} /> {t.common.refresh}
            </button>
          </div>

          <div
            style={{
              background: "rgba(116, 168, 235, 0.08)",
              border: "1px solid rgba(116, 168, 235, 0.2)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "14px",
              fontSize: "11px",
              color: "#9db9dc",
              lineHeight: "1.5",
            }}
          >
            <strong>✨ Anti-White Screen Rendering:</strong> Websites protected by strict headers (such as <code>X-Frame-Options: SAMEORIGIN</code> on Hostinger, Shopify, or Webflow) are automatically rendered using high-resolution live snapshots, eliminating blank white frames on the visitor page.
          </div>

          {loading ? (
            <div className="admin-table-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="admin-skeleton admin-row-skeleton" />
              ))}
            </div>
          ) : error ? (
            <StateMessage kind="error" title="Unable to load showcase" detail={error} onRetry={loadPortfolio} />
          ) : items.length === 0 ? (
            <div className="admin-empty" style={{ padding: "40px 20px", textAlign: "center" }}>
              <Globe2 size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontWeight: 600, color: "#d2dde9" }}>No showcase websites yet</p>
              <small style={{ color: "#74869c" }}>
                Add your first client website or digital product using the form on the right.
              </small>
            </div>
          ) : (
            <div className="admin-feedback-list">
              {items.map((item) => {
                const rawImg = item.imageUrl ? (item.imageUrl.startsWith('/objects/') ? `/api/storage${item.imageUrl}` : item.imageUrl) : undefined;
                const previewImg =
                  (rawImg ? apiUrl(rawImg) : null) ||
                  `https://api.microlink.io/?url=${encodeURIComponent(item.url)}&screenshot=true&embed=screenshot.url`;
                return (
                  <div key={item.id} className="admin-feedback-card">
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      {/* Live Thumbnail */}
                      <div
                        style={{
                          width: "84px",
                          height: "60px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "#0c131a",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <img
                          src={previewImg}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ color: "#e4ecf5", fontSize: "14px" }}>{item.title}</strong>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "rgba(116, 168, 235, 0.15)",
                              color: "#8ab7ed",
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#74869c",
                            fontSize: "11px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "4px",
                            textDecoration: "none",
                            wordBreak: "break-all",
                          }}
                        >
                          {item.url} <ArrowUpRight size={11} />
                        </a>
                        {item.description && (
                          <p style={{ color: "#9cb1c9", fontSize: "12px", marginTop: "6px" }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <button
                          onClick={() => togglePublish(item.id, item.isPublished)}
                          className={`admin-icon-btn ${item.isPublished ? "is-active" : ""}`}
                          title={item.isPublished ? "Published (Click to hide)" : "Hidden (Click to publish)"}
                        >
                          {item.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="admin-icon-btn is-danger"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Form */}
        <section className="admin-panel" style={{ alignSelf: "start" }}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">ADD SHOWCASE</p>
              <h2>Add Website Link</h2>
            </div>
            <Plus size={17} className="admin-muted-icon" />
          </div>

          <form onSubmit={handleSubmit} className="admin-upload-form" style={{ gap: "14px" }}>
            <label className="admin-field">
              <span>Website Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Results Academy"
              />
            </label>

            <label className="admin-field">
              <span>Website URL (Link)</span>
              <input
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. https://theresults-academy.com/ or https://thebequer.tech/"
              />
            </label>

            <div className="admin-field">
              <span>Custom Screenshot / Preview Image (Optional)</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Auto-generated live if left empty, or paste image URL"
                  style={{ flex: 1 }}
                />
                <label
                  className="admin-button admin-button-secondary"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    padding: "8px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <UploadCloud size={14} />
                  {uploadingImage ? "Uploading..." : "Upload Screenshot"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
              </div>
              <small style={{ color: "#74869c", fontSize: "10px", marginTop: "4px", display: "block" }}>
                Leave empty for automatic live snapshot generation, or upload a custom screenshot image.
              </small>
            </div>

            <label className="admin-field">
              <span>Category / Industry</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cosmetics, E-learning, Fintech, SaaS"
              />
            </label>

            <label className="admin-field">
              <span>Short Description (Optional)</span>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what makes this website special"
                style={{
                  minHeight: "60px",
                  borderRadius: "6px",
                  border: "1px solid rgba(150, 174, 205, 0.17)",
                  backgroundColor: "#111a24",
                  color: "#cbd9e8",
                  padding: "10px",
                  fontSize: "12px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ accentColor: "#74a8eb" }}
              />
              <span style={{ color: "#b8c9db", fontSize: "11px" }}>Publish immediately on landing page</span>
            </label>

            {formFeedback && (
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: formFeedback.kind === "success" ? "#91d1b0" : "#e2a1a7",
                }}
              >
                {formFeedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="admin-button admin-button-primary admin-full-button"
            >
              <Plus size={15} /> {submitting ? "Adding..." : "Add to Showcase"}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}