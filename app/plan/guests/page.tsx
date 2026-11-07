import {
  getGuestPhase,
  listParties,
} from "@/app/plan/actions";
import { AddPartyForm } from "@/components/planning/add-party-form";
import { GuestList } from "@/components/planning/guest-list";
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
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-[1.75rem] bg-[#161616] p-5">
          <p className="text-sm text-[#8e8e8e]">Parties</p>
          <p className="mt-2 text-3xl font-medium tracking-tight">
            {parties.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-[#161616] p-5">
          <p className="text-sm text-[#8e8e8e]">Guests</p>
          <p className="mt-2 text-3xl font-medium tracking-tight">
            {allGuests.length}
          </p>
          <p className="mt-1 text-sm text-[#8e8e8e]">
            {attending} yes · {declined} no
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-[#161616] p-5">
          <p className="text-sm text-[#8e8e8e]">Addresses</p>
          <p className="mt-2 text-3xl font-medium tracking-tight">
            {addresses}/{parties.length || 0}
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-[#161616] p-5">
          <p className="text-sm text-[#8e8e8e]">Link phase</p>
          <p className="mt-2 text-2xl font-medium tracking-tight">
            {phase === "save_the_date" ? "Save the date" : "Invite / RSVP"}
          </p>
        </div>
      </div>

      {mealCounts.length ? (
        <div className="mb-6 rounded-[1.75rem] bg-[#161616] p-4 sm:mb-8 sm:p-5">
          <p className="font-medium text-xl sm:text-2xl">Meal totals</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:mt-4">
            {mealCounts.map((meal) => (
              <li key={meal.value}>
                <span className="text-[#8e8e8e]">{meal.label}</span>{" "}
                <span className="font-medium">{meal.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AddPartyForm origin={origin} />

      <GuestList parties={parties} origin={origin} />
    </PlanShell>
  );
}
