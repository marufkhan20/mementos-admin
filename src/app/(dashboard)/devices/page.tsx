import { PhoneFrame } from "@/components/PhoneFrame";
import { Badge, Card, EmptyState } from "@/components/ui";
import { WallpaperPreview } from "@/components/WallpaperPreview";
import { fetchDevices } from "@/lib/convex-admin";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PREVIEW_W = 160;
const PREVIEW_H = Math.round(PREVIEW_W * 2.16);

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; filter?: "all" | "pro" | "free" }>;
}) {
  const { cursor, filter = "all" } = await searchParams;
  const result = await fetchDevices(cursor ?? null, filter, 24);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Devices</h1>
          <p className="text-sm text-neutral-500">
            Every install that has ever reported in — rendered as it actually
            looks on their lock screen right now, most recently active first.
          </p>
        </div>

        <div className="flex gap-2">
          {(["all", "pro", "free"] as const).map((f) => (
            <Link
              key={f}
              href={`/devices?filter=${f}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {f === "all" ? "All" : f === "pro" ? "Pro" : "Free"}
            </Link>
          ))}
        </div>
      </div>

      {result.page.length === 0 ? (
        <Card>
          <EmptyState message="No devices yet." />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {result.page.map((d) => (
            <Link
              key={d.deviceId}
              href={`/devices/${d.deviceId}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-600"
            >
              <PhoneFrame width={PREVIEW_W}>
                <WallpaperPreview
                  variantStyle={d.variantStyle}
                  title={d.goalTitle}
                  startDate={d.startDate}
                  endDate={d.endDate}
                  accent={d.accent}
                  lastWallpaperUpdateAt={d.lastWallpaperUpdateAt}
                  width={PREVIEW_W}
                  height={PREVIEW_H}
                  devices={true}
                />
              </PhoneFrame>

              <div className="flex w-full flex-col items-center gap-1 text-center">
                <span className="font-mono text-xs text-blue-400 group-hover:underline">
                  {d.deviceId}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge tone={d.isPro ? "pro" : "free"}>
                    {d.isPro ? "Pro" : "Free"}
                  </Badge>
                  <span className="text-[10px] text-neutral-500">
                    {formatDistanceToNow(d.lastSeenAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!result.isDone && (
        <Link
          href={`/devices?filter=${filter}&cursor=${encodeURIComponent(result.continueCursor)}`}
          className="self-start rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:text-white"
        >
          Load more →
        </Link>
      )}
    </div>
  );
}
