import { weddingContent } from "@/lib/wedding-content";
import { seatingScript } from "@/lib/print-fonts";
import {
  compareNames,
  directoryLetter,
  isNumericTable,
  seatingColumns,
  signTitleSize,
  tableMark,
  type CardPaper,
  type PosterPaper,
  type PrintPiece,
  type PrintPlan,
  type SeatedGuest,
  type SeatingLayout,
} from "@/lib/print-plan";
import { Monogram, MountedCard, Paper } from "@/components/planning/prints/paper";

const reception = weddingContent.venue.reception.name;
const receptionCity = weddingContent.venue.reception.city;

function sortedGuests(guests: SeatedGuest[]) {
  return [...guests].sort((a, b) => compareNames(a.fullName, b.fullName));
}

function posterPad(paper: PosterPaper) {
  return paper === "tabloid" ? "0.72in" : "0.58in";
}

export function PrintSheets({
  piece,
  plan,
  roster,
}: {
  piece: PrintPiece;
  plan: PrintPlan;
  roster: SeatedGuest[];
}) {
  const seated = sortedGuests(roster);

  switch (piece) {
    case "seating":
      return (
        <SeatingChart
          guests={seated}
          paper={plan.seatingPaper}
          layout={plan.seatingLayout}
        />
      );
    case "numbers":
      return (
        <NumberPages
          labels={plan.tables.map((table) => table.label)}
          mode={plan.cardPaper}
        />
      );
    case "menu":
      return <MenuSheet />;
    case "welcome":
      return <WelcomeSheet paper={plan.welcomePaper} />;
    case "signs":
      return <SignPages signs={plan.signs} mode={plan.cardPaper} />;
    default:
      return null;
  }
}

function posterColumns(count: number, paper: PosterPaper) {
  if (count <= 10) return paper === "tabloid" ? 2 : 1;
  if (count <= 28) return paper === "tabloid" ? 3 : 2;
  return paper === "tabloid" ? 4 : 3;
}

function posterNamePx(count: number, paper: PosterPaper, columns: number) {
  const rows = Math.ceil(Math.max(count, 1) / columns) + columns;
  const listHeight = paper === "tabloid" ? 1080 : 620;
  const fromHeight = listHeight / Math.max(rows, 1);
  const max = paper === "tabloid" ? 15 : 12;
  const min = paper === "tabloid" ? 8 : 7;
  return Math.round(Math.min(max, Math.max(min, fromHeight)) * 10) / 10;
}

function letterRanges(guests: SeatedGuest[]) {
  const ranges: [string, string][] = [
    ["A", "B"],
    ["C", "E"],
    ["F", "H"],
    ["I", "K"],
    ["L", "M"],
    ["N", "P"],
    ["Q", "R"],
    ["S", "T"],
    ["U", "Z"],
  ];
  const ordered = sortedGuests(guests);
  const groups = ranges.flatMap(([start, end]) => {
    const inRange = ordered.filter((guest) => {
      const letter = directoryLetter(guest.fullName);
      return letter >= start && letter <= end;
    });
    if (!inRange.length) return [];
    return [{ label: `${start}-${end}`, guests: inRange }];
  });
  const other = ordered.filter((guest) => !/[A-Z]/.test(directoryLetter(guest.fullName)));
  if (other.length) groups.push({ label: "·", guests: other });
  return groups;
}

