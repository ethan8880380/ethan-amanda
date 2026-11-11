"use client";

import { useState, type DragEvent } from "react";
import {
  TABLE_SEAT_LIMIT,
  compareNames,
  isPrintableGuest,
  seatsTaken,
  type PrintGuest,
  type PrintPlan,
  type PrintTable,
} from "@/lib/print-plan";
import { cn } from "@/lib/utils";

type GuestDrag = { kind: "guests"; guestIds: string[] };
type TableDrag = { kind: "table"; tableId: string };
type DragState = GuestDrag | TableDrag;

export function SeatingBoard({
  plan,
  guests,
  seatedCount,
  onPlan,
  onPlace,
  onAddTables,
}: {
  plan: PrintPlan;
  guests: PrintGuest[];
  seatedCount: number;
  onPlan: (patch: Partial<PrintPlan>) => void;
  onPlace: (guestIds: string[], tableId: string | null) => void;
  onAddTables: (count: number) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [blockedId, setBlockedId] = useState<string | null>(null);

  const eligible = guests.filter((guest) =>
    isPrintableGuest(guest, plan.includePending),
  );
  const byId = new Map(eligible.map((guest) => [guest.id, guest]));
  const seatedIds = new Set(plan.tables.flatMap((table) => table.guestIds));
  const needle = query.trim().toLowerCase();

  const parties = groupParties(
    eligible.filter((guest) => !seatedIds.has(guest.id)),
  )
    .map((party) => ({
      ...party,
      guests: party.guests.filter((guest) => {
        if (!needle) return true;
        return `${guest.fullName} ${party.name}`.toLowerCase().includes(needle);
      }),
    }))
    .filter((party) => party.guests.length > 0);

  const unseatedCount = eligible.filter((guest) => !seatedIds.has(guest.id)).length;

  function startDrag(event: DragEvent, next: DragState) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", next.kind);
    setDrag(next);
  }

  function finishDrag() {
    setDrag(null);
    setOver(null);
  }

  function wouldExceed(tableId: string, guestIds: string[]) {
    const table = plan.tables.find((item) => item.id === tableId);
    if (!table) return false;
    const already = new Set(table.guestIds);
    const incoming = guestIds.filter((id) => !already.has(id));
    return seatsTaken([...table.guestIds, ...incoming], guests) > TABLE_SEAT_LIMIT;
  }

  function allowDrop(event: DragEvent, id: string) {
    if (!drag) return;
    const blocked = drag.kind === "guests" && id !== "pool" && wouldExceed(id, drag.guestIds);
    if (blocked) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "none";
      if (over !== id) setOver(id);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (over !== id) setOver(id);
  }

  function leaveDrop(event: DragEvent) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setOver(null);
  }

  function dropOnTable(event: DragEvent, tableId: string) {
    event.preventDefault();
    if (drag?.kind === "guests") {
      if (wouldExceed(tableId, drag.guestIds)) {
        setBlockedId(tableId);
        finishDrag();
        return;
      }
      setBlockedId(null);
      onPlace(drag.guestIds, tableId);
    }
    if (drag?.kind === "table") reorderTables(plan.tables, drag.tableId, tableId, onPlan);
    finishDrag();
  }

  function dropOnPool(event: DragEvent) {
    event.preventDefault();
    if (drag?.kind === "guests") {
      setBlockedId(null);
      onPlace(drag.guestIds, null);
    }
    finishDrag();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#5c5c5c]">
            {seatedCount} of {eligible.length} seated
            {plan.tables.length
              ? ` · ${plan.tables.length} ${plan.tables.length === 1 ? "table" : "tables"}`
              : ""}
          </p>
          <p className="mt-1 text-sm text-[#5c5c5c]">
            Drag a name onto a table. Drag a party to move everyone in it.
            Each table seats {TABLE_SEAT_LIMIT}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAddTables(1)}
            className="border border-[#141414] px-3 py-2 text-sm"
          >
            Add table
          </button>
          {plan.tables.length === 0 ? (
            <button
              type="button"
              onClick={() => onAddTables(8)}
              className="border border-[#141414] px-3 py-2 text-sm"
            >
              Add 8
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-start gap-2 text-sm text-[#141414]">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={plan.includePending}
            onChange={(event) => onPlan({ includePending: event.target.checked })}
          />
          Include guests who haven’t responded
        </label>
        <label className="grid min-w-48 flex-1 gap-1 text-sm text-[#5c5c5c] sm:max-w-xs">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or party"
            className="px-3 py-2 text-sm text-[#141414]"
          />
        </label>
      </div>

      <div className="grid grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)] items-start gap-3">
        <section
          onDragOver={(event) => allowDrop(event, "pool")}
          onDragLeave={leaveDrop}
          onDrop={dropOnPool}
          className={cn(
            "sticky top-20 flex max-h-[calc(100dvh-11rem)] min-h-64 min-w-0 flex-col rounded-2xl bg-[#161616] p-3",
            over === "pool" && drag?.kind === "guests" && "outline outline-2 outline-[#141414]",
          )}
        >
          <header className="px-1 pb-3">
            <h2 className="text-lg leading-none">Not seated</h2>
            <p className="mt-1 text-xs text-[#5c5c5c]">{unseatedCount}</p>
          </header>
          <div className="grid min-h-40 gap-4 overflow-auto pr-1">
            {parties.map((party) => (
              <div key={party.id} className="grid gap-2">
                <div
                  draggable
                  onDragStart={(event) => {
                    event.stopPropagation();
                    startDrag(event, {
                      kind: "guests",
                      guestIds: party.guests.map((guest) => guest.id),
                    });
                  }}
                  onDragEnd={finishDrag}
                  className="cursor-grab px-1 active:cursor-grabbing"
                >
                  <p className="text-sm">{party.name}</p>
                </div>
                {party.guests.map((guest) => (
                  <GuestChip
                    key={guest.id}
                    guest={guest}
                    muted={guest.attending == null ? "Awaiting reply" : undefined}
                    fading={drag?.kind === "guests" && drag.guestIds.includes(guest.id)}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      startDrag(event, { kind: "guests", guestIds: [guest.id] });
                    }}
                    onDragEnd={finishDrag}
                  />
                ))}
              </div>
            ))}
            {!parties.length ? (
              <p className="px-1 text-sm text-[#5c5c5c]">
                {needle
                  ? "Nothing matches that search."
                  : eligible.length
                    ? "Everyone on the list has a table."
                    : "No guests to seat yet. Add them on the guest list."}
              </p>
            ) : null}
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] items-start gap-3">
        {plan.tables.map((table) => {
          const seated = table.guestIds
            .map((id) => byId.get(id) ?? guests.find((guest) => guest.id === id))
            .filter((guest): guest is PrintGuest => Boolean(guest))
            .sort((a, b) => compareNames(a.fullName, b.fullName));
          const count = seatsTaken(table.guestIds, guests);
          const tooMany =
            blockedId === table.id ||
            (drag?.kind === "guests" && over === table.id && wouldExceed(table.id, drag.guestIds));
          const highlighted =
            over === table.id &&
            !tooMany &&
            (drag?.kind === "guests" ||
              (drag?.kind === "table" && drag.tableId !== table.id));

          return (
            <section
              key={table.id}
              onDragOver={(event) => allowDrop(event, table.id)}
              onDragLeave={leaveDrop}
              onDrop={(event) => dropOnTable(event, table.id)}
              className={cn(
                "flex max-h-80 min-h-48 min-w-0 flex-col rounded-2xl bg-[#161616] p-3",
                highlighted && "outline outline-2 outline-[#141414]",
                tooMany && "outline outline-2 outline-[#8a3a3a]",
                drag?.kind === "table" && drag.tableId === table.id && "opacity-50",
              )}
            >
              <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 pb-3">
                <span
                  draggable
                  role="button"
                  aria-label={`Move table ${table.label}`}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    startDrag(event, { kind: "table", tableId: table.id });
                  }}
                  onDragEnd={finishDrag}
                  className="cursor-grab px-1 text-[#5c5c5c] active:cursor-grabbing"
                >
                  ↕
                </span>
                <input
                  value={table.label}
                  aria-label="Table name"
                  onChange={(event) =>
                    renameTable(plan.tables, table.id, event.target.value.slice(0, 40), onPlan)
                  }
                  className="min-w-0 px-2 py-1.5 text-sm text-[#141414]"
                />
                <button
                  type="button"
                  onClick={() => removeTable(plan.tables, table.id, onPlan)}
                  className="px-1 text-sm text-[#5c5c5c]"
                >
                  ×
                </button>
              </header>
              <p
                className={cn(
                  "px-1 pb-3 text-xs",
                  count >= TABLE_SEAT_LIMIT || tooMany ? "text-[#141414]" : "text-[#5c5c5c]",
                )}
              >
                {count} of {TABLE_SEAT_LIMIT}
                {tooMany ? ` · a table seats ${TABLE_SEAT_LIMIT}` : ""}
              </p>
              <div className="grid min-h-40 content-start gap-2 overflow-auto pr-1">
                {seated.map((guest) => (
                  <GuestChip
                    key={guest.id}
                    guest={guest}
                    muted={guest.partyName}
                    fading={drag?.kind === "guests" && drag.guestIds.includes(guest.id)}
                    onDragStart={(event) =>
                      startDrag(event, { kind: "guests", guestIds: [guest.id] })
                    }
                    onDragEnd={finishDrag}
                  />
                ))}
                {!seated.length ? (
                  <p className="px-1 text-sm text-[#5c5c5c]">Drop names here.</p>
                ) : null}
              </div>
            </section>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function GuestChip({
  guest,
  muted,
  fading,
  onDragStart,
  onDragEnd,
}: {
  guest: PrintGuest;
  muted?: string;
  fading: boolean;
  onDragStart: (event: DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab border border-[#e4e4e4] bg-[#f7f7f7] px-3 py-2 active:cursor-grabbing",
        fading && "opacity-40",
      )}
    >
      <p className="text-sm text-[#141414]">{guest.fullName}</p>
      {muted ? <p className="text-xs text-[#5c5c5c]">{muted}</p> : null}
    </div>
  );
}

function groupParties(guests: PrintGuest[]) {
  const map = new Map<string, { id: string; name: string; guests: PrintGuest[] }>();
  for (const guest of guests) {
    const current = map.get(guest.partyId) ?? {
      id: guest.partyId,
      name: guest.partyName,
      guests: [],
    };
    current.guests.push(guest);
    map.set(guest.partyId, current);
  }
  return [...map.values()]
    .map((party) => ({
      ...party,
      guests: [...party.guests].sort((a, b) => compareNames(a.fullName, b.fullName)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renameTable(
  tables: PrintTable[],
  id: string,
  label: string,
  onPlan: (patch: Partial<PrintPlan>) => void,
) {
  onPlan({
    tables: tables.map((table) => (table.id === id ? { ...table, label } : table)),
  });
}

function removeTable(
  tables: PrintTable[],
  id: string,
  onPlan: (patch: Partial<PrintPlan>) => void,
) {
  onPlan({ tables: tables.filter((table) => table.id !== id) });
}

function reorderTables(
  tables: PrintTable[],
  fromId: string,
  toId: string,
  onPlan: (patch: Partial<PrintPlan>) => void,
) {
  if (fromId === toId) return;
  const from = tables.findIndex((table) => table.id === fromId);
  const to = tables.findIndex((table) => table.id === toId);
  if (from < 0 || to < 0) return;
  const copy = [...tables];
  const [row] = copy.splice(from, 1);
  copy.splice(to, 0, row);
  onPlan({ tables: copy });
}
