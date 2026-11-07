import {
  createNote,
  deleteNote,
  listNotes,
  toggleNotePinned,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";

export default async function NotesPage() {
  const notes = await listNotes();

  return (
    <PlanShell title="Notes" active="/plan/notes">
      <div className="mb-6 rounded-[1.75rem] bg-[#161616] px-5 py-4">
        <p className="font-medium text-2xl">Planning notes</p>
        <p className="mt-1 text-sm text-[#8e8e8e]">
          Scratchpad for decisions, questions, and day-of details.
        </p>
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
        className="mb-8 grid gap-3 rounded-[1.75rem] bg-[#161616] p-6"
      >
        <p className="font-medium text-2xl">Add note</p>
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <textarea
          name="body"
          required
          rows={4}
          placeholder="Details"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pinned" />
          Pin to top
        </label>
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-3 text-xs uppercase tracking-[0.18em] text-black md:w-fit"
        >
          Save note
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {notes.length === 0 ? (
          <p className="text-[#8e8e8e] md:col-span-2">
            No notes yet — add one above.
          </p>
        ) : null}
        {notes.map((note) => (
          <article
            key={note.id}
            className="rounded-[1.75rem] bg-[#161616] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {note.pinned ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8e8e8e]">
                    Pinned
                  </p>
                ) : null}
                <h2 className="font-medium text-xl">{note.title}</h2>
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
                    className="text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
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
                    className="text-xs uppercase tracking-[0.18em] text-[#ff453a]"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[#d4d4d4]">
              {note.body}
            </p>
          </article>
        ))}
      </div>
    </PlanShell>
  );
}
