import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-900 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
    </Card>
  );
}

const EVENT_COLORS: Record<string, string> = {
  wallpaper_update_success: "bg-emerald-500/15 text-emerald-400",
  wallpaper_update_failed: "bg-red-500/15 text-red-400",
  wallpaper_update_skipped: "bg-neutral-500/15 text-neutral-400",
  notification_scheduled: "bg-blue-500/15 text-blue-400",
  notification_schedule_failed: "bg-red-500/15 text-red-400",
  notification_tapped: "bg-violet-500/15 text-violet-400",
  purchase_started: "bg-amber-500/15 text-amber-400",
  purchase_completed: "bg-emerald-500/15 text-emerald-400",
  purchase_failed: "bg-red-500/15 text-red-400",
  purchase_cancelled: "bg-neutral-500/15 text-neutral-400",
  restore_completed: "bg-emerald-500/15 text-emerald-400",
  alarm_scheduled: "bg-blue-500/15 text-blue-400",
  alarm_schedule_failed: "bg-red-500/15 text-red-400",
  battery_optimization_granted: "bg-emerald-500/15 text-emerald-400",
  battery_optimization_denied: "bg-red-500/15 text-red-400",
};

export function EventBadge({ type }: { type: string }) {
  const cls = EVENT_COLORS[type] ?? "bg-neutral-500/15 text-neutral-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {type}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "pro" | "free";
}) {
  const cls =
    tone === "pro"
      ? "bg-amber-500/15 text-amber-400"
      : tone === "free"
        ? "bg-neutral-500/15 text-neutral-400"
        : "bg-neutral-700/40 text-neutral-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
      {message}
    </div>
  );
}
