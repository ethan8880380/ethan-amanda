"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadSeating, saveSeating } from "@/app/plan/actions";
import { SeatingBoard } from "@/components/planning/prints/seating-board";
import { PrintSheets } from "@/components/planning/prints/sheets";
import {
  PRINT_STORAGE_KEY,
  TABLE_SEAT_LIMIT,
  defaultPrintPlan,
  nextTableLabel,
  readPrintPlan,
  seatingRoster,
  seatsTaken,
  sheetInches,
  type PrintGuest,
  type PrintPiece,
  type PrintPlan,
  type PrintSign,
  type PrintTable,
} from "@/lib/print-plan";
import { cn } from "@/lib/utils";

type StudioTab = "tables" | PrintPiece;

const pieces: { id: StudioTab; label: string }[] = [
  { id: "tables", label: "Tables" },
  { id: "seating", label: "Seating chart" },
  { id: "numbers", label: "Table numbers" },
  { id: "menu", label: "Menu" },
  { id: "welcome", label: "Welcome sign" },
  { id: "signs", label: "Signs" },
];

type SaveState = "idle" | "saving" | "saved" | "browser" | "error";

export function PrintStudio({ guests }: { guests: PrintGuest[] }) {
  const [plan, setPlan] = useState<PrintPlan>(defaultPrintPlan);
  const [tab, setTab] = useState<StudioTab>("seating");
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const serverOk = useRef(true);
  const lastSaved = useRef("");
  const saveSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const local = readPrintPlan(
        typeof window === "undefined" ? null : localStorage.getItem(PRINT_STORAGE_KEY),
      );
      let next = local ?? defaultPrintPlan();

      try {
        const server = await loadSeating();
        if (cancelled) return;
        if (!server.ok) {
          serverOk.current = false;
          setSaveState("browser");
        } else if (server.tables.length > 0) {
          next = { ...next, tables: server.tables };
          lastSaved.current = JSON.stringify(server.tables);
        } else if (next.tables.length === 0) {
          lastSaved.current = "[]";
        }
      } catch {
        if (!cancelled) {
          serverOk.current = false;
          setSaveState("browser");
        }
      }

      if (cancelled) return;
      setPlan(next);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocal(plan);
    if (!serverOk.current) return;
    const key = JSON.stringify(plan.tables);
    if (key === lastSaved.current) return;
    const tables = plan.tables;
    const timeout = window.setTimeout(() => {
      void persistTables(tables, key);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [plan, hydrated]);

  async function persistTables(tables: PrintTable[], key: string) {
    const seq = ++saveSeq.current;
    setSaveState("saving");
    try {
      const result = await saveSeating(tables);
      if (seq !== saveSeq.current) return;
      if (result.ok) {
        lastSaved.current = key;
        setSaveState("saved");
        return;
      }
      if ("localOnly" in result && result.localOnly) {
        serverOk.current = false;
        setSaveState("browser");
        return;
      }
      setSaveState("error");
    } catch {
      if (seq !== saveSeq.current) return;
      setSaveState("error");
    }
  }

  const roster = useMemo(
    () => seatingRoster(guests, plan.tables, plan.includePending),
    [guests, plan.tables, plan.includePending],
  );
  const seatedCount = roster.filter((guest) => guest.tableId).length;

  const printPiece: PrintPiece = tab === "tables" ? "seating" : tab;
  const previewSigns = Math.max(plan.signs.length, 1);
  const pageCount =
    printPiece === "numbers"
      ? Math.max(1, plan.tables.length)
      : printPiece === "signs"
        ? previewSigns
        : 1;

  const paper = sheetInches(printPiece, plan);
  const canPrint =
    tab !== "tables" &&
    (printPiece === "menu" ||
      printPiece === "welcome" ||
      (printPiece === "signs" && plan.signs.length > 0) ||
      (printPiece === "numbers" && plan.tables.length > 0) ||
      (printPiece === "seating" && roster.length > 0));

  function update(patch: Partial<PrintPlan>) {
    setPlan((current) => ({ ...current, ...patch }));
  }

  function addTables(count: number) {
    const firstId = crypto.randomUUID();
    setPlan((current) => {
      const tables = [...current.tables];
      for (let index = 0; index < count; index += 1) {
        tables.push({
          id: index === 0 ? firstId : crypto.randomUUID(),
          label: nextTableLabel(tables),
          guestIds: [],
        });
      }
      return { ...current, tables };
    });
    setTab("tables");
  }

  function placeGuests(guestIds: string[], tableId: string | null) {
    if (!guestIds.length) return;
    const adding = new Set(guestIds);
    setPlan((current) => {
      if (tableId) {
        const target = current.tables.find((table) => table.id === tableId);
        if (!target) return current;
        const incoming = guestIds.filter((id) => !target.guestIds.includes(id));
        if (seatsTaken([...target.guestIds, ...incoming], guests) > TABLE_SEAT_LIMIT) return current;
      }
      return {
        ...current,
        tables: current.tables.map((table) => {
          const without = table.guestIds.filter((id) => !adding.has(id));
          if (table.id !== tableId) return { ...table, guestIds: without };
          const nextIds = guestIds.filter((id) => !without.includes(id));
          return { ...table, guestIds: [...without, ...nextIds] };
        }),
      };
    });
  }

  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved"
        : saveState === "browser"
          ? "Saved in this browser"
          : saveState === "error"
            ? "Couldn’t save — still in this browser"
            : "";

  return (
    <div>
      <div className="no-print mx-auto max-w-6xl px-5 pb-28 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[2rem] leading-none">Prints</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c5c5c]">
              Seating charts, cards, and signs, set in the same type as the
              invitation. In the print dialog, turn off headers and footers, and
              turn on background graphics so the red prints.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveLabel ? (
              <p className="text-sm text-[#5c5c5c]">{saveLabel}</p>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!canPrint || !hydrated}
              className="bg-white px-4 py-2.5 text-sm disabled:opacity-40"
            >
              Print
            </button>
          </div>
        </div>

        <div className="no-scrollbar -mx-5 mt-6 flex gap-1 overflow-x-auto px-5">
          {pieces.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 border-b px-3 py-2 text-sm",
                tab === item.id
                  ? "border-[#141414] text-[#141414]"
                  : "border-transparent text-[#8e8e8e]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "tables" ? (
          <div className="mt-6">
            {hydrated ? (
              <SeatingBoard
                plan={plan}
                guests={guests}
                seatedCount={seatedCount}
                onPlan={update}
                onPlace={placeGuests}
                onAddTables={addTables}
              />
            ) : (
              <p className="text-sm text-[#5c5c5c]">Loading seating…</p>
            )}
          </div>
        ) : (
          <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
            <div className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
              {hydrated ? (
                <Preview
                  widthIn={paper.width}
                  heightIn={paper.height}
                  pages={pageCount}
                  caption={
                    roster.length > 0 && tab === "seating"
                      ? `${paper.label} · ${roster.length} from the guest list`
                      : paper.label
                  }
                >
                  <PrintSheets piece={printPiece} plan={plan} roster={roster} />
                </Preview>
              ) : (
                <div className="mt-2 grid min-h-[28rem] place-items-center bg-[#e4dfd6] text-sm text-[#5c5c5c]">
                  Loading the prints…
                </div>
              )}
            </div>

            <div className="mt-6 lg:mt-2">
              {hydrated ? (
                <PieceTools
                  piece={printPiece}
                  plan={plan}
                  rosterCount={roster.length}
                  seatedCount={seatedCount}
                  onPlan={update}
                  onAddTables={addTables}
                  onOpenTables={() => setTab("tables")}
                />
              ) : (
                <p className="text-sm text-[#5c5c5c]">Loading seating…</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="print-only">
        <PrintSheets piece={printPiece} plan={plan} roster={roster} />
      </div>

      <style>{`@media print { @page { size: ${paper.width}in ${paper.height}in; margin: 0; } }`}</style>
    </div>
  );
}

function writeLocal(plan: PrintPlan) {
  try {
    localStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // A full or private browser can still print this session.
  }
}

function Preview({
  widthIn,
  heightIn,
  pages,
  caption,
  children,
}: {
  widthIn: number;
  heightIn: number;
  pages: number;
  caption: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const gap = 28;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const available = element.clientWidth - 32;
      setScale(Math.min(1, available / (widthIn * 96)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [widthIn]);

  const height =
    pages * heightIn * 96 * scale + Math.max(0, pages - 1) * gap * scale;

  return (
    <div ref={ref} className="bg-[#e4dfd6] px-4 py-6">
      <p className="mb-4 text-center text-sm text-[#5c534c]">{caption}</p>
      <div className="relative mx-auto" style={{ height, width: widthIn * 96 * scale }}>
        <div
          className="absolute left-0 top-0 flex flex-col gap-7"
          style={{
            width: `${widthIn}in`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function PieceTools({
  piece,
  plan,
  rosterCount,
  seatedCount,
  onPlan,
  onAddTables,
  onOpenTables,
}: {
  piece: PrintPiece;
  plan: PrintPlan;
  rosterCount: number;
  seatedCount: number;
  onPlan: (patch: Partial<PrintPlan>) => void;
  onAddTables: (count: number) => void;
  onOpenTables: () => void;
}) {
  if (piece === "menu") {
    return (
      <Tools>
        <p className="text-sm leading-relaxed text-[#5c5c5c]">
          The reception menu, on one letter sheet. Print a copy for each table.
          The dishes come from the menu on the website.
        </p>
      </Tools>
    );
  }

  if (piece === "welcome") {
    return (
      <Tools>
        <p className="text-sm leading-relaxed text-[#5c5c5c]">
          A welcome poster for the reception door. Tabloid is 11×17 — a copy
          shop can print it if your printer can’t.
        </p>
        <Segmented
          value={plan.welcomePaper}
          options={[
            { value: "letter", label: "Letter" },
            { value: "tabloid", label: "Tabloid" },
          ]}
          onChange={(welcomePaper) => onPlan({ welcomePaper })}
        />
      </Tools>
    );
  }

  if (piece === "signs") {
    return (
      <SignTools
        signs={plan.signs}
        cardPaper={plan.cardPaper}
        onCardPaper={(cardPaper) => onPlan({ cardPaper })}
        onChange={(signs) => onPlan({ signs })}
      />
    );
  }

  if (piece === "numbers") {
    return (
      <Tools>
        <p className="text-sm leading-relaxed text-[#5c5c5c]">
          One card per table. Letter keeps a 5×7 card centered with cut marks.
          Choose 5×7 if you’re printing on cardstock.
        </p>
        <CardPaperControl
          value={plan.cardPaper}
          onChange={(cardPaper) => onPlan({ cardPaper })}
        />
        <p className="text-sm text-[#5c5c5c]">
          {plan.tables.length
            ? `${plan.tables.length} ${plan.tables.length === 1 ? "card" : "cards"}`
            : "Add tables on the Tables tab first."}
        </p>
        {plan.tables.length === 0 ? (
          <TextButton onClick={() => onAddTables(8)}>Add 8 tables</TextButton>
        ) : null}
      </Tools>
    );
  }

  return (
    <SeatingTools
      plan={plan}
      rosterCount={rosterCount}
      seatedCount={seatedCount}
      onPlan={onPlan}
      onOpenTables={onOpenTables}
    />
  );
}

function SeatingTools({
  plan,
  rosterCount,
  seatedCount,
  onPlan,
  onOpenTables,
}: {
  plan: PrintPlan;
  rosterCount: number;
  seatedCount: number;
  onPlan: (patch: Partial<PrintPlan>) => void;
  onOpenTables: () => void;
}) {
  const tight = plan.seatingPaper === "letter" && rosterCount > 80;

  return (
    <Tools>
      <Segmented
        value={plan.seatingLayout}
        options={[
          { value: "alphabetical", label: "A to Z" },
          { value: "tables", label: "By table" },
        ]}
        onChange={(seatingLayout) => onPlan({ seatingLayout })}
      />
      <Segmented
        value={plan.seatingPaper}
        options={[
          { value: "letter", label: "Letter" },
          { value: "tabloid", label: "Tabloid" },
        ]}
        onChange={(seatingPaper) => onPlan({ seatingPaper })}
      />
      {tight ? (
        <p className="text-sm leading-relaxed text-[#5c5c5c]">
          This is a lot of names for letter paper. Tabloid will be easier to read
          from a few feet away.
        </p>
      ) : (
        <p className="text-sm text-[#5c5c5c]">
          {seatedCount} of {rosterCount} seated
          {plan.tables.length ? ` · ${plan.tables.length} tables` : ""}
        </p>
      )}

      <label className="flex items-start gap-2 text-sm text-[#141414]">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={plan.includePending}
          onChange={(event) => onPlan({ includePending: event.target.checked })}
        />
        Include guests who haven’t responded
      </label>

      <p className="text-sm leading-relaxed text-[#5c5c5c]">
        Names are seated on the Tables tab. A to Z is the easiest chart to read
        across a room. By table hangs each table’s names together.
      </p>
      <TextButton onClick={onOpenTables}>Arrange tables</TextButton>
    </Tools>
  );
}

function SignTools({
  signs,
  cardPaper,
  onCardPaper,
  onChange,
}: {
  signs: PrintSign[];
  cardPaper: PrintPlan["cardPaper"];
  onCardPaper: (value: PrintPlan["cardPaper"]) => void;
  onChange: (signs: PrintSign[]) => void;
}) {
  function patch(id: string, next: Partial<PrintSign>) {
    onChange(signs.map((sign) => (sign.id === id ? { ...sign, ...next } : sign)));
  }

  return (
    <Tools>
      <p className="text-sm leading-relaxed text-[#5c5c5c]">
        Short signs for the gift table, the bar, the guest book. Letter centers
        a 5×7 with cut marks.
      </p>
      <CardPaperControl value={cardPaper} onChange={onCardPaper} />
      {signs.map((sign) => (
        <fieldset key={sign.id} className="grid gap-2 border border-[#e4e4e4] p-3">
          <label className="grid gap-1 text-xs text-[#5c5c5c]">
            Small line
            <input
              value={sign.kicker}
              onChange={(event) => patch(sign.id, { kicker: event.target.value.slice(0, 48) })}
              className="px-3 py-2 text-sm text-[#141414]"
            />
          </label>
          <label className="grid gap-1 text-xs text-[#5c5c5c]">
            Title
            <input
              value={sign.title}
              onChange={(event) => patch(sign.id, { title: event.target.value.slice(0, 60) })}
              className="px-3 py-2 text-sm text-[#141414]"
            />
          </label>
          <label className="grid gap-1 text-xs text-[#5c5c5c]">
            Detail
            <input
              value={sign.detail}
              onChange={(event) => patch(sign.id, { detail: event.target.value.slice(0, 160) })}
              className="px-3 py-2 text-sm text-[#141414]"
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(signs.filter((item) => item.id !== sign.id))}
            className="justify-self-start text-xs text-[#5c5c5c]"
          >
            Remove
          </button>
        </fieldset>
      ))}
      <TextButton
        onClick={() =>
          onChange([
            ...signs,
            {
              id: crypto.randomUUID(),
              kicker: "Reception",
              title: "New sign",
              detail: "",
            },
          ])
        }
      >
        Add a sign
      </TextButton>
    </Tools>
  );
}

function CardPaperControl({
  value,
  onChange,
}: {
  value: PrintPlan["cardPaper"];
  onChange: (value: PrintPlan["cardPaper"]) => void;
}) {
  return (
    <Segmented
      value={value}
      options={[
        { value: "letter", label: "On letter" },
        { value: "card", label: "5 × 7" },
      ]}
      onChange={onChange}
    />
  );
}

function Tools({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4">{children}</div>;
}

function TextButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[#141414] px-3 py-2 text-sm"
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex bg-[#161616] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 px-3 py-2 text-sm",
            value === option.value ? "bg-white" : "text-[#5c5c5c]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
