import { listBudgetItems } from "@/app/plan/actions";
import {
  BudgetBoard,
  type BudgetItemRow,
} from "@/components/planning/budget-board";
import { PlanShell } from "@/components/planning/plan-shell";
import type { BudgetCategory } from "@/lib/planning-presets";

export default async function BudgetPage() {
  const items = await listBudgetItems();
  const rows: BudgetItemRow[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    category: item.category as BudgetCategory,
    actual_amount: item.actual_amount,
    notes: item.notes,
  }));

  return (
    <PlanShell title="Budget" active="/plan/budget">
      <BudgetBoard items={rows} />
    </PlanShell>
  );
}
