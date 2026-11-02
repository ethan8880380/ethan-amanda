"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  validateWebsiteRsvp,
  type ValidWebsiteRsvp,
  type WebsiteRsvpSnapshot,
} from "@/lib/website-rsvp";

const resend = new Resend(process.env.RESEND_API_KEY);
const RSVP_COOKIE = "wedding_rsvp";

export interface WeddingRSVPResult {
  success: boolean;
  error?: string;
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

export async function getWebsiteRsvp(): Promise<WebsiteRsvpSnapshot | null> {
  try {
    const jar = await cookies();
    const token = jar.get(RSVP_COOKIE)?.value;
    if (!token) return null;

    const db = getSupabaseAdmin();
    const { data: party, error } = await db
      .from("parties")
      .select("id, contact_email, source")
      .eq("access_token", token)
      .maybeSingle();

    if (error || !party || party.source !== "website") return null;

    const { data: guests, error: guestError } = await db
      .from("guests")
      .select("full_name, attending, dietary_notes, sort_order")
      .eq("party_id", party.id)
      .order("sort_order", { ascending: true });

    if (guestError || !guests?.length) return null;

    return {
      email: party.contact_email ?? "",
      guests: guests.map((guest) => ({
        name: guest.full_name,
        attending: guest.attending,
        dietaryNotes: guest.dietary_notes ?? "",
      })),
    };
  } catch (error) {
    console.error("Failed to load website RSVP:", error);
    return null;
  }
}

export async function submitWeddingRSVP(input: {
  email: string;
  guests: Array<{
    name: string;
    attending: "yes" | "no" | null;
    dietaryNotes: string;
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
        dietary_notes: guest.dietaryNotes,
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendRsvpEmail(value: ValidWebsiteRsvp) {
  const coming = value.guests.filter((guest) => guest.attending === "yes");
  const status =
    coming.length === 0
      ? "Not attending"
      : coming.length === value.guests.length
        ? `${coming.length} attending`
        : `${coming.length} of ${value.guests.length} attending`;

  const guestLines = value.guests
    .map((guest) => {
      const dietary =
        guest.attending === "yes" && guest.dietaryNotes
          ? ` — ${escapeHtml(guest.dietaryNotes)}`
          : "";
      const label = guest.attending === "yes" ? "Attending" : "Not attending";
      return `<li><strong>${escapeHtml(guest.name)}</strong>: ${label}${dietary}</li>`;
    })
    .join("");

  const emailLine = value.email
    ? `<p><strong>Email:</strong> ${escapeHtml(value.email)}</p>`
    : "";

  await resend.emails.send({
    from: "RSVP <onboarding@resend.dev>",
    to: "ethan0380@gmail.com",
    subject: `Wedding RSVP: ${value.partyName} — ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px;">
        <h2 style="margin-bottom: 4px;">New Wedding RSVP</h2>
        <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
        <p><strong>Party:</strong> ${escapeHtml(value.partyName)}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${emailLine}
        <ul>${guestLines}</ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
        <p style="color: #999; font-size: 12px;">Wedding RSVP</p>
      </div>
    `,
  });
}
