import { getGoalStats, GoalStats } from "@/lib/goalStats";

type Props = {
  variantStyle: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  accent: string | null;
  lastWallpaperUpdateAt: number | null;
  width: number;
  height: number;
  devices?: boolean;
};

const DEFAULT_ACCENT = "#52A4F2";

export function WallpaperPreview({
  variantStyle,
  title,
  startDate,
  endDate,
  accent,
  lastWallpaperUpdateAt,
  width,
  height,
  devices,
}: Props) {
  if (!startDate || !endDate) {
    return (
      <div
        className="flex items-center justify-center bg-neutral-950 px-4 text-center text-[10px] text-neutral-600"
        style={{ width, height }}
      >
        No goal set yet
      </div>
    );
  }

  const color = accent || DEFAULT_ACCENT;

  // The dots/ring/etc render the ACTUAL state of the device's lock screen
  // right now — i.e. progress as of the last time a wallpaper render
  // actually succeeded, not as of today. If it never succeeded, that's day
  // zero: nothing has ever actually been drawn on their screen.
  const actualAsOf = lastWallpaperUpdateAt
    ? new Date(lastWallpaperUpdateAt)
    : new Date(startDate);
  const actual = getGoalStats(startDate, endDate, actualAsOf);
  const expected = getGoalStats(startDate, endDate); // as of right now, if it were up to date
  const daysMissed = Math.max(0, expected.daysPassed - actual.daysPassed);

  const props = {
    title: title ?? "",
    accent: color,
    width,
    height,
    stats: actual,
    expected,
    daysMissed,
    devices,
  };

  switch (variantStyle) {
    case "minimal":
      return <CounterPreview {...props} />;
    case "ring":
      return <RingPreview {...props} />;
    case "matrix":
      return <MatrixPreview {...props} />;
    case "calendar":
      return <CalendarPreview {...props} />;
    case "horizon":
      return <HorizonPreview {...props} />;
    case "dotgrid":
    default:
      return <DotGridPreview {...props} />;
  }
}

type Inner = {
  title: string;
  accent: string;
  width: number;
  height: number;
  stats: GoalStats; // actual, on-screen-right-now stats
  expected: GoalStats; // what it should be if fully up to date
  daysMissed: number;
  devices?: boolean;
};

function Shell({
  children,
  width,
  height,
}: { children: React.ReactNode } & Pick<Inner, "width" | "height">) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-black px-2"
      style={{ width, height }}
    >
      {children}
    </div>
  );
}

function Footer({ title, accent, stats, expected, daysMissed }: Inner) {
  return (
    <div className="mt-2 flex flex-col items-center gap-0.5">
      <div className="text-[9px] font-semibold" style={{ color: accent }}>
        {stats.daysLeft}d left · {stats.pct}%
      </div>
      {daysMissed === 0 ? (
        <div className="text-[8px] text-emerald-500">✓ up to date</div>
      ) : (
        <div className="text-[8px] text-amber-500">
          {daysMissed}d behind · should be {expected.pct}%
        </div>
      )}
      {title && (
        <div className="max-w-[140px] truncate text-[8px] text-neutral-500">
          {title}
        </div>
      )}
    </div>
  );
}

// ── Dot Grid ────────────────────────────────────────────────────────────────
function DotGridPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  const COLS = p.devices ? 9 : 11;
  const DOT = p.devices ? 10 : 15;
  const GAP = p.devices ? 5 : 7;
  const STEP = DOT + GAP;
  const maxRows = 9;
  const total = Math.min(stats.totalDays, COLS * maxRows);
  const rows = Math.ceil(total / COLS);
  const gridW = COLS * STEP - GAP;
  const gridH = rows * STEP - GAP;

  return (
    <Shell width={width} height={height}>
      <svg width={gridW} height={gridH}>
        {Array.from({ length: total }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const fill =
            i < stats.daysPassed
              ? "rgba(255,255,255,0.65)"
              : i === stats.daysPassed
                ? accent
                : "rgba(255,255,255,0.1)";
          return (
            <circle
              key={i}
              cx={col * STEP + DOT / 2}
              cy={row * STEP + DOT / 2}
              r={DOT / 2}
              fill={fill}
            />
          );
        })}
      </svg>
      <Footer {...p} />
    </Shell>
  );
}

