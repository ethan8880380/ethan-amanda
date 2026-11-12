"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Resend } from "resend";
import {
  renderRsvpConfirmationEmail,
  rsvpConfirmationSubject,
} from "@/lib/rsvp-confirmation-email";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  buildPartyName,
  householdNotes,
  validateGroupRsvp,
  validateWebsiteRsvp,
  type ValidWebsiteRsvp,
  type WebsiteRsvpGuest,
  type WebsiteRsvpSnapshot,
} from "@/lib/website-rsvp";

const resend = new Resend(process.env.RESEND_API_KEY);
const RSVP_COOKIE = "wedding_rsvp";
const RSVP_FROM =
  process.env.RSVP_FROM_EMAIL ?? "Ethan & Amanda <rsvp@ethanandamanda.com>";
const COUPLE_RSVP_TO = "ethan0380@gmail.com";

export interface WeddingRSVPResult {
  success: boolean;
  error?: string;
}

export interface GroupSearchResult {
  success: boolean;
  error?: string;
  groups?: WebsiteRsvpSnapshot[];
  truncated?: boolean;
}

export async function hasWeddingRsvpCookie() {
  const jar = await cookies();
  return Boolean(jar.get(RSVP_COOKIE)?.value);
}

function rsvpCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  };
}

function isPartySource(source: string): source is "manual" | "website" {
  return source === "manual" || source === "website";
}

interface SnapshotGuestDraft extends WebsiteRsvpGuest {
  sortOrder: number;
  createdAt: string;
}

function toSnapshotGuest(guest: {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  dietary_notes: string | null;
  sort_order?: number | null;
  created_at?: string | null;
}): SnapshotGuestDraft {
  return {
    id: guest.id,
    name: guest.full_name,
    isPlusOne: guest.is_plus_one,
    attending: guest.attending,
    dietaryNotes: guest.dietary_notes ?? "",
    sortOrder: guest.sort_order ?? 0,
    createdAt: guest.created_at ?? "",
  };
}

function sortSnapshotGuests(guests: SnapshotGuestDraft[]): WebsiteRsvpGuest[] {
  return [...guests]
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      if (a.isPlusOne !== b.isPlusOne) return a.isPlusOne ? 1 : -1;
      return a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name);
    })
    .map(({ id, name, isPlusOne, attending, dietaryNotes }) => ({
      id,
      name,
      isPlusOne,
      attending,
      dietaryNotes,
    }));
}

export async function getWebsiteRsvp(): Promise<WebsiteRsvpSnapshot | null> {
  try {
    const jar = await cookies();
    const token = jar.get(RSVP_COOKIE)?.value;
    if (!token) return null;

    const db = getSupabaseAdmin();
    const { data: party, error } = await db
      .from("parties")
      .select("id, party_name, contact_email, food_allergies, source")
      .eq("access_token", token)
      .maybeSingle();

    if (error || !party || !isPartySource(party.source)) return null;

    const { data: guests, error: guestError } = await db
      .from("guests")
      .select(
        "id, full_name, is_plus_one, attending, dietary_notes, sort_order, created_at",
      )
      .eq("party_id", party.id)
      .order("sort_order", { ascending: true });

    if (guestError || !guests?.length) return null;

    const snapshotGuests = sortSnapshotGuests(guests.map(toSnapshotGuest));
    return {
      partyId: party.id,
      partyName:
        party.party_name?.trim() ||
        buildPartyName(snapshotGuests.map((guest) => guest.name)),
      source: party.source,
      email: party.contact_email ?? "",
      notes: householdNotes(party.food_allergies, snapshotGuests),
      guests: snapshotGuests,
    };
  } catch (error) {
    console.error("Failed to load website RSVP:", error);
    return null;
  }
}

export async function submitWeddingRSVP(input: {
  email: string;
  notes: string;
  guests: Array<{
    name: string;
    attending: "yes" | "no" | null;
  }>;
}): Promise<WeddingRSVPResult> {
  const validated = validateWebsiteRsvp(input);
  if (!validated.ok) return { success: false, error: validated.error };

  try {
    const db = getSupabaseAdmin();
    const jar = await cookies();
    const token = jar.get(RSVP_COOKIE)?.value ?? null;
    const { value } = validated;

    const { data, error } = await db.rpc("submit_website_rsvp", {
      p_token: token,
      p_email: value.email,
      p_party_name: value.partyName,
      p_guests: value.guests.map((guest) => ({
        full_name: guest.name,
        attending: guest.attending === "yes",
        dietary_notes: "",
      })),
    });

    const saved = data as { access_token?: string } | null;
    if (error || !saved?.access_token) {
      console.error("Failed to store website RSVP:", error);
      return {
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      };
    }

    jar.set(RSVP_COOKIE, saved.access_token, rsvpCookieOptions());

    const { error: notesError } = await db
      .from("parties")
      .update({ food_allergies: value.notes || null })
      .eq("access_token", saved.access_token);

    if (notesError) {
      console.error("Failed to save RSVP notes:", notesError);
      return {
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      };
    }

    try {
      await sendRsvpEmail(value);
    } catch (emailError) {
      console.error("Failed to send wedding RSVP email:", emailError);
    }

    revalidatePath("/plan/guests");
    revalidatePath("/plan");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit website RSVP:", error);
    return {
      success: false,
      error: "Failed to submit RSVP. Please try again.",
    };
  }
}

