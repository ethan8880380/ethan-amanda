"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GuestPhase } from "@/lib/guests";
import {
  buildTimelinePresets,
  type BudgetCategory,
} from "@/lib/planning-presets";
import {
  clearPlanningSession,
  isPlanningAuthenticated,
  setPlanningSession,
  verifyPlanningPassword,
} from "@/lib/planning-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireAdmin() {
  if (!(await isPlanningAuthenticated())) {
    redirect("/plan/login");
  }
  return getSupabaseAdmin();
}

function revalidatePlan(path = "/plan") {
  revalidatePath(path);
}

async function replaceTimelineFromSite(db: SupabaseClient) {
  const presets = buildTimelinePresets();
  const { error: clearError } = await db
    .from("timeline_events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (clearError) throw clearError;
  const { error } = await db.from("timeline_events").insert(presets);
  if (error) throw error;
  return { inserted: presets.length };
}

export async function loginToPlan(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyPlanningPassword(password)) {
    return { success: false as const, error: "Incorrect password" };
  }
  await setPlanningSession();
  redirect("/plan");
}

export async function logoutFromPlan() {
  await clearPlanningSession();
  redirect("/plan/login");
}

export async function getDashboardStats() {
  const db = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date();
  soon.setDate(soon.getDate() + 21);
  const soonIso = soon.toISOString().slice(0, 10);

  const [parties, guests, tasks, vendors, budget, timeline] = await Promise.all([
    db
      .from("parties")
      .select("id, rsvp_status, address_collected_at"),
    db.from("guests").select("id, attending, meal_choice, is_plus_one"),
    db
      .from("planning_tasks")
      .select("id, title, status, due_date, category, assignee")
      .order("due_date", { ascending: true, nullsFirst: false }),
    db.from("vendors").select("id, status, quoted_amount, deposit_amount"),
    db
      .from("budget_items")
      .select("id, actual_amount, category"),
    db
      .from("timeline_events")
      .select("id, title, starts_at, location")
      .order("sort_order", { ascending: true })
      .order("starts_at", { ascending: true, nullsFirst: false })
      .limit(6),
  ]);

  const partyRows = parties.data ?? [];
  const guestRows = guests.data ?? [];
  const taskRows = tasks.data ?? [];
  const vendorRows = vendors.data ?? [];
  const budgetRows = budget.data ?? [];

  const mealCounts: Record<string, number> = {};
  for (const guest of guestRows) {
    if (guest.attending !== true || !guest.meal_choice) continue;
    mealCounts[guest.meal_choice] =
      (mealCounts[guest.meal_choice] ?? 0) + 1;
  }

  const budgetByCategory: Record<string, { actual: number }> = {};
  for (const row of budgetRows) {
    const key = row.category as string;
    if (!budgetByCategory[key]) {
      budgetByCategory[key] = { actual: 0 };
    }
    budgetByCategory[key].actual += Number(row.actual_amount ?? 0);
  }

  const openTasks = taskRows.filter((t) => t.status !== "done");
  const overdueTasks = openTasks.filter(
    (t) => t.due_date && t.due_date < today,
  );
  const dueSoonTasks = openTasks
    .filter((t) => t.due_date && t.due_date >= today && t.due_date <= soonIso)
    .slice(0, 6);

  const doneTasks = taskRows.filter((t) => t.status === "done").length;

  return {
    parties: partyRows.length,
    guests: guestRows.length,
    plusOnes: guestRows.filter((g) => g.is_plus_one).length,
    addressesCollected: partyRows.filter((p) => p.address_collected_at).length,
    attendingParties: partyRows.filter((p) => p.rsvp_status === "attending")
      .length,
    declinedParties: partyRows.filter((p) => p.rsvp_status === "declined")
      .length,
    pendingParties: partyRows.filter((p) => p.rsvp_status === "pending")
      .length,
    attendingGuests: guestRows.filter((g) => g.attending === true).length,
    declinedGuests: guestRows.filter((g) => g.attending === false).length,
    openTasks: openTasks.length,
    doneTasks,
    totalTasks: taskRows.length,
    overdueTasks: overdueTasks.length,
    dueSoonTasks,
    bookedVendors: vendorRows.filter((v) =>
      ["booked", "paid"].includes(v.status),
    ).length,
    totalVendors: vendorRows.length,
    vendorQuoted: vendorRows.reduce(
      (sum, row) => sum + Number(row.quoted_amount ?? 0),
      0,
    ),
    vendorDeposits: vendorRows.reduce(
      (sum, row) => sum + Number(row.deposit_amount ?? 0),
      0,
    ),
    budgetItemCount: budgetRows.length,
    budgetActual: budgetRows.reduce(
      (sum, row) => sum + Number(row.actual_amount ?? 0),
      0,
    ),
    budgetByCategory,
    mealCounts,
    nextTimeline: timeline.data ?? [],
  };
}

