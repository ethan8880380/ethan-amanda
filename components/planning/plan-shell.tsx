import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Users } from "lucide-react";
import { logoutFromPlan } from "@/app/plan/actions";
import { Glyph } from "@/components/planning/glyph";
import { isPlanningAuthenticated } from "@/lib/planning-auth";
import { daysUntilWedding } from "@/lib/planning-presets";

const nav = [
  { href: "/plan/guests", label: "Guests", icon: Users },
  { href: "/plan/mail", label: "Mail", icon: Mail },
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
    days > 0 ? `${days} days` : days === 0 ? "Today" : `${Math.abs(days)} days ago`;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Glyph className="h-5 w-11" />
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8e8e8e]">
              Plan
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#8e8e8e]">
            <p>{countdown}</p>
            <form action={logoutFromPlan}>
              <button type="submit" className="text-sm text-[#8e8e8e]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-28 pt-6">
        <h1 className="text-[2rem] font-medium leading-none tracking-tight">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-2 pb-[env(safe-area-inset-bottom)]">
          {nav.map((item) => {
            const isActive = active === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] ${
                  isActive ? "text-white" : "text-[#5e5e5e]"
                }`}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
