import { listParties } from "@/app/plan/actions";
import {
  RsvpBoard,
  type RsvpBoardParty,
} from "@/components/planning/rsvp-board";
import { PlanShell } from "@/components/planning/plan-shell";

interface PartyGuestRow {
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  sort_order?: number | null;
}

interface PartyRow {
  id: string;
  party_name: string | null;
  contact_email: string | null;
  save_the_date_sent_at?: string | null;
  rsvp_status?: string | null;
  rsvp_submitted_at?: string | null;
  guests?: PartyGuestRow[] | null;
}

function rsvpStatus(value: string | null | undefined): RsvpBoardParty["status"] {
  if (value === "attending" || value === "declined") return value;
  return "pending";
}

export default async function RsvpPage() {
  const parties = (await listParties()) as PartyRow[];

  const rows: RsvpBoardParty[] = parties.map((party) => {
    const guests = [...(party.guests ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    return {
      id: party.id,
      partyName: party.party_name?.trim() || "Untitled party",
      email: party.contact_email,
      sentAt: party.save_the_date_sent_at ?? null,
      status: rsvpStatus(party.rsvp_status),
      submittedAt: party.rsvp_submitted_at ?? null,
      guests: guests.map((guest) => ({
        name: guest.full_name,
        plusOne: guest.is_plus_one,
        attending: guest.attending,
      })),
    };
  });

  return (
    <PlanShell title="RSVP" active="/plan/rsvp">
      <RsvpBoard parties={rows} />
    </PlanShell>
  );
}
