"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Pencil, Rows3 } from "lucide-react";
import { EditPartyDialog } from "@/components/planning/edit-party-dialog";
import { PartyCard } from "@/components/planning/party-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuestRow {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  meal_choice: string | null;
  dietary_notes: string | null;
}

export interface GuestListParty {
  id: string;
  party_name: string | null;
  access_token: string;
  rsvp_status: string;
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

type View = "table" | "cards";

function addressLabel(party: GuestListParty) {
  const cityState = [party.city, party.state].filter(Boolean).join(", ");
  if (cityState) return cityState;
  if (party.address_collected_at || party.address_line1) return "Collected";
  return "Pending";
}

function rsvpLabel(guest: GuestRow) {
  if (guest.attending == null) return "—";
  if (!guest.attending) return "No";
  return guest.meal_choice ? `Yes · ${guest.meal_choice}` : "Yes";
}

export function GuestList({ parties, origin }: GuestListProps) {
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);

  const editingParty = parties.find((party) => party.id === editingPartyId);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return parties
      .flatMap((party) =>
        (party.guests ?? []).map((guest) => ({ party, guest })),
      )
      .filter(({ party, guest }) => {
        if (!needle) return true;
        return (
          guest.full_name.toLowerCase().includes(needle) ||
          (party.party_name ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const partyCmp = (a.party.party_name ?? "").localeCompare(
          b.party.party_name ?? "",
        );
        if (partyCmp !== 0) return partyCmp;
        if (a.guest.is_plus_one !== b.guest.is_plus_one) {
          return a.guest.is_plus_one ? 1 : -1;
        }
        return a.guest.full_name.localeCompare(b.guest.full_name);
      });
  }, [parties, query]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 border-b border-[#e4ddd4] pb-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-4">
        <div>
          <h2 className="font-serif text-2xl">
            {view === "table" ? "Guests" : "Parties"}
          </h2>
          <p className="mt-1 text-sm text-[#6f6258]">
            {parties.length
              ? `${rows.length} guest${rows.length === 1 ? "" : "s"} · ${parties.length} household${parties.length === 1 ? "" : "s"}`
              : "Parties you create will show up here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view === "table" ? (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guests"
              className="min-h-10 min-w-[12rem] flex-1 border border-[#d9d0c5] bg-white px-3 text-sm sm:flex-none"
            />
          ) : null}
          <div className="flex border border-[#1c1714]">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`inline-flex min-h-10 items-center gap-1.5 px-3 text-xs uppercase tracking-[0.16em] ${
                view === "table"
                  ? "bg-[#1c1714] text-[#f7f3ee]"
                  : "bg-white text-[#1c1714]"
              }`}
            >
              <Rows3 className="size-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`inline-flex min-h-10 items-center gap-1.5 px-3 text-xs uppercase tracking-[0.16em] ${
                view === "cards"
                  ? "bg-[#1c1714] text-[#f7f3ee]"
                  : "bg-white text-[#1c1714]"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {parties.length === 0 ? (
        <p className="text-[#6f6258]">No parties yet.</p>
      ) : view === "table" ? (
        <div className="border border-[#e4ddd4] bg-white">
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#6f6258]">
              No guests match “{query.trim()}”.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#eee6dc] hover:bg-transparent">
                  <TableHead className="h-10 px-3 text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:px-4">
                    Guest
                  </TableHead>
                  <TableHead className="h-10 px-3 text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:px-4">
                    Party
                  </TableHead>
                  <TableHead className="h-10 px-3 text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:px-4">
                    +1
                  </TableHead>
                  <TableHead className="hidden h-10 px-3 text-[10px] uppercase tracking-[0.16em] text-[#6f6258] sm:table-cell sm:px-4">
                    Address
                  </TableHead>
                  <TableHead className="hidden h-10 px-3 text-[10px] uppercase tracking-[0.16em] text-[#6f6258] md:table-cell md:px-4">
                    RSVP
                  </TableHead>
                  <TableHead className="h-10 w-10 px-2 text-[10px] uppercase tracking-[0.16em] text-[#6f6258]">
                    <span className="sr-only">Edit</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ party, guest }) => {
                  const pendingAddress = !party.address_collected_at && !party.address_line1;
                  return (
                    <TableRow
                      key={guest.id}
                      className="border-[#eee6dc] hover:bg-[#f7f3ee]"
                    >
                      <TableCell className="px-3 py-2.5 font-medium whitespace-normal sm:px-4">
                        {guest.full_name}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 whitespace-normal text-[#6f6258] sm:px-4">
                        {party.party_name || "Untitled"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-[#6f6258] sm:px-4">
                        {guest.is_plus_one ? "Yes" : "—"}
                      </TableCell>
                      <TableCell
                        className={`hidden px-3 py-2.5 sm:table-cell sm:px-4 ${
                          pendingAddress ? "text-[#8a7462]" : "text-[#6f6258]"
                        }`}
                      >
                        {addressLabel(party)}
                      </TableCell>
                      <TableCell className="hidden px-3 py-2.5 text-[#6f6258] md:table-cell md:px-4">
                        {rsvpLabel(guest)}
                      </TableCell>
                      <TableCell className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPartyId(party.id)}
                          className="inline-flex size-9 items-center justify-center text-[#6f6258] hover:text-[#1c1714]"
                          aria-label={`Edit ${party.party_name || "party"}`}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              guests={party.guests ?? []}
              link={`${origin}/r/${party.access_token}`}
            />
          ))}
        </div>
      )}

      {editingParty ? (
        <EditPartyDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditingPartyId(null);
          }}
          party={editingParty}
          guests={editingParty.guests ?? []}
        />
      ) : null}
    </section>
  );
}
