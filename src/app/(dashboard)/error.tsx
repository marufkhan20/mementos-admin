"use client";

export default function DashboardError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
        <h2 className="text-sm font-semibold text-red-400">
          Couldn&rsquo;t reach the Convex backend
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          This usually means <code className="text-neutral-300">convex/admin.ts</code>{" "}
          hasn&rsquo;t been pushed to your deployment yet, or{" "}
          <code className="text-neutral-300">ADMIN_DASHBOARD_SECRET</code> isn&rsquo;t set
          there. From the <code className="text-neutral-300">mementos/</code> project, run:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-950 p-3 text-xs text-neutral-300">
{`npx convex dev   # or: npx convex deploy
npx convex env set ADMIN_DASHBOARD_SECRET <value>`}
        </pre>
        <p className="mt-3 text-xs text-neutral-600">{error.message}</p>
      </div>
    </div>
  );
}
