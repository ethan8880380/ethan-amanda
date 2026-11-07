"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { deleteParty, savePartyGroup } from "@/app/plan/actions";
import { EditPartyDialog } from "@/components/planning/edit-party-dialog";
import { cn } from "@/lib/utils";

interface GroupGuest {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  dietary_notes: string | null;
  sort_order?: number | null;
}

interface GroupParty {
  id: string;
  party_name: string | null;
  contact_email: string | null;
  notes: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  guests?: GroupGuest[] | null;
}

interface DraftGuest {
  key: string;
  id: string | null;
  name: string;
  isPlusOne: boolean;
  attending: boolean | null;
  dietaryNotes: string | null;
}

interface GroupEditorProps {
  party: GroupParty;
  link: string;
  expanded: boolean;
  onToggle: () => void;
}

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base";

function sortedGuests(party: GroupParty): DraftGuest[] {
  return [...(party.guests ?? [])]
    .sort((a, b) => {
      const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (order !== 0) return order;
      if (a.is_plus_one !== b.is_plus_one) return a.is_plus_one ? 1 : -1;
      return a.full_name.localeCompare(b.full_name);
    })
    .map((guest) => ({
      key: guest.id,
      id: guest.id,
      name: guest.full_name,
      isPlusOne: guest.is_plus_one,
      attending: guest.attending,
      dietaryNotes: guest.dietary_notes,
    }));
}

function memberLine(party: GroupParty) {
  const guests = sortedGuests(party);
  if (!guests.length) return "No one in this group yet";
  return guests
    .map((guest) => (guest.isPlusOne ? `${guest.name} (plus one)` : guest.name))
    .join(", ");
}

function replyLabel(guest: DraftGuest) {
  if (guest.attending == null) return "No reply";
  return guest.attending ? "Attending" : "Declined";
}

