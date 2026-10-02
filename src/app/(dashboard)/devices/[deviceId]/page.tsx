import { PhoneFrame } from "@/components/PhoneFrame";
import { Badge, Card, EmptyState, EventBadge } from "@/components/ui";
import { WallpaperPreview } from "@/components/WallpaperPreview";
import { fetchDevice } from "@/lib/convex-admin";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const PREVIEW_W = 220;
const PREVIEW_H = Math.round(PREVIEW_W * 2.16);

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const { deviceId } = await params;
  const data = await fetchDevice(deviceId);
  if (!data) notFound();

  const { device, goal, events, lastWallpaperUpdateAt } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/devices"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white"
        >
          <ArrowLeft size={14} /> Devices
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-mono text-xl font-semibold text-white">
            {device.deviceId}
          </h1>
          <Badge tone={device.isPro ? "pro" : "free"}>
            {device.isPro ? "Pro" : "Free"}
          </Badge>
        </div>
        <p className="text-sm text-neutral-500">
          Last seen{" "}
          {formatDistanceToNow(device.lastSeenAt, { addSuffix: true })} ·{" "}
          {device.platform ?? "unknown platform"} · v{device.appVersion ?? "?"}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex shrink-0 items-center justify-center">
          <PhoneFrame width={PREVIEW_W}>
            <WallpaperPreview
              variantStyle={goal?.variantStyle ?? null}
              title={goal?.title ?? null}
              startDate={goal?.startDate ?? null}
              endDate={goal?.endDate ?? null}
              accent={goal?.accent ?? null}
              lastWallpaperUpdateAt={lastWallpaperUpdateAt}
              width={PREVIEW_W}
              height={PREVIEW_H}
            />
          </PhoneFrame>
        </Card>

        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-medium text-white">
              Current goal
            </h2>
            {goal ? (
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-neutral-500">Title</dt>
                <dd className="text-neutral-200">{goal.title ?? "—"}</dd>
                <dt className="text-neutral-500">Style</dt>
                <dd className="text-neutral-200">{goal.variantStyle ?? "—"}</dd>
                <dt className="text-neutral-500">Start</dt>
                <dd className="text-neutral-200">{goal.startDate ?? "—"}</dd>
                <dt className="text-neutral-500">End</dt>
                <dd className="text-neutral-200">{goal.endDate ?? "—"}</dd>
                <dt className="text-neutral-500">Accent</dt>
                <dd className="flex items-center gap-2 text-neutral-200">
                  {goal.accent && (
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-neutral-700"
                      style={{ backgroundColor: goal.accent }}
                    />
                  )}
                  {goal.accent ?? "—"}
                </dd>
              </dl>
            ) : (
              <EmptyState message="No goal set." />
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-medium text-white">
              Reliability diagnostics
            </h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-neutral-500">Exact alarms allowed</dt>
              <dd>
                <DiagBadge value={device.canScheduleExactAlarms} />
              </dd>
              <dt className="text-neutral-500">Battery optimization ignored</dt>
              <dd>
                <DiagBadge value={device.ignoringBatteryOptimizations} />
              </dd>
            </dl>
            {device.recentBgLog?.length ? (
              <div className="mt-4">
                <div className="mb-1.5 text-xs text-neutral-500">
                  On-device background log
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg bg-neutral-950 p-3 font-mono text-xs text-neutral-400">
                  {device.recentBgLog.map((line: string, i: number) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <Card className="p-0">
        <div className="border-b border-neutral-800 px-5 py-4">
          <h2 className="text-sm font-medium text-white">Event timeline</h2>
          <p className="text-xs text-neutral-500">
            Most recent 200 events for this device.
          </p>
        </div>
        {events.length === 0 ? (
          <EmptyState message="No events reported yet." />
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {events.map((e: any) => (
              <div
                key={e._id}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <EventBadge type={e.type} />
                  {e.trigger && (
                    <span className="text-xs text-neutral-500">
                      {e.trigger}
                    </span>
                  )}
                  {e.detail && (
                    <span className="max-w-md truncate text-xs text-neutral-500">
                      {e.detail}
                    </span>
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
    </div>
  );
}

function DiagBadge({ value }: { value: boolean | undefined }) {
  if (value === undefined) {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-700/40 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
        unknown
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        value
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}