export async function listWeddingGroups(): Promise<GroupSearchResult> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("guests")
      .select(
        "id, full_name, is_plus_one, attending, dietary_notes, sort_order, created_at, party_id, parties!inner(id, party_name, source, contact_email, food_allergies)",
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to load groups:", error);
      return { success: false, error: "Couldn't load groups. Try again." };
    }

    return {
      success: true,
      groups: groupSearchRows((data ?? []) as GuestSearchRow[]),
    };
  } catch (error) {
    console.error("Failed to load groups:", error);
    return { success: false, error: "Couldn't load groups. Try again." };
  }
}

export async function submitGroupRsvp(input: {
  partyId: string;
  email: string;
  notes: string;
  guests: Array<{
    id: string | null;
    name: string;
    attending: "yes" | "no" | null;
  }>;
}): Promise<WeddingRSVPResult> {
  const validated = validateGroupRsvp(input);
  if (!validated.ok) return { success: false, error: validated.error };

  try {
    const db = getSupabaseAdmin();
    const { value } = validated;
    const { data: party, error: partyError } = await db
      .from("parties")
      .select("id, access_token, party_name, contact_email, source")
      .eq("id", value.partyId)
      .maybeSingle();

    if (partyError || !party || !isPartySource(party.source)) {
      return { success: false, error: "Search for your group again." };
    }

    const { data: existing, error: guestError } = await db
      .from("guests")
      .select("id, full_name, is_plus_one, sort_order")
      .eq("party_id", party.id);

    if (guestError || !existing) {
      return {
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      };
    }

    const incomingIds = new Set(
      value.guests.flatMap((guest) => (guest.id ? [guest.id] : [])),
    );
    const existingById = new Map(existing.map((guest) => [guest.id, guest]));

    if (value.guests.some((guest) => guest.id && !existingById.has(guest.id))) {
      return { success: false, error: "Search for your group again." };
    }

    if (
      party.source === "manual" &&
      existing.some((guest) => !guest.is_plus_one && !incomingIds.has(guest.id))
    ) {
      return {
        success: false,
        error: "Reply for each person in your group.",
      };
    }

    const updates = value.guests.flatMap((guest) => {
      if (!guest.id) return [];
      const row = existingById.get(guest.id);
      if (!row) return [];
      const keepName = party.source === "manual" && !row.is_plus_one;
      return [
        {
          id: guest.id,
          full_name: keepName ? row.full_name : guest.name,
          attending: guest.attending === "yes",
          dietary_notes: null,
        },
      ];
    });

    if (updates.length) {
      const updateResults = await Promise.all(
        updates.map((guest) =>
          db
            .from("guests")
            .update({
              full_name: guest.full_name,
              attending: guest.attending,
              dietary_notes: guest.dietary_notes,
            })
            .eq("id", guest.id)
            .eq("party_id", party.id),
        ),
      );
      if (updateResults.some((result) => result.error)) {
        console.error(
          "Failed to update group RSVP:",
          updateResults.find((result) => result.error)?.error,
        );
        return {
          success: false,
          error: "Failed to submit RSVP. Please try again.",
        };
      }
    }

    const creates = value.guests.filter((guest) => !guest.id);
    if (creates.length) {
      return {
        success: false,
        error: "Reply for the people already listed in your group.",
      };
    }

    const removeIds =
      party.source === "website"
        ? existing
            .filter((guest) => !incomingIds.has(guest.id))
            .map((guest) => guest.id)
        : [];

    if (removeIds.length) {
      const { error: deleteError } = await db
        .from("guests")
        .delete()
        .in("id", removeIds)
        .eq("party_id", party.id);
      if (deleteError) {
        console.error("Failed to update plus ones:", deleteError);
        return {
          success: false,
          error: "Failed to submit RSVP. Please try again.",
        };
      }
    }

    const anyAttending = value.guests.some((guest) => guest.attending === "yes");
    const { error: partyUpdateError } = await db
      .from("parties")
      .update({
        contact_email: value.email || party.contact_email,
        food_allergies: value.notes || null,
        rsvp_status: anyAttending ? "attending" : "declined",
        rsvp_submitted_at: new Date().toISOString(),
      })
      .eq("id", party.id);

    if (partyUpdateError) {
      console.error("Failed to update group RSVP status:", partyUpdateError);
      return {
        success: false,
        error: "Failed to submit RSVP. Please try again.",
      };
    }

    const jar = await cookies();
    jar.set(RSVP_COOKIE, party.access_token, rsvpCookieOptions());

    const partyName =
      party.party_name?.trim() ||
      buildPartyName(value.guests.map((guest) => guest.name));

    try {
      await sendRsvpEmail({
        partyName,
        email: value.email || party.contact_email || "",
        notes: value.notes,
        guests: value.guests.map((guest) => {
          const saved = guest.id ? existingById.get(guest.id) : undefined;
          const keepName =
            saved && party.source === "manual" && !saved.is_plus_one;
          return {
            name: keepName ? saved.full_name : guest.name,
            attending: guest.attending,
            isPlusOne: saved ? saved.is_plus_one : true,
          };
        }),
      });
    } catch (emailError) {
      console.error("Failed to send wedding RSVP email:", emailError);
    }

    revalidatePath("/plan/guests");
    revalidatePath("/plan");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit group RSVP:", error);
    return {
      success: false,
      error: "Failed to submit RSVP. Please try again.",
    };
  }
}

