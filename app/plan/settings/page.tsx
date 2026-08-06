import {
  getGuestPhase,
  setGuestPhase,
  syncTimelineFromSite,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import {
  daysUntilWedding,
  formatWeddingDateLabel,
} from "@/lib/planning-presets";
import { weddingContent } from "@/lib/wedding-content";

export default async function SettingsPage() {
  const phase = await getGuestPhase();
  const days = daysUntilWedding();

  return (
    <PlanShell title="Settings" active="/plan/settings">
      <div className="grid max-w-3xl gap-6">
        <div className="border border-[#e4ddd4] bg-white p-6">
          <p className="font-serif text-2xl">Wedding date source</p>
          <p className="mt-2 text-sm text-[#6f6258]">
            Timeline sync reads from{" "}
            <code className="bg-[#f7f3ee] px-1">lib/wedding-content.ts</code>.
          </p>
          <p className="mt-4 font-serif text-3xl">{formatWeddingDateLabel()}</p>
          <p className="mt-1 text-sm text-[#6f6258]">
            ISO {weddingContent.date.iso}
            {days >= 0 ? ` · ${days} days remaining` : ` · ${Math.abs(days)} days ago`}
          </p>
          <p className="mt-3 text-sm text-[#6f6258]">
            Ceremony: {weddingContent.venue.ceremony.name} · Reception:{" "}
            {weddingContent.venue.reception.name}
          </p>
        </div>

        <div className="border border-[#e4ddd4] bg-white p-6">
          <p className="font-serif text-2xl">Guest link phase</p>
          <p className="mt-2 text-sm text-[#6f6258]">
            Controls what every <code className="bg-[#f7f3ee] px-1">/r/{"{token}"}</code>{" "}
            page shows. Save-the-date collects mailing addresses; invite collects
            RSVP + meal choices.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Current:{" "}
            {phase === "save_the_date" ? "Save the date" : "Invite / RSVP"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form
              action={async () => {
                "use server";
                await setGuestPhase("save_the_date");
              }}
            >
              <button
                type="submit"
                className={`px-4 py-3 text-xs uppercase tracking-[0.18em] ${
                  phase === "save_the_date"
                    ? "bg-[#1c1714] text-white"
                    : "border border-[#1c1714]"
                }`}
              >
                Save the date
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await setGuestPhase("invite");
              }}
            >
              <button
                type="submit"
                className={`px-4 py-3 text-xs uppercase tracking-[0.18em] ${
                  phase === "invite"
                    ? "bg-[#1c1714] text-white"
                    : "border border-[#1c1714]"
                }`}
              >
                Invite / RSVP
              </button>
            </form>
          </div>
        </div>

        <div className="border border-[#e4ddd4] bg-white p-6">
          <p className="font-serif text-2xl">Day-of timeline</p>
          <p className="mt-2 text-sm text-[#6f6258]">
            Replaces the current timeline with the schedule from the wedding
            site.
          </p>
          <form
            action={async () => {
              "use server";
              await syncTimelineFromSite();
            }}
            className="mt-5"
          >
            <button
              type="submit"
              className="border border-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em]"
            >
              Re-sync day-of timeline
            </button>
          </form>
        </div>
      </div>
    </PlanShell>
  );
}
