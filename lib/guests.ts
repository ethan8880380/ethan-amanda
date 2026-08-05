import { supabase } from "@/lib/supabase";

export type RsvpStatus = "pending" | "attending" | "declined";
export type MealChoice =
  | "beef"
  | "chicken"
  | "fish"
  | "vegetarian"
  | "vegan"
  | "kids"
  | "other";
export type GuestPhase = "save_the_date" | "invite";

export interface PartyPublic {
  id: string;
  party_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  address_collected_at: string | null;
  rsvp_status: RsvpStatus;
  rsvp_submitted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestPublic {
  id: string;
  party_id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  meal_choice: MealChoice | null;
  dietary_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartyPayload {
  party: PartyPublic;
  guests: GuestPublic[];
  guest_phase: GuestPhase;
}

export interface AddressInput {
  address_line1: string;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export interface RsvpGuestResponse {
  guest_id: string;
  attending: boolean;
  meal_choice?: MealChoice | null;
  dietary_notes?: string | null;
}

export async function getParty(token: string): Promise<PartyPayload> {
  const { data, error } = await supabase.rpc("get_party", { p_token: token });
  if (error) throw error;
  return data as PartyPayload;
}

export async function updateAddress(
  token: string,
  address: AddressInput,
): Promise<PartyPayload> {
  const { data, error } = await supabase.rpc("update_address", {
    p_token: token,
    p_address_line1: address.address_line1,
    p_address_line2: address.address_line2 ?? null,
    p_city: address.city ?? null,
    p_state: address.state ?? null,
    p_postal_code: address.postal_code ?? null,
    p_country: address.country ?? "US",
    p_contact_email: address.contact_email ?? null,
    p_contact_phone: address.contact_phone ?? null,
  });
  if (error) throw error;
  return data as PartyPayload;
}

export async function submitRsvp(
  token: string,
  responses: RsvpGuestResponse[],
): Promise<PartyPayload> {
  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_token: token,
    p_responses: responses,
  });
  if (error) throw error;
  return data as PartyPayload;
}

export const MEAL_CHOICES: { value: MealChoice; label: string }[] = [
  { value: "beef", label: "Beef" },
  { value: "chicken", label: "Chicken" },
  { value: "fish", label: "Fish" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "kids", label: "Kids meal" },
  { value: "other", label: "Other" },
];
