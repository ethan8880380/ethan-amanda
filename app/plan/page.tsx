import Link from "next/link";
import {
  getDashboardStats,
  getGuestPhase,
  seedPlanningStarterKit,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import {
  budgetCategoryLabel,
  daysUntilWedding,
  formatWeddingDateLabel,
} from "@/lib/planning-presets";
import { MEAL_CHOICES } from "@/lib/guests";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-[#e4ddd4] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#6f6258]">{hint}</p> : null}
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-3 h-2 w-full bg-[#efe8df]">
      <div className="h-full bg-[#1c1714]" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function PlanHomePage() {
  const [stats, phase] = await Promise.all([
    getDashboardStats(),
    getGuestPhase(),
  ]);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const days = daysUntilWedding();
  const isEmpty =
    stats.totalTasks === 0 &&
    stats.totalVendors === 0 &&
    stats.budgetEstimated === 0;
  const rsvpResponded = stats.attendingParties + stats.declinedParties;
  const mealEntries = Object.entries(stats.mealCounts);
  const budgetCategories = Object.entries(stats.budgetByCategory).sort(
    (a, b) => b[1].estimated - a[1].estimated,
  );

  return (
    <PlanShell title="Overview" active="/plan">
      {isEmpty ? (
        <div className="mb-8 border border-[#1c1714] bg-white px-5 py-5">
          <p className="font-serif text-2xl">Start with a full kit</p>
          <p className="mt-2 max-w-2xl text-sm text-[#6f6258]">
            One click loads a 20-item checklist (due dates from{" "}
            {formatWeddingDateLabel()}), vendor research stubs, a starter
            budget, planning notes, and the day-of timeline from your site
            content.
          </p>
          <form
            action={async () => {
              "use server";
              await seedPlanningStarterKit();
            }}
            className="mt-4"
          >
            <button
              type="submit"
              className="bg-[#1c1714] px-5 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee]"
            >
              Load starter kit
            </button>
          </form>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="border border-[#e4ddd4] bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Countdown
          </p>
          <p className="mt-2 font-serif text-3xl">
            {days > 0
              ? `${days} days`
              : days === 0
                ? "Today"
                : `${Math.abs(days)} days ago`}
          </p>
          <p className="mt-1 text-sm text-[#6f6258]">
            {formatWeddingDateLabel()}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border border-[#e4ddd4] bg-white px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
              Guest link phase
            </p>
            <p className="mt-1 font-serif text-2xl">
              {phase === "save_the_date" ? "Save the date" : "Invite / RSVP"}
            </p>
          </div>
          <Link
            href="/plan/settings"
            className="border border-[#1c1714] px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            Change phase
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Parties"
          value={stats.parties}
          hint={`${stats.addressesCollected} addresses · ${stats.pendingParties} RSVP pending`}
        />
        <Stat
          label="Guests"
          value={stats.guests}
          hint={`${stats.attendingGuests} yes · ${stats.declinedGuests} no · ${stats.plusOnes} plus-ones`}
        />
        <Stat
          label="Tasks done"
          value={`${stats.doneTasks}/${stats.totalTasks || 0}`}
          hint={
            stats.overdueTasks
              ? `${stats.overdueTasks} overdue`
              : `${stats.openTasks} still open`
          }
        />
        <Stat
          label="Vendors booked"
          value={`${stats.bookedVendors}/${stats.totalVendors || 0}`}
          hint={`Quotes ${currency.format(stats.vendorQuoted)}`}
        />
        <Stat
          label="Budget est."
          value={currency.format(stats.budgetEstimated)}
          hint={`Actual ${currency.format(stats.budgetActual)}`}
        />
        <Stat
          label="Deposits paid"
          value={currency.format(stats.vendorDeposits)}
        />
        <Stat
          label="RSVP response"
          value={
            stats.parties
              ? `${Math.round((rsvpResponded / stats.parties) * 100)}%`
              : "—"
          }
          hint={`${stats.attendingParties} attending · ${stats.declinedParties} declined`}
        />
        <Stat
          label="Addresses in"
          value={
            stats.parties
              ? `${Math.round((stats.addressesCollected / stats.parties) * 100)}%`
              : "—"
          }
          hint={`${stats.parties - stats.addressesCollected} still missing`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-[#e4ddd4] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-2xl">Task progress</p>
            <Link
              href="/plan/tasks"
              className="text-xs uppercase tracking-[0.18em] text-[#6f6258]"
            >
              View tasks
            </Link>
          </div>
          <ProgressBar value={stats.doneTasks} max={stats.totalTasks} />
          <p className="mt-2 text-sm text-[#6f6258]">
            {stats.doneTasks} of {stats.totalTasks} complete
          </p>
          {stats.dueSoonTasks.length ? (
            <ul className="mt-5 space-y-3">
              {stats.dueSoonTasks.map((task) => (
                <li key={task.id} className="border-t border-[#efe8df] pt-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-[#6f6258]">
                    Due {task.due_date}
                    {task.category ? ` · ${task.category}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#6f6258]">
              Nothing due in the next 3 weeks.
            </p>
          )}
        </div>

        <div className="border border-[#e4ddd4] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-2xl">Day-of preview</p>
            <Link
              href="/plan/timeline"
              className="text-xs uppercase tracking-[0.18em] text-[#6f6258]"
            >
              Full timeline
            </Link>
          </div>
          {stats.nextTimeline.length ? (
            <ul className="mt-5 space-y-3">
              {stats.nextTimeline.map((event) => (
                <li key={event.id} className="border-t border-[#efe8df] pt-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-[#6f6258]">
                    {event.starts_at
                      ? new Date(event.starts_at).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Time TBD"}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#6f6258]">
              Sync the timeline from Settings or the Timeline page.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="font-serif text-2xl">Budget by category</p>
          {budgetCategories.length ? (
            <ul className="mt-5 space-y-4">
              {budgetCategories.map(([category, amounts]) => (
                <li key={category}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{budgetCategoryLabel(category)}</span>
                    <span className="text-[#6f6258]">
                      {currency.format(amounts.estimated)}
                    </span>
                  </div>
                  <ProgressBar
                    value={amounts.actual}
                    max={amounts.estimated || 1}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#6f6258]">No budget items yet.</p>
          )}
        </div>

        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="font-serif text-2xl">Meal counts</p>
          {mealEntries.length ? (
            <ul className="mt-5 space-y-3">
              {MEAL_CHOICES.map((meal) => {
                const count = stats.mealCounts[meal.value] ?? 0;
                if (!count) return null;
                return (
                  <li
                    key={meal.value}
                    className="flex justify-between border-t border-[#efe8df] pt-3 text-sm"
                  >
                    <span>{meal.label}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#6f6258]">
              Meal choices appear after guests RSVP in invite phase.
            </p>
          )}
        </div>
      </div>
    </PlanShell>
  );
}