interface GuestSearchRow {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  dietary_notes: string | null;
  sort_order: number | null;
  created_at: string | null;
  party_id: string;
  parties:
    | {
        id: string;
        party_name: string | null;
        source: string;
        contact_email: string | null;
        food_allergies: string | null;
      }
    | Array<{
        id: string;
        party_name: string | null;
        source: string;
        contact_email: string | null;
        food_allergies: string | null;
      }>
    | null;
}

function partyFromRow(row: GuestSearchRow) {
  if (Array.isArray(row.parties)) return row.parties[0] ?? null;
  return row.parties;
}

function groupSearchRows(rows: GuestSearchRow[]): WebsiteRsvpSnapshot[] {
  const parties = new Map<
    string,
    Omit<WebsiteRsvpSnapshot, "guests"> & { guests: SnapshotGuestDraft[] }
  >();

  for (const row of rows) {
    const party = partyFromRow(row);
    if (!party || !isPartySource(party.source)) continue;

    const snapshot = parties.get(party.id) ?? {
      partyId: party.id,
      partyName: party.party_name?.trim() || "",
      source: party.source,
      email: party.contact_email?.trim() || "",
      notes: party.food_allergies?.trim() || "",
      guests: [],
    };
    snapshot.guests.push(toSnapshotGuest(row));
    parties.set(party.id, snapshot);
  }

  return [...parties.values()].map((party) => {
    const guests = sortSnapshotGuests(party.guests);
    return {
      partyId: party.partyId,
      partyName: party.partyName || buildPartyName(guests.map((guest) => guest.name)),
      source: party.source,
      email: party.email,
      notes: party.notes || householdNotes(null, guests),
      guests,
    };
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendRsvpEmail(value: {
  partyName: string;
  email: string;
  notes: string;
  guests: Array<
    ValidWebsiteRsvp["guests"][number] & { isPlusOne?: boolean }
  >;
}) {
  const coming = value.guests.filter((guest) => guest.attending === "yes");
  const status =
    coming.length === 0
      ? "Not attending"
      : coming.length === value.guests.length
        ? `${coming.length} attending`
        : `${coming.length} of ${value.guests.length} attending`;

  const guestLines = value.guests
    .map((guest) => {
      const label = guest.attending === "yes" ? "Attending" : "Not attending";
      const plusOne = guest.isPlusOne ? " (plus one)" : "";
      return `<li><strong>${escapeHtml(guest.name)}</strong>${plusOne}: ${label}</li>`;
    })
    .join("");

  const notesLine = value.notes
    ? `<p><strong>Notes:</strong> ${escapeHtml(value.notes)}</p>`
    : "";

  const emailLine = value.email
    ? `<p><strong>Email:</strong> ${escapeHtml(value.email)}</p>`
    : "";

  const coupleNotice = resend.emails.send({
    from: RSVP_FROM,
    to: COUPLE_RSVP_TO,
    subject: `Wedding RSVP: ${value.partyName} — ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px;">
        <h2 style="margin-bottom: 4px;">New Wedding RSVP</h2>
        <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
        <p><strong>Party:</strong> ${escapeHtml(value.partyName)}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${emailLine}
        ${notesLine}
        <ul>${guestLines}</ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
        <p style="color: #999; font-size: 12px;">Wedding RSVP</p>
      </div>
    `,
  });

  const guestConfirmation = value.email
    ? sendGuestRsvpConfirmation(value)
    : Promise.resolve();

  const [coupleResult, guestResult] = await Promise.allSettled([
    coupleNotice,
    guestConfirmation,
  ]);

  if (coupleResult.status === "rejected") {
    console.error("Failed to send couple RSVP notice:", coupleResult.reason);
  }
  if (guestResult.status === "rejected") {
    console.error("Failed to send guest RSVP confirmation:", guestResult.reason);
  }
}

function sendGuestRsvpConfirmation(value: {
  partyName: string;
  email: string;
  notes: string;
  guests: Array<{
    name: string;
    attending: "yes" | "no";
    isPlusOne?: boolean;
  }>;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return resend.emails.send({
    from: RSVP_FROM,
    to: value.email,
    replyTo: COUPLE_RSVP_TO,
    subject: rsvpConfirmationSubject(),
    html: renderRsvpConfirmationEmail({
      partyName: value.partyName,
      notes: value.notes,
      guests: value.guests,
      siteUrl: site,
    }),
  });
}
