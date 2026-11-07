"use client";

import {
  useMemo,
  useState,
  useTransition,
  type TransitionStartFunction,
} from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  createBudgetItem,
  deleteBudgetItem,
  updateBudgetItem,
} from "@/app/plan/actions";
import {
  BUDGET_CATEGORIES,
  type BudgetCategory,
} from "@/lib/planning-presets";

export interface BudgetItemRow {
  id: string;
  label: string;
  category: BudgetCategory;
  actual_amount: number | string | null;
  notes: string | null;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CATEGORY_TINT: Record<BudgetCategory, string> = {
  venue: "#141414",
  catering: "#141414",
  photo_video: "#141414",
  florals: "#141414",
  attire: "#141414",
  music: "#141414",
  stationery: "#141414",
  travel: "#141414",
  gifts: "#141414",
  misc: "#141414",
};

function money(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function formatInput(value: number | string | null | undefined) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return String(n);
}

interface BudgetBoardProps {
  items: BudgetItemRow[];
}

export function BudgetBoard({ items }: BudgetBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const spent = useMemo(
    () => items.reduce((sum, item) => sum + money(item.actual_amount), 0),
    [items],
  );
  const itemCount = items.length;

  const byCategory = useMemo(() => {
    return BUDGET_CATEGORIES.map((category) => {
      const rows = items
        .filter((item) => item.category === category.value)
        .sort((a, b) => a.label.localeCompare(b.label));
      const categorySpent = rows.reduce(
        (sum, item) => sum + money(item.actual_amount),
        0,
      );
      return {
        ...category,
        rows,
        spent: categorySpent,
        color: CATEGORY_TINT[category.value],
      };
    }).filter((group) => group.rows.length > 0);
  }, [items]);

  const chartMax = Math.max(...byCategory.map((g) => g.spent), 1);

  function saveItem(
    id: string,
    patch: {
      label?: string;
      actual_amount?: number | null;
    },
  ) {
    startTransition(async () => {
      await updateBudgetItem(id, patch);
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-[1.75rem] bg-[#161616] p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-2xl">Spending</p>
            <p className="mt-1 text-sm text-[#8e8e8e]">
              Track what you&apos;ve paid — deposits, balances, and one-offs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black"
          >
            <Plus className="size-3.5" />
            Add item
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-black px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8e8e8e] sm:text-xs">
              Total spent
            </p>
            <p className="mt-1 font-medium text-2xl sm:text-3xl">
              {currency.format(spent)}
            </p>
          </div>
          <div className="rounded-2xl bg-black px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8e8e8e] sm:text-xs">
              Line items
            </p>
            <p className="mt-1 font-medium text-2xl sm:text-3xl">{itemCount}</p>
          </div>
        </div>

        {addOpen ? (
          <AddItemForm
            onDone={() => setAddOpen(false)}
            isPending={isPending}
            startTransition={startTransition}
          />
        ) : null}
      </section>

      {byCategory.length > 0 ? (
        <section className="rounded-[1.75rem] bg-[#161616] p-4 sm:p-6">
          <p className="font-medium text-2xl">By category</p>
          <ul className="mt-5 space-y-4">
            {byCategory.map((group) => {
              const width =
                group.spent > 0
                  ? Math.max(8, (group.spent / chartMax) * 100)
                  : 0;
              return (
                <li key={group.value}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{group.label}</span>
                    <span className="shrink-0 text-[#8e8e8e]">
                      {currency.format(group.spent)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/10">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${width}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {items.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-[#101010] p-6 text-center sm:p-8">
          <p className="font-medium text-2xl">No line items yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#8e8e8e]">
            Add an item, then enter amounts as you pay.
          </p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-5 min-h-11 rounded-full border border-white/15 px-4 text-xs uppercase tracking-[0.18em]"
          >
            Add item
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          {byCategory.map((group) => {
            const isCollapsed = collapsed[group.value] ?? false;
            return (
              <section
                key={group.value}
                className="rounded-[1.75rem] bg-[#161616]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [group.value]: !isCollapsed,
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-xl">{group.label}</p>
                    <p className="mt-0.5 text-sm text-[#8e8e8e]">
                      {group.rows.length} item
                      {group.rows.length === 1 ? "" : "s"} ·{" "}
                      {currency.format(group.spent)}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-5 shrink-0 text-[#8e8e8e] transition-transform ${
                      isCollapsed ? "" : "rotate-180"
                    }`}
                  />
                </button>

                {!isCollapsed ? (
                  <div className="border-t border-white/10">
                    <div className="hidden grid-cols-[1fr_7rem_2.5rem] gap-2 border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-[#8e8e8e] sm:grid sm:px-5">
                      <span>Item</span>
                      <span className="text-right">Amount</span>
                      <span />
                    </div>
                    <ul>
                      {group.rows.map((item) => (
                        <BudgetRow
                          key={`${item.id}-${item.label}-${item.actual_amount}`}
                          item={item}
                          disabled={isPending}
                          onSave={saveItem}
                          onDelete={() => {
                            startTransition(async () => {
                              await deleteBudgetItem(item.id);
                            });
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BudgetRow({
  item,
  disabled,
  onSave,
  onDelete,
}: {
  item: BudgetItemRow;
  disabled: boolean;
  onSave: (
    id: string,
    patch: {
      label?: string;
      actual_amount?: number | null;
    },
  ) => void;
  onDelete: () => void;
}) {
  return (
    <li className="grid gap-3 border-b border-white/10 px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_7rem_2.5rem] sm:items-center sm:gap-2 sm:px-5">
      <div className="min-w-0">
        <input
          defaultValue={item.label}
          disabled={disabled}
          onBlur={(e) => {
            const next = e.target.value.trim();
            if (next && next !== item.label) onSave(item.id, { label: next });
          }}
          className="w-full border border-transparent bg-transparent px-0 py-1 text-base font-medium outline-none focus:border-white/20 focus:px-2 disabled:opacity-60"
        />
        {item.notes ? (
          <p className="text-xs text-[#8e8e8e]">{item.notes}</p>
        ) : null}
        <div className="mt-2 sm:hidden">
          <MoneyField
            label="Amount"
            defaultValue={formatInput(item.actual_amount)}
            disabled={disabled}
            onCommit={(value) => onSave(item.id, { actual_amount: value })}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <MoneyField
          label="Amount"
          hideLabel
          defaultValue={formatInput(item.actual_amount)}
          disabled={disabled}
          onCommit={(value) => onSave(item.id, { actual_amount: value })}
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!window.confirm(`Delete “${item.label}”?`)) return;
          onDelete();
        }}
        className="inline-flex size-10 items-center justify-center justify-self-end text-[#ff453a] disabled:opacity-50 sm:justify-self-center"
        aria-label={`Delete ${item.label}`}
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function MoneyField({
  label,
  hideLabel,
  defaultValue,
  disabled,
  onCommit,
}: {
  label: string;
  hideLabel?: boolean;
  defaultValue: string;
  disabled: boolean;
  onCommit: (value: number | null) => void;
}) {
  return (
    <label className="block text-xs text-[#8e8e8e]">
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder="0"
        onBlur={(e) => {
          const raw = e.target.value.trim();
          if (raw === defaultValue) return;
          if (raw === "") {
            onCommit(null);
            return;
          }
          const next = Number(raw);
          if (Number.isNaN(next)) return;
          onCommit(next);
        }}
        className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-2 py-2 text-right text-base text-white outline-none focus:border-white/40 disabled:opacity-60"
      />
    </label>
  );
}

function AddItemForm({
  onDone,
  isPending,
  startTransition,
}: {
  onDone: () => void;
  isPending: boolean;
  startTransition: TransitionStartFunction;
}) {
  return (
    <form
      className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2"
      action={(formData) => {
        startTransition(async () => {
          await createBudgetItem({
            label: String(formData.get("label") ?? ""),
            category: String(
              formData.get("category") ?? "misc",
            ) as BudgetCategory,
            actual_amount: formData.get("actual_amount")
              ? Number(formData.get("actual_amount"))
              : undefined,
            notes: String(formData.get("notes") ?? "") || undefined,
          });
          onDone();
        });
      }}
    >
      <p className="font-medium text-xl sm:col-span-2">New line item</p>
      <label className="text-sm sm:col-span-2">
        Label
        <input
          name="label"
          required
          placeholder="e.g. Photographer deposit"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base"
        />
      </label>
      <label className="text-sm">
        Category
        <select
          name="category"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base"
          defaultValue="misc"
        >
          {BUDGET_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Amount{" "}
        <span className="text-[#8e8e8e]">(optional)</span>
        <input
          name="actual_amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Notes{" "}
        <span className="text-[#8e8e8e]">(optional)</span>
        <input
          name="notes"
          placeholder="Vendor, due date…"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base"
        />
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black disabled:opacity-60"
        >
          Save item
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-11 px-4 text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
