"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";
import { WallpaperPreview } from "./WallpaperPreview";
import { EventBadge } from "./ui";
import { diagnoseDevice, DiagnosisLevel, EventLite } from "@/lib/diagnose";

const RELEVANT_TYPES = new Set([
  "wallpaper_update_success",
  "wallpaper_update_failed",
  "wallpaper_update_skipped",
  "notification_scheduled",
  "notification_schedule_failed",
  "notification_tapped",
  "alarm_scheduled",
  "alarm_schedule_failed",
  "battery_optimization_granted",
  "battery_optimization_denied",
]);

type Props = {
  variantStyle: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  accent: string | null;
  lastWallpaperUpdateAt: number | null;
  width: number;
  height: number;
  isPro: boolean;
  canScheduleExactAlarms?: boolean;
  ignoringBatteryOptimizations?: boolean;
  events: EventLite[];
  actualPct: number;
  expectedPct: number;
  daysLeft: number;
  daysMissed: number;
};

export function DeviceDebugModal({
  variantStyle,
  title,
  startDate,
  endDate,
  accent,
  lastWallpaperUpdateAt,
  width,
  height,
  isPro,
  canScheduleExactAlarms,
  ignoringBatteryOptimizations,
  events,
  actualPct,
  expectedPct,
  daysLeft,
  daysMissed,
}: Props) {
  const [open, setOpen] = useState(false);

  const diagnosis = diagnoseDevice({
    isPro,
    canScheduleExactAlarms,
    ignoringBatteryOptimizations,
    daysMissed,
    events,
  });

  const relevantEvents = events.filter((e) => RELEVANT_TYPES.has(e.type)).slice(0, 25);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
        className="cursor-pointer"
      >
        <PhoneFrame width={width}>
          <WallpaperPreview
            variantStyle={variantStyle}
            title={title}
            startDate={startDate}
            endDate={endDate}
            accent={accent}
            lastWallpaperUpdateAt={lastWallpaperUpdateAt}
            width={width}
            height={height}
          />
        </PhoneFrame>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Wallpaper update debug
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-neutral-950 p-3">
                <div className="text-xs text-neutral-500">On screen</div>
                <div className="text-lg font-semibold text-white">{actualPct}%</div>
              </div>
              <div className="rounded-lg bg-neutral-950 p-3">
                <div className="text-xs text-neutral-500">Expected</div>
                <div className="text-lg font-semibold text-white">{expectedPct}%</div>
              </div>
              <div className="rounded-lg bg-neutral-950 p-3">
                <div className="text-xs text-neutral-500">Days behind</div>
                <div
                  className={`text-lg font-semibold ${
                    daysMissed === 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {daysMissed}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Diagnosis
              </div>
              <ul className="flex flex-col gap-2">
                {diagnosis.map((d, i) => (
                  <li
                    key={i}
                    className={`rounded-lg px-3 py-2 text-xs ${toneClass(d.level)}`}
                  >
                    {d.message}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Recent notification / wallpaper events
              </div>
              {relevantEvents.length === 0 ? (
                <div className="text-xs text-neutral-600">
                  No relevant events logged.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {relevantEvents.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <EventBadge type={e.type} />
                        {e.trigger && (
                          <span className="text-neutral-500">{e.trigger}</span>
                        )}
                        {e.detail && (
                          <span className="truncate text-neutral-500">
                            {e.detail}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-neutral-600">
                        {format(e._creationTime, "MMM d, HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function toneClass(level: DiagnosisLevel) {
  if (level === "ok") return "bg-emerald-500/10 text-emerald-400";
  if (level === "error") return "bg-red-500/10 text-red-400";
  return "bg-amber-500/10 text-amber-400";
}