export async function listParties() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("parties")
    .select("*, guests(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createParty(input: {
  party_name: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  guest_names: string[];
  plus_one_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}) {
  const db = await requireAdmin();
  const addressLine1 = input.address_line1?.trim() || null;
  const hasAddress = Boolean(addressLine1);

  const { data: party, error } = await db
    .from("parties")
    .insert({
      party_name: input.party_name.trim(),
      contact_email: input.contact_email?.trim() || null,
      contact_phone: input.contact_phone?.trim() || null,
      notes: input.notes?.trim() || null,
      ...(hasAddress
        ? {
            address_line1: addressLine1,
            address_line2: input.address_line2?.trim() || null,
            city: input.city?.trim() || null,
            state: input.state?.trim() || null,
            postal_code: input.postal_code?.trim() || null,
            country: input.country?.trim() || "US",
            address_collected_at: new Date().toISOString(),
          }
        : {}),
    })
    .select("*")
    .single();
  if (error) throw error;

  const guestRows = input.guest_names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((full_name) => ({
      party_id: party.id,
      full_name,
      is_plus_one: false,
    }));

  if (input.plus_one_name?.trim()) {
    guestRows.push({
      party_id: party.id,
      full_name: input.plus_one_name.trim(),
      is_plus_one: true,
    });
  }

  if (guestRows.length) {
    const { error: guestError } = await db.from("guests").insert(guestRows);
    if (guestError) throw guestError;
  }

  revalidatePlan("/plan/guests");
  revalidatePlan("/plan/mail");
  revalidatePlan();
  return party;
}

export async function setSaveTheDateSent(partyId: string, sent: boolean) {
  const db = await requireAdmin();
  const { error } = await db
    .from("parties")
    .update({
      save_the_date_sent_at: sent ? new Date().toISOString() : null,
    })
    .eq("id", partyId);
  if (error) throw error;
  revalidatePlan("/plan/mail");
  revalidatePlan("/plan/guests");
  revalidatePlan();
}

export async function addGuestToParty(input: {
  party_id: string;
  full_name: string;
  is_plus_one?: boolean;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("guests").insert({
    party_id: input.party_id,
    full_name: input.full_name.trim(),
    is_plus_one: Boolean(input.is_plus_one),
  });
  if (error) throw error;
  revalidatePlan("/plan/guests");
  revalidatePlan();
}

export async function deleteGuest(guestId: string) {
  const db = await requireAdmin();
  const { error } = await db.from("guests").delete().eq("id", guestId);
  if (error) throw error;
  revalidatePlan("/plan/guests");
  revalidatePlan();
}

export async function deleteParty(partyId: string) {
  const db = await requireAdmin();
  const { error } = await db.from("parties").delete().eq("id", partyId);
  if (error) throw error;
  revalidatePlan("/plan/guests");
  revalidatePlan("/plan/mail");
  revalidatePlan();
}

export async function getGuestPhase(): Promise<GuestPhase> {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("wedding_settings")
    .select("guest_phase")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data.guest_phase as GuestPhase;
}

export async function setGuestPhase(phase: GuestPhase) {
  const db = await requireAdmin();
  const { error } = await db
    .from("wedding_settings")
    .update({ guest_phase: phase })
    .eq("id", 1);
  if (error) throw error;
  revalidatePlan();
  revalidatePlan("/plan/guests");
  revalidatePlan("/plan/settings");
}

export async function listTasks() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("planning_tasks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: {
  title: string;
  description?: string;
  due_date?: string;
  category?: string;
  assignee?: string;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("planning_tasks").insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    due_date: input.due_date || null,
    category: input.category?.trim() || null,
    assignee: input.assignee?.trim() || null,
  });
  if (error) throw error;
  revalidatePlan("/plan/tasks");
  revalidatePlan();
}

export async function updateTaskStatus(
  id: string,
  status: "todo" | "doing" | "done",
) {
  const db = await requireAdmin();
  const { error } = await db
    .from("planning_tasks")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/tasks");
  revalidatePlan();
}

export async function deleteTask(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("planning_tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/tasks");
  revalidatePlan();
}

