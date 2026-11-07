import {
  createTask,
  deleteTask,
  listTasks,
  updateTaskStatus,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import { TASK_CATEGORIES } from "@/lib/planning-presets";

export default async function TasksPage() {
  const tasks = await listTasks();
  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const overdue = open.filter((t) => t.due_date && t.due_date < today);
  const byCategory = TASK_CATEGORIES.map((category) => ({
    category,
    total: tasks.filter((t) => t.category === category).length,
    done: tasks.filter((t) => t.category === category && t.status === "done")
      .length,
  })).filter((row) => row.total > 0);

  return (
    <PlanShell title="Tasks" active="/plan/tasks">
      <div className="mb-6 rounded-[1.75rem] bg-[#161616] px-5 py-4">
        <p className="font-medium text-2xl">Checklist</p>
        <p className="mt-1 text-sm text-[#8e8e8e]">
          {done.length}/{tasks.length} done
          {overdue.length ? ` · ${overdue.length} overdue` : ""}
        </p>
      </div>

      {byCategory.length ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {byCategory.map((row) => (
            <div
              key={row.category}
              className="rounded-[1.75rem] bg-[#161616] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[#8e8e8e]">
                {row.category}
              </p>
              <p className="mt-1 font-medium text-2xl">
                {row.done}/{row.total}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          await createTask({
            title: String(formData.get("title") ?? ""),
            description: String(formData.get("description") ?? "") || undefined,
            due_date: String(formData.get("due_date") ?? "") || undefined,
            category: String(formData.get("category") ?? "") || undefined,
            assignee: String(formData.get("assignee") ?? "") || undefined,
          });
        }}
        className="mb-8 grid gap-3 rounded-[1.75rem] bg-[#161616] p-6 md:grid-cols-2"
      >
        <p className="font-medium text-2xl md:col-span-2">Add task</p>
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <select name="category" className="rounded-2xl border border-white/10 bg-black px-3 py-2">
          <option value="">Category</option>
          {TASK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="assignee"
          placeholder="Assignee"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="due_date"
          type="date"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="Notes"
          rows={2}
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-3 text-xs uppercase tracking-[0.18em] text-black md:w-fit"
        >
          Add task
        </button>
      </form>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-[#8e8e8e]">No tasks yet — add one above.</p>
        ) : null}
        {tasks.map((task) => {
          const isOverdue =
            task.status !== "done" &&
            Boolean(task.due_date && task.due_date < today);
          return (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] bg-[#161616] px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 text-sm text-[#8e8e8e]">
                    {task.description}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-[#8e8e8e]">
                  {[
                    task.category,
                    task.assignee,
                    task.due_date
                      ? isOverdue
                        ? `Overdue ${task.due_date}`
                        : `Due ${task.due_date}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["todo", "doing", "done"] as const).map((status) => (
                  <form
                    key={status}
                    action={async () => {
                      "use server";
                      await updateTaskStatus(task.id, status);
                    }}
                  >
                    <button
                      type="submit"
                      className={`px-2 py-1 text-xs uppercase tracking-[0.14em] ${
                        task.status === status
                          ? "rounded-full bg-white text-black"
                          : "rounded-2xl border border-white/10 bg-black"
                      }`}
                    >
                      {status}
                    </button>
                  </form>
                ))}
                <form
                  action={async () => {
                    "use server";
                    await deleteTask(task.id);
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
          );
        })}
      </div>
    </PlanShell>
  );
}
