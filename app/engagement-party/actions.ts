"use server";

import { supabase, type RSVP, type RSVPInsert } from "@/lib/supabase";

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
