import Link from "next/link";
import { LayoutDashboard, Smartphone, Activity, LogOut } from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Smartphone },
  { href: "/events", label: "Events", icon: Activity },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-8 px-2">
          <div className="text-sm font-semibold tracking-wide text-white">MEMENTOS</div>
          <div className="text-xs text-neutral-500">Admin</div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-800 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}
