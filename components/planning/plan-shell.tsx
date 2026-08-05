import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutFromPlan } from "@/app/plan/actions";
import { isPlanningAuthenticated } from "@/lib/planning-auth";
import {
  daysUntilWedding,
  formatWeddingDateLabel,
} from "@/lib/planning-presets";

const nav = [
  { href: "/plan", label: "Overview" },
  { href: "/plan/guests", label: "Guests" },
  { href: "/plan/tasks", label: "Tasks" },
  { href: "/plan/vendors", label: "Vendors" },
  { href: "/plan/budget", label: "Budget" },
  { href: "/plan/timeline", label: "Timeline" },
  { href: "/plan/notes", label: "Notes" },
  { href: "/plan/settings", label: "Settings" },
];

export async function PlanShell({
  children,
  title,
  active,
}: {
  children: React.ReactNode;
  title: string;
  active?: string;
}) {
  const authed = await isPlanningAuthenticated();
  if (!authed) redirect("/plan/login");

  const days = daysUntilWedding();
  const countdown =
    days > 0
      ? `${days} days to go`
      : days === 0
        ? "Wedding day"
        : `${Math.abs(days)} days ago`;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#e4ddd4] bg-[#1c1714] text-[#f7f3ee] lg:border-b-0 lg:border-r lg:border-[#2a241f]">
        <div className="px-6 py-8">
          <p className="font-serif text-2xl tracking-tight">Ethan & Amanda</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#cbb9a8]">
            Planning portal
          </p>
          <p className="mt-4 text-sm text-[#cbb9a8]">{formatWeddingDateLabel()}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#a89482]">
            {countdown}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {nav.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-[#e8dfd4] hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutFromPlan} className="px-6 pb-8">
          <button
            type="submit"
            className="text-xs uppercase tracking-[0.18em] text-[#a89482] hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="px-6 py-8 lg:px-10">
        <header className="mb-8 border-b border-[#e4ddd4] pb-6">
          <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
