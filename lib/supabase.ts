import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface RSVP {
  id: string;
  attending: boolean;
  guests: string | null;
  allergies: string | null;
  created_at: string;
  updated_at: string;
}

export interface RSVPInsert {
  attending: boolean;
  guests?: string | null;
  allergies?: string | null;
}
