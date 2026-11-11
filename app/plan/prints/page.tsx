import type { Metadata } from "next";
import { listParties } from "@/app/plan/actions";
import { PrintStudio } from "@/components/planning/print-studio";
import { PlanShell } from "@/components/planning/plan-shell";
import type { PrintGuest } from "@/lib/print-plan";

export const metadata: Metadata = {
  title: "Prints",
};

interface PartyRow {
  id: string;
  party_name: string | null;
  guests?: Array<{
    id: string;
    full_name: string;
    attending: boolean | null;
    is_plus_one: boolean;
  }> | null;
}

export default async function PrintsPage() {
  const parties = (await listParties()) as PartyRow[];
  const guests: PrintGuest[] = parties.flatMap((party) =>
    (party.guests ?? []).map((guest) => ({
      id: guest.id,
      fullName: guest.full_name,
      partyId: party.id,
      partyName: party.party_name?.trim() || "Party",
      attending: guest.attending,
      isPlusOne: guest.is_plus_one,
    })),
  );

  return (
    <PlanShell active="/plan/prints" bare>
      <PrintStudio guests={guests} />
    </PlanShell>
  );
}
