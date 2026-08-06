import {
  getGuestPhase,
  listParties,
} from "@/app/plan/actions";
import { AddPartyForm } from "@/components/planning/add-party-form";
import { PartyCard } from "@/components/planning/party-card";
import { PlanShell } from "@/components/planning/plan-shell";
import { MEAL_CHOICES } from "@/lib/guests";

export default async function GuestsPage() {
  const [parties, phase] = await Promise.all([listParties(), getGuestPhase()]);
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const allGuests = parties.flatMap(
    (party) =>
      ((party.guests ?? []) as Array<{
        attending: boolean | null;
        meal_choice: string | null;
      }>),
  );
  const attending = allGuests.filter((g) => g.attending === true).length;
  const declined = allGuests.filter((g) => g.attending === false).length;
  const addresses = parties.filter((p) => p.address_collected_at).length;
  const mealCounts = MEAL_CHOICES.map((meal) => ({
    ...meal,
    count: allGuests.filter(
      (g) => g.attending === true && g.meal_choice === meal.value,
    ).length,
  })).filter((m) => m.count > 0);

  return (
    <PlanShell title="Guest list" active="/plan/guests">
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 sm:mb-8 sm:gap-4">
        <div className="border border-[#e4ddd4] bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:text-xs sm:tracking-[0.18em]">
            Parties
          </p>
          <p className="mt-1 font-serif text-2xl sm:mt-2 sm:text-3xl">
            {parties.length}
          </p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:text-xs sm:tracking-[0.18em]">
            Guests
          </p>
          <p className="mt-1 font-serif text-2xl sm:mt-2 sm:text-3xl">
            {allGuests.length}
          </p>
          <p className="mt-0.5 text-xs text-[#6f6258] sm:mt-1 sm:text-sm">
            {attending} yes · {declined} no
          </p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:text-xs sm:tracking-[0.18em]">
            Addresses
          </p>
          <p className="mt-1 font-serif text-2xl sm:mt-2 sm:text-3xl">
            {addresses}/{parties.length || 0}
          </p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:text-xs sm:tracking-[0.18em]">
            Link phase
          </p>
          <p className="mt-1 font-serif text-lg leading-tight sm:mt-2 sm:text-2xl">
            {phase === "save_the_date" ? "Save the date" : "Invite / RSVP"}
          </p>
        </div>
      </div>

      {mealCounts.length ? (
        <div className="mb-6 border border-[#e4ddd4] bg-white p-4 sm:mb-8 sm:p-5">
          <p className="font-serif text-xl sm:text-2xl">Meal totals</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:mt-4">
            {mealCounts.map((meal) => (
              <li key={meal.value}>
                <span className="text-[#6f6258]">{meal.label}</span>{" "}
                <span className="font-medium">{meal.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AddPartyForm origin={origin} />

      <section>
        <div className="mb-4 border-b border-[#e4ddd4] pb-3 sm:mb-5 sm:pb-4">
          <h2 className="font-serif text-2xl">Parties</h2>
          <p className="mt-1 text-sm text-[#6f6258]">
            {parties.length
              ? `${parties.length} household${parties.length === 1 ? "" : "s"} with invite links`
              : "Parties you create will show up here."}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {parties.length === 0 ? (
            <p className="text-[#6f6258]">No parties yet.</p>
          ) : (
            parties.map((party) => {
              const guests = (party.guests ?? []) as Array<{
                id: string;
                full_name: string;
                is_plus_one: boolean;
                attending: boolean | null;
                meal_choice: string | null;
                dietary_notes: string | null;
              }>;

              return (
                <PartyCard
                  key={party.id}
                  party={party}
                  guests={guests}
                  link={`${origin}/r/${party.access_token}`}
                />
              );
            })
          )}
        </div>
      </section>
    </PlanShell>
  );
}
