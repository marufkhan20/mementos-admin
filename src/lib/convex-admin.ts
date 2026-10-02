import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

// This whole module only runs on the Next.js server (route handlers / server
// components). ADMIN_DASHBOARD_SECRET never reaches the browser bundle —
// that's the entire point of not using ConvexReactClient here.

function getClient() {
  const url = process.env.CONVEX_URL;
  if (!url) throw new Error("CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

function getSecret() {
  const secret = process.env.ADMIN_DASHBOARD_SECRET;
  if (!secret) throw new Error("ADMIN_DASHBOARD_SECRET is not set");
  return secret;
}

export type Device = {
  deviceId: string;
  platform: string | null;
  appVersion: string | null;
  isPro: boolean;
  lastSeenAt: number;
  goalTitle: string | null;
  variantStyle: string | null;
  startDate: string | null;
  endDate: string | null;
  accent: string | null;
  opacity: number | null;
  lastWallpaperUpdateAt: number | null;
};

export type DeviceEvent = {
  _id: string;
  _creationTime: number;
  deviceId: string;
  type: string;
  trigger?: string;
  detail?: string;
  platform?: string;
};

export type OverviewStats = {
  totalDevices: number;
  activeToday: number;
  active7d: number;
  active30d: number;
  proCount: number;
  proPct: number;
  notification: { scheduled: number; tapped: number; tapRate: number | null };
  wallpaper: {
    success: number;
    failed: number;
    skipped: number;
    successRate: number | null;
  };
  purchase: { started: number; completed: number; conversionRate: number | null };
  countByType: Record<string, number>;
};

export type PaginationResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const client = getClient();
  return client.query(anyApi.admin.overviewStats, { adminSecret: getSecret() });
}

export async function fetchDevices(
  cursor: string | null,
  filter: "all" | "pro" | "free" = "all",
  numItems = 25,
): Promise<PaginationResult<Device>> {
  const client = getClient();
  return client.query(anyApi.admin.listDevices, {
    adminSecret: getSecret(),
    paginationOpts: { numItems, cursor },
    filter,
  });
}

export async function fetchDevice(deviceId: string) {
  const client = getClient();
  return client.query(anyApi.admin.getDevice, {
    adminSecret: getSecret(),
    deviceId,
  }) as Promise<{
    device: any;
    goal: any;
    events: DeviceEvent[];
    lastWallpaperUpdateAt: number | null;
  } | null>;
}

export async function fetchEvents(
  cursor: string | null,
  type?: string,
  numItems = 50,
): Promise<PaginationResult<DeviceEvent>> {
  const client = getClient();
  return client.query(anyApi.admin.listEvents, {
    adminSecret: getSecret(),
    paginationOpts: { numItems, cursor },
    type: type || undefined,
  });
}

export async function fetchEventCountsByDay(days = 14) {
  const client = getClient();
  return client.query(anyApi.admin.eventCountsByDay, {
    adminSecret: getSecret(),
    days,
  }) as Promise<{ date: string; counts: Record<string, number> }[]>;
}