function SeatingChart({
  guests,
  paper,
  layout,
}: {
  guests: SeatedGuest[];
  paper: PosterPaper;
  layout: SeatingLayout;
}) {
  const width = paper === "tabloid" ? "11in" : "8.5in";
  const height = paper === "tabloid" ? "17in" : "11in";
  const isTabloid = paper === "tabloid";
  const tableCount = new Set(guests.map((guest) => guest.tableId).filter(Boolean)).size;
  const columns =
    layout === "tables"
      ? seatingColumns(tableCount, paper, layout)
      : posterColumns(guests.length, paper);
  const namePx = posterNamePx(guests.length, paper, columns);
  const unseated =
    layout === "tables" && guests.length > 0 && guests.every((guest) => !guest.tableId);

  return (
    <Paper
      width={width}
      height={height}
      className="flex flex-col"
      style={{ backgroundColor: "#fff", color: "#000" }}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ padding: isTabloid ? "0.85in 0.7in 0.7in" : "0.62in 0.5in 0.55in" }}
      >
        <header className="text-center">
          <p
            className={seatingScript.className}
            style={{
              fontFamily: seatingScript.style.fontFamily,
              fontSize: isTabloid ? "4.6rem" : "3.15rem",
              lineHeight: 0.8,
              color: "#000",
            }}
          >
            grab a drink
          </p>
          <h2
            style={{
              marginTop: isTabloid ? "0.15rem" : "0.05rem",
              fontSize: isTabloid ? "3.15rem" : "2.05rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: "#000",
            }}
          >
            Find your seat
          </h2>
        </header>

        <div className="mt-8 min-h-0 flex-1 overflow-hidden md:mt-10">
          {guests.length === 0 ? (
            <p className="font-wedding-sans text-[1.05rem] leading-snug" style={{ color: "#000" }}>
              Guests from the list will be printed here.
            </p>
          ) : unseated ? (
            <p className="font-wedding-sans text-[1.05rem] leading-snug" style={{ color: "#000" }}>
              Seat guests and each table will be listed here.
            </p>
          ) : layout === "alphabetical" ? (
            <AlphabeticalList guests={guests} paper={paper} namePx={namePx} columns={columns} />
          ) : (
            <TableGrid guests={guests} paper={paper} namePx={namePx} columns={columns} />
          )}
        </div>
      </div>
    </Paper>
  );
}

function PosterName({
  guest,
  namePx,
}: {
  guest: SeatedGuest;
  namePx: number;
}) {
  return (
    <li
      className="flex items-baseline text-left"
      style={{
        fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        fontSize: `${namePx}px`,
        fontWeight: 500,
        letterSpacing: "0",
        lineHeight: 1.7,
        color: "#000",
      }}
    >
      <span className="shrink-0">{guest.fullName}</span>
      {guest.tableLabel ? (
        <>
          <span
            aria-hidden
            className="mx-[0.7em] min-w-[1.25em] flex-1 self-center"
            style={{
              height: "5px",
              backgroundImage:
                "radial-gradient(circle, rgba(0, 0, 0, 0.72) 1.05px, transparent 1.4px)",
              backgroundSize: "8px 5px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "left center",
            }}
          />
          <span className="shrink-0 tabular-nums">{guest.tableLabel}</span>
        </>
      ) : null}
    </li>
  );
}

