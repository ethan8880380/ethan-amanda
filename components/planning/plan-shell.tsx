import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutFromPlan } from "@/app/plan/actions";
import { isPlanningAuthenticated } from "@/lib/planning-auth";
import {
  daysUntilWedding,
  formatWeddingDateLabel,
} from "@/lib/planning-presets";

const nav = [
  { href: "/plan/guests", label: "Guests" },
  { href: "/plan/mail", label: "Mail" },
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
    <div className="min-h-screen bg-[#f7f3ee] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#e4ddd4] bg-[#1c1714] text-[#f7f3ee] lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:border-[#2a241f]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-6 lg:py-8">
          <div className="min-w-0">
            <p className="font-serif text-xl tracking-tight lg:text-2xl">
              Ethan & Amanda
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#cbb9a8] lg:hidden">
              Planning · {countdown}
            </p>
            <p className="mt-1 hidden text-xs uppercase tracking-[0.2em] text-[#cbb9a8] lg:block">
              Planning portal
            </p>
            <p className="mt-4 hidden text-sm text-[#cbb9a8] lg:block">
              {formatWeddingDateLabel()}
            </p>
            <p className="mt-1 hidden text-xs uppercase tracking-[0.16em] text-[#a89482] lg:block">
              {countdown}
            </p>
          </div>
          <form action={logoutFromPlan} className="shrink-0 lg:hidden">
            <button
              type="submit"
              className="px-2 py-2 text-[10px] uppercase tracking-[0.16em] text-[#a89482] hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-4 [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap rounded-sm px-3 py-2.5 text-sm transition lg:rounded-none ${
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

        <form action={logoutFromPlan} className="mt-auto hidden px-6 pb-8 lg:block">
          <button
            type="submit"
            className="text-xs uppercase tracking-[0.18em] text-[#a89482] hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <header className="mb-5 border-b border-[#e4ddd4] pb-4 sm:mb-8 sm:pb-6">
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {title}
          </h1>
        </header>
        {children}
      </main>
    </div>
  );
}
