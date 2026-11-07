import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  syncTimelineFromSite,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import { formatWeddingDateLabel } from "@/lib/planning-presets";
import { weddingContent } from "@/lib/wedding-content";

export default async function TimelinePage() {
  const events = await listTimelineEvents();

  return (
    <PlanShell title="Timeline" active="/plan/timeline">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-[1.75rem] bg-[#161616] px-5 py-4">
        <div>
          <p className="font-medium text-2xl">Day-of run sheet</p>
          <p className="mt-1 max-w-xl text-sm text-[#8e8e8e]">
            Sync pulls schedule items from the wedding site for{" "}
            {formatWeddingDateLabel()}, using ceremony (
            {weddingContent.venue.ceremony.name}) and reception (
            {weddingContent.venue.reception.name}) locations. This replaces the
            current timeline.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await syncTimelineFromSite();
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.18em]"
          >
            Sync from site
          </button>
        </form>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await createTimelineEvent({
            title: String(formData.get("title") ?? ""),
            starts_at: String(formData.get("starts_at") ?? "") || undefined,
            ends_at: String(formData.get("ends_at") ?? "") || undefined,
            location: String(formData.get("location") ?? "") || undefined,
            notes: String(formData.get("notes") ?? "") || undefined,
          });
        }}
        className="mb-8 grid gap-3 rounded-[1.75rem] bg-[#161616] p-6 md:grid-cols-2"
      >
        <p className="font-medium text-2xl md:col-span-2">Add event</p>
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <label className="text-sm">
          Starts
          <input
            name="starts_at"
            type="datetime-local"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Ends
          <input
            name="ends_at"
            type="datetime-local"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-2"
          />
        </label>
        <input
          name="location"
          placeholder="Location"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <textarea
          name="notes"
          placeholder="Notes"
          rows={2}
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-3 text-xs uppercase tracking-[0.18em] text-black md:w-fit"
        >
          Add event
        </button>
      </form>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-[#8e8e8e]">
            No events yet — sync from the wedding site schedule.
          </p>
        ) : null}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-[1.75rem] bg-[#161616] px-5 py-4"
          >
            <div>
              <p className="font-medium text-xl">{event.title}</p>
              <p className="text-sm text-[#8e8e8e]">
                {[
                  event.starts_at
                    ? new Date(event.starts_at).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : null,
                  event.ends_at
                    ? `to ${new Date(event.ends_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}`
                    : null,
                  event.location,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Unscheduled"}
              </p>
              {event.notes ? (
                <p className="mt-2 text-sm text-[#8e8e8e]">{event.notes}</p>
              ) : null}
            </div>
            <form
              action={async () => {
                "use server";
                await deleteTimelineEvent(event.id);
              }}
            >
              <button
                type="submit"
                className="text-xs uppercase tracking-[0.18em] text-[#ff453a]"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </PlanShell>
  );
}
