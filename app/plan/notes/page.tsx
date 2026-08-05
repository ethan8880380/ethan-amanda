import {
  createNote,
  deleteNote,
  listNotes,
  seedNotePresets,
  toggleNotePinned,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";

export default async function NotesPage() {
  const notes = await listNotes();

  return (
    <PlanShell title="Notes" active="/plan/notes">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border border-[#e4ddd4] bg-white px-5 py-4">
        <div>
          <p className="font-serif text-2xl">Planning notes</p>
          <p className="mt-1 text-sm text-[#6f6258]">
            Seed vision, decision log, open questions, and day-of contacts.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await seedNotePresets();
          }}
        >
          <button
            type="submit"
            className="border border-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em]"
          >
            Load note templates
          </button>
        </form>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await createNote({
            title: String(formData.get("title") ?? ""),
            body: String(formData.get("body") ?? ""),
            pinned: formData.get("pinned") === "on",
          });
        }}
        className="mb-8 grid gap-3 border border-[#e4ddd4] bg-white p-6"
      >
        <p className="font-serif text-2xl">Add note</p>
        <input
          name="title"
          required
          placeholder="Title"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <textarea
          name="body"
          required
          rows={4}
          placeholder="Details"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pinned" />
          Pin to top
        </label>
        <button
          type="submit"
          className="bg-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee] md:w-fit"
        >
          Save note
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {notes.length === 0 ? (
          <p className="text-[#6f6258] md:col-span-2">
            No notes yet — load templates to get structured scratchpads.
          </p>
        ) : null}
        {notes.map((note) => (
          <article
            key={note.id}
            className="border border-[#e4ddd4] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {note.pinned ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6f6258]">
                    Pinned
                  </p>
                ) : null}
                <h2 className="font-serif text-xl">{note.title}</h2>
              </div>
              <div className="flex gap-3">
                <form
                  action={async () => {
                    "use server";
                    await toggleNotePinned(note.id, !note.pinned);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-[0.18em] text-[#6f6258]"
                  >
                    {note.pinned ? "Unpin" : "Pin"}
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deleteNote(note.id);
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
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[#4d433c]">
              {note.body}
            </p>
          </article>
        ))}
      </div>
    </PlanShell>
  );
}
