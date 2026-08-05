import {
  addGuestToParty,
  createParty,
  deleteGuest,
  deleteParty,
  getGuestPhase,
  listParties,
} from "@/app/plan/actions";
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
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Parties
          </p>
          <p className="mt-2 font-serif text-3xl">{parties.length}</p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Guests
          </p>
          <p className="mt-2 font-serif text-3xl">{allGuests.length}</p>
          <p className="mt-1 text-sm text-[#6f6258]">
            {attending} yes · {declined} no
          </p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Addresses
          </p>
          <p className="mt-2 font-serif text-3xl">
            {addresses}/{parties.length || 0}
          </p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Link phase
          </p>
          <p className="mt-2 font-serif text-2xl">
            {phase === "save_the_date" ? "Save the date" : "Invite / RSVP"}
          </p>
        </div>
      </div>

      {mealCounts.length ? (
        <div className="mb-8 border border-[#e4ddd4] bg-white p-5">
          <p className="font-serif text-2xl">Meal totals</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {mealCounts.map((meal) => (
              <li key={meal.value}>
                <span className="text-[#6f6258]">{meal.label}</span>{" "}
                <span className="font-medium">{meal.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          const guestNames = String(formData.get("guest_names") ?? "")
            .split("\n")
            .map((n) => n.trim())
            .filter(Boolean);
          await createParty({
            party_name: String(formData.get("party_name") ?? ""),
            contact_email:
              String(formData.get("contact_email") ?? "") || undefined,
            contact_phone:
              String(formData.get("contact_phone") ?? "") || undefined,
            notes: String(formData.get("notes") ?? "") || undefined,
            guest_names: guestNames,
            plus_one_name:
              String(formData.get("plus_one_name") ?? "") || undefined,
          });
        }}
        className="mb-10 grid gap-4 border border-[#e4ddd4] bg-white p-6 md:grid-cols-2"
      >
        <p className="font-serif text-2xl md:col-span-2">Add party</p>
        <label className="text-sm">
          Party name
          <input
            name="party_name"
            required
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
            placeholder="The Smiths"
          />
        </label>
        <label className="text-sm">
          Contact email
          <input
            name="contact_email"
            type="email"
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Contact phone
          <input
            name="contact_phone"
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Plus-one slot name (optional)
          <input
            name="plus_one_name"
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
            placeholder="Guest of Alex"
          />
        </label>
        <label className="text-sm md:col-span-2">
          Guest names (one per line)
          <textarea
            name="guest_names"
            required
            rows={4}
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
            placeholder={"Alex Smith\nJamie Smith"}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Notes
          <textarea
            name="notes"
            rows={2}
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="bg-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee] md:col-span-2 md:w-fit"
        >
          Create party + invite link
        </button>
      </form>

      <div className="space-y-6">
        {parties.length === 0 ? (
          <p className="text-[#6f6258]">No parties yet.</p>
        ) : (
          parties.map((party) => {
            const link = `${origin}/r/${party.access_token}`;
            const guests = (party.guests ?? []) as Array<{
              id: string;
              full_name: string;
              is_plus_one: boolean;
              attending: boolean | null;
              meal_choice: string | null;
              dietary_notes: string | null;
            }>;
            const address = [
              party.address_line1,
              party.address_line2,
              [party.city, party.state, party.postal_code]
                .filter(Boolean)
                .join(", "),
              party.country,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article
                key={party.id}
                className="border border-[#e4ddd4] bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl">
                      {party.party_name || "Untitled party"}
                    </h2>
                    <p className="mt-1 text-sm text-[#6f6258]">
                      RSVP: {party.rsvp_status}
                      {party.address_collected_at
                        ? " · address collected"
                        : " · address pending"}
                      {party.contact_email ? ` · ${party.contact_email}` : ""}
                      {party.contact_phone ? ` · ${party.contact_phone}` : ""}
                    </p>
                    {address ? (
                      <p className="mt-2 text-sm text-[#6f6258]">{address}</p>
                    ) : null}
                    {party.notes ? (
                      <p className="mt-2 text-sm text-[#6f6258]">{party.notes}</p>
                    ) : null}
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await deleteParty(party.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-[0.18em] text-red-700"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6f6258]">
                    Personalized link
                  </p>
                  <code className="mt-2 block break-all bg-[#f7f3ee] px-3 py-2 text-sm">
                    {link}
                  </code>
                </div>

                <ul className="mt-4 space-y-2 border-t border-[#eee6dc] pt-4">
                  {guests.map((guest) => (
                    <li
                      key={guest.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {guest.full_name}
                        {guest.is_plus_one ? (
                          <span className="ml-2 text-[#6f6258]">(+1)</span>
                        ) : null}
                        {guest.dietary_notes ? (
                          <span className="ml-2 text-[#6f6258]">
                            ({guest.dietary_notes})
                          </span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-3 text-[#6f6258]">
                        {guest.attending == null
                          ? "—"
                          : guest.attending
                            ? `Attending${guest.meal_choice ? ` · ${guest.meal_choice}` : ""}`
                            : "Declined"}
                        <form
                          action={async () => {
                            "use server";
                            await deleteGuest(guest.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs uppercase tracking-[0.14em] text-red-700"
                          >
                            Remove
                          </button>
                        </form>
                      </span>
                    </li>
                  ))}
                </ul>

                <form
                  action={async (formData) => {
                    "use server";
                    await addGuestToParty({
                      party_id: party.id,
                      full_name: String(formData.get("full_name") ?? ""),
                      is_plus_one: formData.get("is_plus_one") === "on",
                    });
                  }}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <label className="text-sm">
                    Add guest
                    <input
                      name="full_name"
                      required
                      className="mt-1 block border border-[#d9d0c5] px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 pb-2 text-sm">
                    <input type="checkbox" name="is_plus_one" />
                    Plus-one slot
                  </label>
                  <button
                    type="submit"
                    className="border border-[#1c1714] px-3 py-2 text-xs uppercase tracking-[0.18em]"
                  >
                    Add
                  </button>
                </form>
              </article>
            );
          })
        )}
      </div>
    </PlanShell>
  );
}
