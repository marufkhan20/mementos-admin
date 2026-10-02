export type DiagnosisLevel = "ok" | "warn" | "error";
export type DiagnosisItem = { level: DiagnosisLevel; message: string };

export type EventLite = {
  type: string;
  trigger?: string;
  detail?: string;
  _creationTime: number;
};

// Rule-based explanation for "why is this device behind" — built entirely
// from signals the app already reports (diagnostics + event log), most
// specific cause first.
export function diagnoseDevice(params: {
  isPro: boolean;
  canScheduleExactAlarms?: boolean;
  ignoringBatteryOptimizations?: boolean;
  daysMissed: number;
  events: EventLite[]; // most recent first
}): DiagnosisItem[] {
  const { isPro, canScheduleExactAlarms, ignoringBatteryOptimizations, daysMissed, events } = params;

  if (daysMissed === 0) {
    return [{ level: "ok", message: "Wallpaper is up to date — no issue detected." }];
  }

  const findLast = (type: string, trigger?: string) =>
    events.find((e) => e.type === type && (!trigger || e.trigger === trigger));

  const items: DiagnosisItem[] = [];

  if (isPro) {
    // Nightly background task — gated on these two OS permissions.
    if (canScheduleExactAlarms === false) {
      items.push({
        level: "error",
        message:
          "Exact alarms are not permitted on this device — Android may delay or drop the nightly alarm entirely.",
      });
    }
    if (ignoringBatteryOptimizations === false) {
      items.push({
        level: "error",
        message:
          "Battery optimization is NOT disabled — the OEM's battery manager can kill the background task before it runs.",
      });
    }

    const failedAlarm = findLast("alarm_schedule_failed");
    if (failedAlarm) {
      items.push({
        level: "error",
        message: `Alarm scheduling failed: ${failedAlarm.detail ?? "no detail logged"}.`,
      });
    }

    const failedNightly = findLast("wallpaper_update_failed", "nightly");
    if (failedNightly) {
      items.push({
        level: "error",
        message: `Last nightly render failed: ${failedNightly.detail ?? "no detail logged"}.`,
      });
    }

    const skippedNightly = findLast("wallpaper_update_skipped", "nightly");
    if (skippedNightly) {
      items.push({
        level: "warn",
        message: `Last nightly run was skipped (reason: ${skippedNightly.detail ?? "unknown"}).`,
      });
    }

    if (items.length === 0) {
      items.push({
        level: "warn",
        message:
          "No nightly update events found recently — the alarm may not be scheduled. Opening the app reschedules it.",
      });
    }
  } else {
    // Free plan — relies on the user tapping the daily notification.
    const scheduleFailed = findLast("notification_schedule_failed");
    const scheduled = findLast("notification_scheduled");
    const tapped = findLast("notification_tapped");
    const failedTap = findLast("wallpaper_update_failed", "notification_tap");
    const successTap = findLast("wallpaper_update_success", "notification_tap");

    if (scheduleFailed) {
      items.push({
        level: "error",
        message: `The daily notification couldn't be scheduled: ${scheduleFailed.detail ?? "no detail logged"}.`,
      });
    } else if (!scheduled) {
      items.push({
        level: "warn",
        message:
          "No record of the daily notification ever being scheduled — likely an older app version that predates this tracking.",
      });
    }

    if (failedTap) {
      items.push({
        level: "error",
        message: `The notification was tapped, but the wallpaper update failed: ${failedTap.detail ?? "no detail logged"}.`,
      });
    } else if (scheduled && !tapped) {
      items.push({
        level: "warn",
        message:
          "Notification was scheduled but has never been tapped — the free plan has no automatic background update, so the user has to tap it.",
      });
    } else if (tapped && !successTap) {
      items.push({
        level: "warn",
        message:
          "The notification has been tapped before, but no successful update was logged since — possibly an older app version, or the tap didn't trigger a render.",
      });
    }
  }

  if (items.length === 0) {
    items.push({
      level: "warn",
      message: "Behind schedule, but no specific cause found in the recent event log.",
    });
  }

  return items;
}
