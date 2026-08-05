import { PartyPortal } from "@/components/guests/party-portal";
import { SaveTheDateSite } from "@/components/save-the-date/save-the-date-site";
import { getParty } from "@/lib/guests";

export default async function GuestTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const payload = await getParty(token);

    if (payload.guest_phase === "save_the_date") {
      return <SaveTheDateSite token={token} party={payload} />;
    }

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f0,_#f3ebe2_45%,_#e8ddd0)]">
        <PartyPortal token={token} initial={payload} />
      </div>
    );
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ee] px-6">
        <div className="max-w-md text-center">
          <p className="font-serif text-3xl text-[#1c1714]">Link not found</p>
          <p className="mt-3 text-[#6f6258]">
            This invite link is invalid or no longer active. Reach out to Ethan
            or Amanda if you need a new one.
          </p>
        </div>
      </div>
    );
  }
}
