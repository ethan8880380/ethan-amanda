import { listParties } from "@/app/plan/actions";
import {
  SaveTheDateMail,
  type MailPartyRow,
} from "@/components/planning/save-the-date-mail";
import { PlanShell } from "@/components/planning/plan-shell";

interface PartyRow {
  id: string;
  party_name: string | null;
  access_token: string;
  contact_email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  address_collected_at: string | null;
  save_the_date_sent_at?: string | null;
  link_opened_at?: string | null;
  link_last_opened_at?: string | null;
  link_open_count?: number | null;
  guests?: Array<{ full_name: string; is_plus_one: boolean }> | null;
}

export default async function MailPage() {
  const parties = (await listParties()) as PartyRow[];
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const rows: MailPartyRow[] = parties.map((party) => {
    const guests = party.guests ?? [];

    return {
      id: party.id,
      party_name: party.party_name,
      access_token: party.access_token,
      contact_email: party.contact_email,
      address_line1: party.address_line1,
      address_line2: party.address_line2,
      city: party.city,
      state: party.state,
      postal_code: party.postal_code,
      country: party.country,
      address_collected_at: party.address_collected_at,
      save_the_date_sent_at: party.save_the_date_sent_at ?? null,
      link_opened_at: party.link_opened_at ?? null,
      link_last_opened_at: party.link_last_opened_at ?? null,
      link_open_count: Number(party.link_open_count ?? 0),
      guest_names: guests.map((guest) =>
        guest.is_plus_one ? `${guest.full_name} (+1)` : guest.full_name,
      ),
    };
  });

  return (
    <PlanShell title="Mail" active="/plan/mail">
      <SaveTheDateMail parties={rows} origin={origin} />
    </PlanShell>
  );
}