function AlphabeticalList({
  guests,
  paper,
  namePx,
  columns,
}: {
  guests: SeatedGuest[];
  paper: PosterPaper;
  namePx: number;
  columns: number;
}) {
  const groups = letterRanges(guests);
  const headerPx = Math.max(namePx + 1, paper === "tabloid" ? 15 : 12);

  return (
    <div
      className="h-full"
      style={{
        columns,
        columnGap: paper === "tabloid" ? "1.35rem" : "0.95rem",
        columnFill: "balance",
      }}
    >
      {groups.map((group) => (
        <section
          key={group.label}
          className="text-left"
          style={{ breakInside: "avoid", marginBottom: "1.35rem" }}
        >
          <h3
            className="text-center"
            style={{
              fontSize: `${headerPx}px`,
              fontWeight: 600,
              letterSpacing: "0.12em",
              lineHeight: 1,
              color: "#000",
            }}
          >
            {group.label}
          </h3>
          <ul className="m-0 mt-2 list-none p-0 text-left">
            {group.guests.map((guest) => (
              <PosterName key={guest.id} guest={guest} namePx={namePx} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TableGrid({
  guests,
  paper,
  namePx,
  columns,
}: {
  guests: SeatedGuest[];
  paper: PosterPaper;
  namePx: number;
  columns: number;
}) {
  const groups = new Map<string, { id: string; label: string; guests: SeatedGuest[] }>();
  for (const guest of guests) {
    if (!guest.tableId) continue;
    const current = groups.get(guest.tableId) ?? {
      id: guest.tableId,
      label: guest.tableLabel,
      guests: [],
    };
    current.guests.push(guest);
    groups.set(guest.tableId, current);
  }
  const tables = [...groups.values()].map((group) => ({
    ...group,
    guests: sortedGuests(group.guests),
  }));
  return (
    <div
      className="grid h-full content-start"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: paper === "tabloid" ? "1.8rem 1.7rem" : "1.35rem 1.25rem",
      }}
    >
      {tables.map((table) => (
        <section key={table.id} className="min-w-0 text-left">
          <h3
            className="text-center"
            style={{
              fontSize: `${Math.max(namePx + 2, paper === "tabloid" ? 18 : 15)}px`,
              fontWeight: 600,
              letterSpacing: "0.08em",
              lineHeight: 1,
              color: "#000",
            }}
          >
            {tableMark(table.label)}
          </h3>
          <ul className="m-0 mt-2 list-none p-0 text-left">
            {table.guests.map((guest) => (
              <li
                key={guest.id}
                className="text-left"
                style={{
                  fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
                  fontSize: `${namePx}px`,
                  fontWeight: 500,
                  letterSpacing: "0",
                  lineHeight: 1.45,
                  color: "#000",
                }}
              >
                {guest.fullName}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function NumberPages({ labels, mode }: { labels: string[]; mode: CardPaper }) {
  const cards = labels.length ? labels : [];
  if (!cards.length) {
    return (
      <MountedCard mode={mode}>
        <div className="flex h-full items-center justify-center px-[0.4in] text-center">
          <p className="font-wedding-serif text-[1.45rem] italic text-ink/40">
            Add tables to print numbers.
          </p>
        </div>
      </MountedCard>
    );
  }

  return (
    <>
      {cards.map((label, index) => (
        <MountedCard key={`${label}-${index}`} mode={mode}>
          <TableNumberFace label={label} />
        </MountedCard>
      ))}
    </>
  );
}

function TableNumberFace({ label }: { label: string }) {
  const mark = tableMark(label);
  const numeric = isNumericTable(label);
  const size = numeric
    ? mark.length > 2
      ? "5.5rem"
      : "8.5rem"
    : mark.length > 12
      ? "2.6rem"
      : mark.length > 8
        ? "3.3rem"
        : "4.4rem";

  return (
    <div className="flex h-full flex-col items-center justify-between px-[0.45in] py-[0.55in] text-center">
      <Monogram className="text-[1.35rem]" />
      <div>
        <p className="wedding-eyebrow text-ink/45">Table</p>
        <p
          className="mt-3 font-wedding-serif leading-[0.86] text-blood"
          style={{ fontSize: size }}
        >
          {mark}
        </p>
      </div>
      <div>
        <div className="mx-auto mb-3 w-8 border-t border-ink/30" />
        <p className="text-[0.78rem] tracking-wide text-ink/55">
          {weddingContent.couple.short}
        </p>
      </div>
    </div>
  );
}

function MenuSheet() {
  const { menu } = weddingContent;

  return (
    <Paper width="8.5in" height="11in" className="flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col" style={{ padding: "0.58in 0.62in 0.5in" }}>
        <header>
          <div className="flex items-end justify-between gap-6">
            <h2 className="wedding-display text-[3.15rem] leading-[0.9] text-ink">
              {menu.title}
            </h2>
            <Monogram className="mb-1 text-[1.55rem]" />
          </div>
          <p className="mt-3 text-[0.92rem] text-ink/55">{menu.lead}</p>
        </header>

        <div className="mt-5 min-h-0 flex-1 overflow-hidden">
          {menu.courses.map((course) => (
            <section key={course.title} className="mt-6 first:mt-0">
              <h3 className="wedding-eyebrow text-blood">{course.title}</h3>
              <ul className="mt-1">
                {course.items.map((item) => (
                  <li
                    key={item.name}
                    className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-x-4 border-t border-ink/10 py-[0.62rem]"
                  >
                    <div className="min-w-0">
                      <p className="font-wedding-serif text-[1.22rem] leading-snug text-ink">
                        {item.name}
                      </p>
                      {"detail" in item && item.detail ? (
                        <p className="mt-0.5 text-[0.75rem] leading-snug text-ink/55">
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                    {"note" in item && item.note ? (
                      <p className="pt-1 text-right text-[0.58rem] uppercase leading-snug tracking-[0.12em] text-ink/45">
                        {item.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-3 flex items-center justify-between border-t border-ink/15 pt-3">
          <p className="wedding-eyebrow text-ink/45">{weddingContent.date.short}</p>
          <p className="wedding-eyebrow text-ink/45">{reception}</p>
        </footer>
      </div>
    </Paper>
  );
}

function WelcomeSheet({ paper }: { paper: PosterPaper }) {
  const width = paper === "tabloid" ? "11in" : "8.5in";
  const height = paper === "tabloid" ? "17in" : "11in";
  const [weekday, monthDay, year] = splitDate(weddingContent.date.display);
  const monthSize = paper === "tabloid" ? "8.4rem" : "5.75rem";
  const weekSize = paper === "tabloid" ? "2.15rem" : "1.55rem";

  return (
    <Paper width={width} height={height}>
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ padding: posterPad(paper) }}
      >
        <p className="wedding-eyebrow text-ink/50">Welcome</p>
        <h2 className="mt-8 font-wedding-serif text-ink" style={{ lineHeight: 0.86 }}>
          <span
            className="block italic text-ink/55"
            style={{ fontSize: weekSize }}
          >
            {weekday}
          </span>
          <span className="mt-2 block tracking-[-0.03em]" style={{ fontSize: monthSize }}>
            {monthDay}
          </span>
          <span className="block tracking-[-0.03em] text-blood" style={{ fontSize: monthSize }}>
            {year}
          </span>
        </h2>
        <div className="mt-8 w-full max-w-[10rem] border-t-2 border-ink/80" aria-hidden />
        <p
          className="mt-8 font-wedding-serif tracking-[-0.03em] text-ink"
          style={{ fontSize: paper === "tabloid" ? "2.5rem" : "1.9rem" }}
        >
          {weddingContent.couple.short}
        </p>
        <p className="mt-6 text-[0.95rem] tracking-wide text-ink/55">{reception}</p>
        <p className="mt-1 text-[0.95rem] tracking-wide text-ink/55">{receptionCity}</p>
      </div>
    </Paper>
  );
}

function SignPages({
  signs,
  mode,
}: {
  signs: PrintPlan["signs"];
  mode: CardPaper;
}) {
  if (!signs.length) {
    return (
      <MountedCard mode={mode}>
        <div className="flex h-full items-center justify-center px-[0.45in] text-center">
          <p className="font-wedding-serif text-[1.45rem] italic text-ink/40">
            Add a sign to print it.
          </p>
        </div>
      </MountedCard>
    );
  }

  return (
    <>
      {signs.map((sign) => (
        <MountedCard key={sign.id} mode={mode}>
          <div className="flex h-full flex-col items-center justify-between px-[0.48in] py-[0.55in] text-center">
            <p className="wedding-eyebrow text-ink/45">{sign.kicker || "Reception"}</p>
            <div>
              <h2
                className="font-wedding-serif leading-[0.95] tracking-[-0.03em] text-ink"
                style={{ fontSize: signTitleSize(sign.title || "Sign") }}
              >
                {sign.title || "Sign"}
              </h2>
              {sign.detail ? (
                <p className="mx-auto mt-4 max-w-[3.6in] text-[0.95rem] leading-snug text-ink/60">
                  {sign.detail}
                </p>
              ) : null}
            </div>
            <Monogram className="text-[1.35rem]" />
          </div>
        </MountedCard>
      ))}
    </>
  );
}

function splitDate(display: string): [string, string, string] {
  const match = display.match(/^(\w+),\s+(.+?),\s+(\d{4})$/);
  if (!match) return ["", display, ""];
  return [match[1], match[2], match[3]];
}