export function GroupEditor({
  party,
  link,
  expanded,
  onToggle,
}: GroupEditorProps) {
  return (
    <article className="rounded-[1.75rem] bg-[#161616]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span className="min-w-0">
          <span className="block font-medium text-2xl leading-tight">
            {party.party_name || "Untitled group"}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-[#8e8e8e]">
            {memberLine(party)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-[#8e8e8e] transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {expanded ? <GroupForm key={party.id} party={party} link={link} /> : null}
    </article>
  );
}

function GroupForm({ party, link }: { party: GroupParty; link: string }) {
  const baseId = useId();
  const nextKey = useRef(0);
  const focusKey = useRef<string | null>(null);
  const [partyName, setPartyName] = useState(party.party_name ?? "");
  const [email, setEmail] = useState(party.contact_email ?? "");
  const [guests, setGuests] = useState<DraftGuest[]>(() => sortedGuests(party));
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const key = focusKey.current;
    if (!key) return;
    focusKey.current = null;
    document.getElementById(`${baseId}-${key}-name`)?.focus();
  }, [guests, baseId]);

  function updateGuest(key: string, patch: Partial<DraftGuest>) {
    setGuests((current) =>
      current.map((guest) => (guest.key === key ? { ...guest, ...patch } : guest)),
    );
  }

  function addGuest(isPlusOne: boolean) {
    if (guests.length >= 10) return;
    nextKey.current += 1;
    const key = `new-${nextKey.current}`;
    focusKey.current = key;
    setGuests((current) => [
      ...current,
      {
        key,
        id: null,
        name: "",
        isPlusOne,
        attending: null,
        dietaryNotes: null,
      },
    ]);
  }

  function saveGroup() {
    setError(null);
    startTransition(async () => {
      try {
        const saved = await savePartyGroup({
          id: party.id,
          party_name: partyName,
          contact_email: email,
          guests: guests.map((guest) => ({
            id: guest.id,
            full_name: guest.name,
            is_plus_one: guest.isPlusOne,
          })),
        });
        setPartyName(saved.party_name);
        setEmail(saved.contact_email ?? "");
        setGuests(
          saved.guests.map((guest) => {
            const previous = guests.find((item) => item.id === guest.id);
            return {
              key: guest.id,
              id: guest.id,
              name: guest.full_name,
              isPlusOne: guest.is_plus_one,
              attending: previous?.attending ?? null,
              dietaryNotes: previous?.dietaryNotes ?? null,
            };
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save group.");
      }
    });
  }

  return (
    <div className="space-y-5 border-t border-white/10 px-4 py-5 sm:px-5">
      {error ? (
        <p className="border-l-2 border-[#ff453a] bg-[#2c1515] px-3 py-2 text-sm text-[#ffb4ab]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Group name
          <input
            value={partyName}
            onChange={(event) => setPartyName(event.target.value)}
            className={cn("mt-1", fieldClass)}
          />
        </label>
        <label className="text-sm">
          Email <span className="text-[#8e8e8e]">(optional)</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            inputMode="email"
            className={cn("mt-1", fieldClass)}
          />
        </label>
      </div>

      <ul className="space-y-3">
        {guests.map((guest, index) => (
          <li
            key={guest.key}
            className="grid gap-2 rounded-2xl bg-black p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
          >
            <label className="text-sm">
              <span className="text-[#8e8e8e]">
                {guest.isPlusOne ? "Plus one" : `Person ${index + 1}`}
              </span>
              <input
                id={`${baseId}-${guest.key}-name`}
                value={guest.name}
                onChange={(event) => updateGuest(guest.key, { name: event.target.value })}
                placeholder={guest.isPlusOne ? "Their name" : "Full name"}
                className={cn("mt-1", fieldClass)}
              />
              <span className="mt-1 block text-xs text-[#6a6a6a]">
                {replyLabel(guest)}
                {guest.dietaryNotes ? ` · ${guest.dietaryNotes}` : ""}
              </span>
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={guest.isPlusOne}
                onChange={(event) =>
                  updateGuest(guest.key, { isPlusOne: event.target.checked })
                }
                className="size-4 accent-white"
              />
              Plus one
            </label>
            <button
              type="button"
              onClick={() =>
                setGuests((current) => current.filter((item) => item.key !== guest.key))
              }
              className="min-h-11 px-2 text-left text-xs uppercase tracking-[0.14em] text-[#ff453a]"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => addGuest(false)}
          disabled={guests.length >= 10}
          className="min-h-11 flex-1 rounded-full border border-white/15 px-3 text-xs uppercase tracking-[0.16em] disabled:opacity-40"
        >
          Add person
        </button>
        <button
          type="button"
          onClick={() => addGuest(true)}
          disabled={guests.length >= 10}
          className="min-h-11 flex-1 rounded-full border border-white/15 px-3 text-xs uppercase tracking-[0.16em] disabled:opacity-40"
        >
          Add plus one
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={saveGroup}
          disabled={isPending}
          className="min-h-12 rounded-full bg-white px-5 text-xs uppercase tracking-[0.18em] text-black disabled:opacity-60 sm:min-w-40"
        >
          {isPending ? "Saving…" : "Save group"}
        </button>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="min-h-11 px-3 text-xs uppercase tracking-[0.16em] text-[#8e8e8e]"
        >
          Address and notes
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (
              !window.confirm(
                `Delete ${party.party_name || "this group"} and everyone in it?`,
              )
            ) {
              return;
            }
            startTransition(async () => {
              await deleteParty(party.id);
            });
          }}
          className="min-h-11 px-3 text-left text-xs uppercase tracking-[0.16em] text-[#ff453a] disabled:opacity-50 sm:ml-auto"
        >
          Delete group
        </button>
      </div>
      <p className="break-all text-xs text-[#6a6a6a]">{link}</p>

      <EditPartyDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        showGuests={false}
        party={party}
        guests={party.guests ?? []}
      />
    </div>
  );
}
