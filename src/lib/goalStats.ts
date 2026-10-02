// Mirrors getLiveStats() in the RN app's SkiaWallpaperRenderer.js — same
// local-midnight normalization, so the progress shown here matches what's
// actually on the user's lock screen right now.
export type GoalStats = {
  totalDays: number;
  daysPassed: number;
  daysLeft: number;
  pct: number;
  totalMonths: number;
  monthsPassed: number;
};

export function getGoalStats(
  startDate: string,
  endDate: string,
  asOf: Date = new Date(),
): GoalStats {
  const now = asOf;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalMs = e.getTime() - s.getTime();
  const passedMs = today.getTime() - s.getTime();
  const totalDays = Math.max(1, Math.round(totalMs / 86_400_000));
  const daysPassed = Math.min(totalDays, Math.max(0, Math.round(passedMs / 86_400_000)));
  const daysLeft = Math.max(0, totalDays - daysPassed);
  const pct = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
  const totalMonths = Math.max(1, Math.round(totalMs / (86_400_000 * 30.44)));
  const monthsPassed = Math.min(
    totalMonths,
    Math.max(0, Math.round(passedMs / (86_400_000 * 30.44))),
  );

  return { totalDays, daysPassed, daysLeft, pct, totalMonths, monthsPassed };
}
