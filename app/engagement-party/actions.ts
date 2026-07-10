"use server";

import { supabase, type RSVP, type RSVPInsert } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface RSVPFormData {
  attending: "yes" | "no";
  guests: string;
  allergies: string;
}

export interface RSVPResult {
  success: boolean;
  error?: string;
}

export interface RSVPWithParsedGuests extends RSVP {
  parsedGuests: string[];
}

export interface GetRSVPsResult {
  success: boolean;
  data?: RSVPWithParsedGuests[];
  error?: string;
}

export async function submitRSVP(formData: RSVPFormData): Promise<RSVPResult> {
  const isAttending = formData.attending === "yes";

  const rsvpData: RSVPInsert = {
    attending: isAttending,
    guests: formData.guests || null,
    allergies: isAttending && formData.allergies ? formData.allergies : null,
  };

  const { error } = await supabase.from("rsvps").insert(rsvpData);

  if (error) {
    console.error("Error submitting RSVP:", error);
    return {
      success: false,
      error: "Failed to submit RSVP. Please try again.",
    };
  }

  // Send email backup (fire-and-forget — don't block the response)
  try {
    const status = isAttending ? "✅ Attending" : "❌ Not Attending";
    const guestLine = formData.guests || "Unknown";
    const allergyLine =
      isAttending && formData.allergies
        ? `<p><strong>Dietary Notes:</strong> ${formData.allergies}</p>`
        : "";

    await resend.emails.send({
      from: "RSVP <onboarding@resend.dev>",
      to: "ethan0380@gmail.com",
      subject: `RSVP: ${guestLine} — ${isAttending ? "Attending" : "Not Attending"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="margin-bottom: 4px;">New RSVP Submission</h2>
          <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Guest(s):</strong> ${guestLine}</p>
          ${allergyLine}
          <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
          <p style="color: #999; font-size: 12px;">Engagement Party RSVP Backup</p>
        </div>
      `,
    });
  } catch (emailError) {
    // Log but don't fail the RSVP if email fails
    console.error("Failed to send email backup:", emailError);
  }

  return { success: true };
}

// Parse guest names from various formats people might enter
function parseGuestNames(guestsString: string): string[] {
  if (!guestsString) return [];

  // Normalize the string: replace common separators with commas
  let normalized = guestsString
    // Handle "and" with optional oxford comma: ", and" or " and "
    .replace(/,?\s+and\s+/gi, ", ")
    // Handle ampersand: " & " or "&"
    .replace(/\s*&\s*/g, ", ")
    // Handle newlines
    .replace(/\n+/g, ", ")
    // Handle semicolons
    .replace(/;/g, ", ")
    // Handle "+" signs (e.g., "John + Jane")
    .replace(/\s*\+\s*/g, ", ");

  // Split by comma and clean up
  const names = normalized
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    // Capitalize first letter of each word
    .map((name) =>
      name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    );

  return names;
}

export async function getRSVPs(): Promise<GetRSVPsResult> {
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching RSVPs:", error);
    return {
      success: false,
      error: "Failed to fetch RSVPs.",
    };
  }

  // Parse guest names with smart parsing
  const rsvpsWithParsedGuests: RSVPWithParsedGuests[] = data.map((rsvp) => ({
    ...rsvp,
    parsedGuests: parseGuestNames(rsvp.guests || ""),
  }));

  return { success: true, data: rsvpsWithParsedGuests };
}