// ── Counter ("minimal") ──────────────────────────────────────────────────────
function CounterPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  return (
    <Shell width={width} height={height}>
      <div className="text-4xl font-bold" style={{ color: accent }}>
        {stats.daysLeft}
      </div>
      <div className="mb-2 text-[9px] uppercase tracking-wide text-neutral-500">
        days left
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${stats.pct}%`, backgroundColor: accent }}
        />
      </div>
      <Footer {...p} />
    </Shell>
  );
}

// ── Ring ─────────────────────────────────────────────────────────────────────
function RingPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  const R = 34;
  const STROKE = 7;
  const C = 2 * Math.PI * R;
  const offset = C - (stats.pct / 100) * C;

  return (
    <Shell width={width} height={height}>
      <svg
        width={R * 2 + STROKE}
        height={R * 2 + STROKE}
        viewBox={`0 0 ${R * 2 + STROKE} ${R * 2 + STROKE}`}
      >
        <circle
          cx={R + STROKE / 2}
          cy={R + STROKE / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />
        <circle
          cx={R + STROKE / 2}
          cy={R + STROKE / 2}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${R + STROKE / 2} ${R + STROKE / 2})`}
        />
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="15"
          fontWeight="700"
        >
          {stats.pct}%
        </text>
      </svg>
      <Footer {...p} />
    </Shell>
  );
}

// ── Matrix ───────────────────────────────────────────────────────────────────
function MatrixPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  const COLS = 9;
  const SIZE = 3.2;
  const GAP = 2.2;
  const STEP = SIZE + GAP;
  const maxRows = 9;
  const total = Math.min(stats.totalDays, COLS * maxRows);
  const rows = Math.ceil(total / COLS);
  const gridW = COLS * STEP - GAP;
  const gridH = rows * STEP - GAP;

  return (
    <Shell width={width} height={height}>
      <svg width={gridW} height={gridH}>
        {Array.from({ length: total }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const fill =
            i <= stats.daysPassed ? accent : "rgba(255,255,255,0.07)";
          const opacity =
            i === stats.daysPassed ? 1 : i < stats.daysPassed ? 0.55 : 1;
          return (
            <rect
              key={i}
              x={col * STEP}
              y={row * STEP}
              width={SIZE}
              height={SIZE}
              rx={0.6}
              fill={fill}
              opacity={opacity}
            />
          );
        })}
      </svg>
      <Footer {...p} />
    </Shell>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────
function CalendarPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  const COLS = 5;
  const SIZE = 10;
  const GAP = 3;
  const STEP = SIZE + GAP;
  const total = Math.min(stats.totalMonths, COLS * 6);
  const rows = Math.ceil(total / COLS);

  return (
    <Shell width={width} height={height}>
      <svg width={COLS * STEP - GAP} height={rows * STEP - GAP}>
        {Array.from({ length: total }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const isPast = i < stats.monthsPassed;
          const isCurrent = i === stats.monthsPassed;
          const fill = isPast || isCurrent ? accent : "rgba(255,255,255,0.07)";
          return (
            <rect
              key={i}
              x={col * STEP}
              y={row * STEP}
              width={SIZE}
              height={SIZE}
              rx={2}
              fill={fill}
              opacity={isPast ? 0.5 : 1}
            />
          );
        })}
      </svg>
      <Footer {...p} />
    </Shell>
  );
}

// ── Horizon ──────────────────────────────────────────────────────────────────
function HorizonPreview(p: Inner) {
  const { accent, width, height, stats } = p;
  const barH = 70;
  const litH = Math.max(2, (stats.pct / 100) * barH);

  return (
    <Shell width={width} height={height}>
      <div
        className="relative w-28 overflow-hidden rounded-md"
        style={{ height: barH }}
      >
        <div className="absolute inset-0 bg-neutral-900" />
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: litH,
            background: `linear-gradient(to top, ${accent}, ${accent}55)`,
          }}
        />
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            bottom: litH,
            boxShadow: `0 0 6px 1px ${accent}`,
            backgroundColor: accent,
          }}
        />
      </div>
      <Footer {...p} />
    </Shell>
  );
}
