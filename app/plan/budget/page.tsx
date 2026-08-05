import {
  createBudgetItem,
  deleteBudgetItem,
  listBudgetItems,
  seedBudgetPresets,
  updateBudgetActual,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import {
  BUDGET_CATEGORIES,
  budgetCategoryLabel,
} from "@/lib/planning-presets";

export default async function BudgetPage() {
  const items = await listBudgetItems();
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const estimated = items.reduce(
    (sum, item) => sum + Number(item.estimated_amount ?? 0),
    0,
  );
  const actual = items.reduce(
    (sum, item) => sum + Number(item.actual_amount ?? 0),
    0,
  );
  const remaining = estimated - actual;
  const byCategory = BUDGET_CATEGORIES.map((category) => {
    const rows = items.filter((item) => item.category === category.value);
    return {
      ...category,
      estimated: rows.reduce(
        (sum, item) => sum + Number(item.estimated_amount ?? 0),
        0,
      ),
      actual: rows.reduce(
        (sum, item) => sum + Number(item.actual_amount ?? 0),
        0,
      ),
      count: rows.length,
    };
  }).filter((row) => row.count > 0);

  return (
    <PlanShell title="Budget" active="/plan/budget">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border border-[#e4ddd4] bg-white px-5 py-4">
        <div>
          <p className="font-serif text-2xl">Budget planner</p>
          <p className="mt-1 text-sm text-[#6f6258]">
            Seed a starter breakdown, then tune the numbers.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await seedBudgetPresets();
          }}
        >
          <button
            type="submit"
            className="border border-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em]"
          >
            Load budget template
          </button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Estimated
          </p>
          <p className="mt-2 font-serif text-3xl">{currency.format(estimated)}</p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Actual
          </p>
          <p className="mt-2 font-serif text-3xl">{currency.format(actual)}</p>
        </div>
        <div className="border border-[#e4ddd4] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f6258]">
            Remaining vs est.
          </p>
          <p className="mt-2 font-serif text-3xl">
            {currency.format(remaining)}
          </p>
        </div>
      </div>

      {byCategory.length ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byCategory.map((row) => (
            <div
              key={row.value}
              className="border border-[#e4ddd4] bg-white px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[#6f6258]">
                {row.label}
              </p>
              <p className="mt-1 font-serif text-xl">
                {currency.format(row.estimated)}
              </p>
              <p className="text-sm text-[#6f6258]">
                Actual {currency.format(row.actual)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          await createBudgetItem({
            label: String(formData.get("label") ?? ""),
            category: formData.get(
              "category",
            ) as (typeof BUDGET_CATEGORIES)[number]["value"],
            estimated_amount: Number(formData.get("estimated_amount") ?? 0),
            actual_amount: formData.get("actual_amount")
              ? Number(formData.get("actual_amount"))
              : undefined,
            notes: String(formData.get("notes") ?? "") || undefined,
          });
        }}
        className="mb-8 grid gap-3 border border-[#e4ddd4] bg-white p-6 md:grid-cols-2"
      >
        <p className="font-serif text-2xl md:col-span-2">Add line item</p>
        <input
          name="label"
          required
          placeholder="Label"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <select name="category" className="border border-[#d9d0c5] px-3 py-2">
          {BUDGET_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <input
          name="estimated_amount"
          type="number"
          step="0.01"
          required
          placeholder="Estimated"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="actual_amount"
          type="number"
          step="0.01"
          placeholder="Actual"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <textarea
          name="notes"
          placeholder="Notes"
          rows={2}
          className="border border-[#d9d0c5] px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          className="bg-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee] md:w-fit"
        >
          Add item
        </button>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-[#6f6258]">
            No budget items yet — load the template to populate categories.
          </p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-[#e4ddd4] bg-white px-5 py-4"
          >
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-[#6f6258]">
                {budgetCategoryLabel(item.category)} · est{" "}
                {currency.format(Number(item.estimated_amount))}
                {item.actual_amount != null
                  ? ` · actual ${currency.format(Number(item.actual_amount))}`
                  : ""}
              </p>
              {item.notes ? (
                <p className="mt-1 text-sm text-[#6f6258]">{item.notes}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <form
                action={async (formData) => {
                  "use server";
                  const value = String(formData.get("actual_amount") ?? "");
                  await updateBudgetActual(
                    item.id,
                    value ? Number(value) : null,
                  );
                }}
                className="flex items-end gap-2"
              >
                <label className="text-xs uppercase tracking-[0.14em] text-[#6f6258]">
                  Actual
                  <input
                    name="actual_amount"
                    type="number"
                    step="0.01"
                    defaultValue={
                      item.actual_amount != null
                        ? String(item.actual_amount)
                        : ""
                    }
                    className="mt-1 block w-28 border border-[#d9d0c5] px-3 py-2 text-sm normal-case tracking-normal"
                  />
                </label>
                <button
                  type="submit"
                  className="border border-[#1c1714] px-3 py-2 text-xs uppercase tracking-[0.14em]"
                >
                  Save
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteBudgetItem(item.id);
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
        ))}
      </div>
    </PlanShell>
  );
}
