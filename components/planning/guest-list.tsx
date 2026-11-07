"use client";

import { useMemo, useState } from "react";
import { GroupEditor } from "@/components/planning/group-editor";
import { PartyCard } from "@/components/planning/party-card";

interface GuestRow {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  meal_choice: string | null;
  dietary_notes: string | null;
  sort_order?: number | null;
}

export interface GuestListParty {
  id: string;
  party_name: string | null;
  access_token: string;
  rsvp_status: string;
  source?: string | null;
  address_collected_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  food_allergies?: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  guests?: GuestRow[] | null;
}

interface GuestListProps {
  parties: GuestListParty[];
  origin: string;
}

type View = "groups" | "cards";

function partyMatches(party: GuestListParty, needle: string) {
  if (!needle) return true;
  const haystack = [
    party.party_name,
    party.contact_email,
    ...(party.guests ?? []).map((guest) => guest.full_name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function GuestList({ parties, origin }: GuestListProps) {
  const [view, setView] = useState<View>("groups");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return parties
      .filter((party) => partyMatches(party, needle))
      .sort((a, b) =>
        (a.party_name ?? "").localeCompare(b.party_name ?? ""),
      );
  }, [parties, query]);

  const guestCount = filtered.reduce(
    (count, party) => count + (party.guests?.length ?? 0),
    0,
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#8e8e8e]">
          {parties.length
            ? `${filtered.length} group${filtered.length === 1 ? "" : "s"} · ${guestCount} guest${guestCount === 1 ? "" : "s"}`
            : "Groups you create will show up here."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="min-h-11 min-w-[10rem] flex-1 rounded-full bg-[#161616] px-4 text-sm outline-none sm:flex-none"
          />
          <div className="flex rounded-full bg-[#161616] p-1">
            <button
              type="button"
              onClick={() => setView("groups")}
              className={`min-h-9 rounded-full px-4 text-sm ${
                view === "groups" ? "bg-white text-black" : "text-[#8e8e8e]"
              }`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`min-h-9 rounded-full px-4 text-sm ${
                view === "cards" ? "bg-white text-black" : "text-[#8e8e8e]"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {parties.length === 0 ? (
        <p className="text-[#8e8e8e]">No groups yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#8e8e8e]">
          No groups match “{query.trim()}”.
        </p>
      ) : view === "groups" ? (
        <div className="space-y-3">
          {filtered.map((party) => (
            <GroupEditor
              key={party.id}
              party={party}
              link={`${origin}/r/${party.access_token}`}
              expanded={openId === party.id}
              onToggle={() =>
                setOpenId((current) => (current === party.id ? null : party.id))
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filtered.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              guests={party.guests ?? []}
              link={`${origin}/r/${party.access_token}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
