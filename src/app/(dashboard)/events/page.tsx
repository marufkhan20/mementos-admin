import Link from "next/link";
import { fetchEvents } from "@/lib/convex-admin";
import { Card, EmptyState, EventBadge } from "@/components/ui";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const EVENT_TYPES = [
  "wallpaper_update_success",
  "wallpaper_update_failed",
  "wallpaper_update_skipped",
  "notification_scheduled",
  "notification_schedule_failed",
  "notification_tapped",
  "purchase_started",
  "purchase_completed",
  "purchase_failed",
  "purchase_cancelled",
  "restore_completed",
  "alarm_scheduled",
  "alarm_schedule_failed",
  "battery_optimization_granted",
  "battery_optimization_denied",
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; type?: string }>;
}) {
  const { cursor, type } = await searchParams;
  const result = await fetchEvents(cursor ?? null, type, 50);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Events</h1>
        <p className="text-sm text-neutral-500">Raw operational log, newest first.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/events"
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            !type ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          All
        </Link>
        {EVENT_TYPES.map((t) => (
          <Link
            key={t}
            href={`/events?type=${t}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              type === t
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <Card className="p-0">
        {result.page.length === 0 ? (
          <EmptyState message="No events found." />
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {result.page.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <EventBadge type={e.type} />
                  <Link
                    href={`/devices/${e.deviceId}`}
                    className="shrink-0 font-mono text-xs text-blue-400 hover:underline"
                  >
                    {e.deviceId}
                  </Link>
                  {e.trigger && (
                    <span className="shrink-0 text-xs text-neutral-500">{e.trigger}</span>
                  )}
                  {e.detail && (
                    <span className="truncate text-xs text-neutral-500">{e.detail}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-neutral-500">
                  {format(e._creationTime, "MMM d, HH:mm:ss")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!result.isDone && (
        <Link
          href={`/events?${type ? `type=${type}&` : ""}cursor=${encodeURIComponent(
            result.continueCursor,
          )}`}
          className="self-start rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:text-white"
        >
          Load more →
        </Link>
      )}
    </div>
  );
}
