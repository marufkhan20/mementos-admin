import { fetchEventCountsByDay, fetchOverviewStats } from "@/lib/convex-admin";
import { Card, StatCard } from "@/components/ui";
import { TrendChart } from "@/components/TrendChart";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [stats, trend] = await Promise.all([
    fetchOverviewStats(),
    fetchEventCountsByDay(14),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-neutral-500">
          Live snapshot across every device that has ever reported in.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total devices" value={stats.totalDevices} />
        <StatCard label="Active today" value={stats.activeToday} />
        <StatCard label="Active 7d" value={stats.active7d} />
        <StatCard label="Active 30d" value={stats.active30d} />
        <StatCard
          label="Pro"
          value={`${stats.proCount}`}
          sub={`${stats.proPct}% of devices`}
        />
        <StatCard
          label="Wallpaper success"
          value={stats.wallpaper.successRate !== null ? `${stats.wallpaper.successRate}%` : "—"}
          sub={`${stats.wallpaper.success} success · ${stats.wallpaper.failed} failed · ${stats.wallpaper.skipped} skipped`}
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Last 14 days</h2>
        </div>
        <TrendChart data={trend} />
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-medium text-white">
            Notification funnel (free plan)
          </h2>
          <FunnelBar
            steps={[
              { label: "Scheduled", value: stats.notification.scheduled },
              { label: "Tapped", value: stats.notification.tapped },
            ]}
          />
          <p className="mt-3 text-xs text-neutral-500">
            {stats.notification.tapRate !== null
              ? `${stats.notification.tapRate}% of scheduled notifications were tapped.`
              : "No notifications scheduled yet."}{" "}
            Note: this can only track scheduling + taps — Android doesn&rsquo;t report
            whether a local notification was actually shown or dismissed unseen.
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-medium text-white">Purchase funnel</h2>
          <FunnelBar
            steps={[
              { label: "Started", value: stats.purchase.started },
              { label: "Completed", value: stats.purchase.completed },
            ]}
          />
          <p className="mt-3 text-xs text-neutral-500">
            {stats.purchase.conversionRate !== null
              ? `${stats.purchase.conversionRate}% conversion.`
              : "No purchases started yet."}
          </p>
        </Card>
      </div>
    </div>
  );
}

function FunnelBar({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s) => (
        <div key={s.label}>
          <div className="mb-1 flex justify-between text-xs text-neutral-400">
            <span>{s.label}</span>
            <span className="font-medium text-neutral-200">{s.value}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-800">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${(s.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