export async function listVendors() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createVendor(input: {
  name: string;
  category: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  quoted_amount?: number;
  deposit_amount?: number;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("vendors").insert({
    name: input.name.trim(),
    category: input.category.trim(),
    contact_name: input.contact_name?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    website: input.website?.trim() || null,
    notes: input.notes?.trim() || null,
    quoted_amount: input.quoted_amount ?? null,
    deposit_amount: input.deposit_amount ?? null,
  });
  if (error) throw error;
  revalidatePlan("/plan/vendors");
  revalidatePlan();
}

export async function updateVendorStatus(
  id: string,
  status: "researching" | "contacted" | "booked" | "paid" | "declined",
) {
  const db = await requireAdmin();
  const { error } = await db.from("vendors").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/vendors");
  revalidatePlan();
}

export async function updateVendorMoney(
  id: string,
  quoted_amount: number | null,
  deposit_amount: number | null,
) {
  const db = await requireAdmin();
  const { error } = await db
    .from("vendors")
    .update({ quoted_amount, deposit_amount })
    .eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/vendors");
  revalidatePlan();
}

export async function deleteVendor(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("vendors").delete().eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/vendors");
  revalidatePlan();
}

export async function listBudgetItems() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("budget_items")
    .select("*")
    .order("category", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createBudgetItem(input: {
  label: string;
  category: BudgetCategory;
  estimated_amount?: number;
  actual_amount?: number;
  notes?: string;
  vendor_id?: string;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("budget_items").insert({
    label: input.label.trim(),
    category: input.category,
    estimated_amount: input.estimated_amount ?? 0,
    actual_amount: input.actual_amount ?? null,
    notes: input.notes?.trim() || null,
    vendor_id: input.vendor_id || null,
  });
  if (error) throw error;
  revalidatePlan("/plan/budget");
  revalidatePlan();
}

export async function updateBudgetActual(id: string, actual_amount: number | null) {
  const db = await requireAdmin();
  const { error } = await db
    .from("budget_items")
    .update({ actual_amount })
    .eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/budget");
  revalidatePlan();
}

export async function updateBudgetItem(
  id: string,
  input: {
    label?: string;
    category?: BudgetCategory;
    estimated_amount?: number;
    actual_amount?: number | null;
    notes?: string | null;
  },
) {
  const db = await requireAdmin();
  const patch: Record<string, unknown> = {};
  if (input.label !== undefined) patch.label = input.label.trim();
  if (input.category !== undefined) patch.category = input.category;
  if (input.estimated_amount !== undefined)
    patch.estimated_amount = input.estimated_amount;
  if (input.actual_amount !== undefined)
    patch.actual_amount = input.actual_amount;
  if (input.notes !== undefined)
    patch.notes = input.notes?.trim() || null;

  const { error } = await db.from("budget_items").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/budget");
  revalidatePlan();
}

export async function deleteBudgetItem(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("budget_items").delete().eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/budget");
  revalidatePlan();
}

export async function listTimelineEvents() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("timeline_events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTimelineEvent(input: {
  title: string;
  starts_at?: string;
  ends_at?: string;
  location?: string;
  notes?: string;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("timeline_events").insert({
    title: input.title.trim(),
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    location: input.location?.trim() || null,
    notes: input.notes?.trim() || null,
  });
  if (error) throw error;
  revalidatePlan("/plan/timeline");
  revalidatePlan();
}

export async function deleteTimelineEvent(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("timeline_events").delete().eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/timeline");
  revalidatePlan();
}

export async function syncTimelineFromSite() {
  const db = await requireAdmin();
  const result = await replaceTimelineFromSite(db);
  revalidatePlan("/plan/timeline");
  revalidatePlan();
  return result;
}

export async function listNotes() {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("planning_notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createNote(input: {
  title: string;
  body: string;
  pinned?: boolean;
}) {
  const db = await requireAdmin();
  const { error } = await db.from("planning_notes").insert({
    title: input.title.trim(),
    body: input.body.trim(),
    pinned: Boolean(input.pinned),
  });
  if (error) throw error;
  revalidatePlan("/plan/notes");
}

export async function toggleNotePinned(id: string, pinned: boolean) {
  const db = await requireAdmin();
  const { error } = await db
    .from("planning_notes")
    .update({ pinned })
    .eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/notes");
}

export async function deleteNote(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("planning_notes").delete().eq("id", id);
  if (error) throw error;
  revalidatePlan("/plan/notes");
}

