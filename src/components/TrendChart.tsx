"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const SERIES: { key: string; color: string; label: string }[] = [
  { key: "wallpaper_update_success", color: "#34d399", label: "Wallpaper success" },
  { key: "wallpaper_update_failed", color: "#f87171", label: "Wallpaper failed" },
  { key: "notification_scheduled", color: "#60a5fa", label: "Notif scheduled" },
  { key: "notification_tapped", color: "#a78bfa", label: "Notif tapped" },
];

export function TrendChart({
  data,
}: {
  data: { date: string; counts: Record<string, number> }[];
}) {
  const rows = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    ...Object.fromEntries(SERIES.map((s) => [s.key, d.counts[s.key] ?? 0])),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="date" stroke="#737373" fontSize={12} />
        <YAxis stroke="#737373" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#171717",
            border: "1px solid #404040",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
