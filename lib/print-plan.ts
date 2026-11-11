export interface PrintGuest {
  id: string;
  fullName: string;
  partyId: string;
  partyName: string;
  attending: boolean | null;
  isPlusOne: boolean;
}

export interface PrintTable {
  id: string;
  label: string;
  guestIds: string[];
}

export interface PrintSign {
  id: string;
  kicker: string;
  title: string;
  detail: string;
}

export type PrintPiece =
  | "seating"
  | "numbers"
  | "menu"
  | "welcome"
  | "signs";

export type SeatingLayout = "alphabetical" | "tables";
export type PosterPaper = "letter" | "tabloid";
export type CardPaper = "letter" | "card";

export interface PrintPlan {
  tables: PrintTable[];
  includePending: boolean;
  seatingLayout: SeatingLayout;
  seatingPaper: PosterPaper;
  welcomePaper: PosterPaper;
  cardPaper: CardPaper;
  signs: PrintSign[];
}

export interface SeatedGuest extends PrintGuest {
  tableId: string;
  tableLabel: string;
}

export const PRINT_STORAGE_KEY = "ea-print-plan-v1";

export const PAPER_INCHES = {
  letter: { width: 8.5, height: 11, label: "Letter · 8.5 × 11 in" },
  tabloid: { width: 11, height: 17, label: "Tabloid · 11 × 17 in" },
  card: { width: 5, height: 7, label: "5 × 7 in" },
} as const;

const defaultSigns: PrintSign[] = [
  {
    id: "cards",
    kicker: "With our thanks",
    title: "Cards & gifts",
    detail: "Leave them here.",
  },
  {
    id: "bar",
    kicker: "Reception",
    title: "The bar is open",
    detail: "All evening.",
  },
  {
    id: "book",
    kicker: "Before you find your seat",
    title: "Sign our book",
    detail: "A note, a wish, a story.",
  },
];

export function defaultPrintPlan(): PrintPlan {
  return {
    tables: [],
    includePending: false,
    seatingLayout: "alphabetical",
    seatingPaper: "letter",
    welcomePaper: "letter",
    cardPaper: "letter",
    signs: defaultSigns,
  };
}

export function splitPersonName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: "", last: parts[0] ?? "" };
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1] ?? "",
  };
}

export function compareNames(a: string, b: string) {
  const left = splitPersonName(a);
  const right = splitPersonName(b);
  return (
    left.last.localeCompare(right.last, undefined, { sensitivity: "base" }) ||
    left.first.localeCompare(right.first, undefined, { sensitivity: "base" }) ||
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export function directoryLetter(fullName: string) {
  const { last, first } = splitPersonName(fullName);
  const source = last || first || fullName;
  const char = source.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(char) ? char : "·";
}

export function isPrintableGuest(guest: PrintGuest, includePending: boolean) {
  if (guest.attending === false) return false;
  if (guest.attending === true) return true;
  return includePending;
}

export function seatingRoster(
  guests: PrintGuest[],
  tables: PrintTable[],
  includePending: boolean,
): SeatedGuest[] {
  const assignment = new Map<string, { tableId: string; tableLabel: string }>();
  for (const table of tables) {
    for (const guestId of table.guestIds) {
      if (assignment.has(guestId)) continue;
      assignment.set(guestId, {
        tableId: table.id,
        tableLabel: table.label.trim() || "—",
      });
    }
  }

  return guests.flatMap((guest) => {
    if (!isPrintableGuest(guest, includePending)) return [];
    const seat = assignment.get(guest.id);
    return [
      {
        ...guest,
        tableId: seat?.tableId ?? "",
        tableLabel: seat?.tableLabel ?? "",
      },
    ];
  });
}

export function tableMark(label: string) {
  const trimmed = label.trim();
  return trimmed || "—";
}

export function isNumericTable(label: string) {
  return /^\d+$/.test(label.trim());
}

export const TABLE_SEAT_LIMIT = 8;

export function seatsForName(name: string) {
  return name.includes("&") ? 2 : 1;
}

export function seatsTaken(guestIds: string[], guests: PrintGuest[]) {
  const names = new Map(guests.map((guest) => [guest.id, guest.fullName]));
  return guestIds.reduce((total, id) => total + seatsForName(names.get(id) ?? ""), 0);
}

export function nextTableLabel(tables: PrintTable[]) {
  const numbers = tables
    .map((table) => Number(table.label))
    .filter((value) => Number.isInteger(value) && value > 0);
  const max = numbers.length ? Math.max(...numbers) : 0;
  return String(max + 1);
}

const SEATING_LIST_HEIGHT: Record<PosterPaper, number> = {
  letter: 700,
  tabloid: 1180,
};

const SEATING_NAME_MAX: Record<PosterPaper, number> = {
  letter: 54,
  tabloid: 78,
};

export function seatingColumns(
  count: number,
  paper: PosterPaper,
  layout: SeatingLayout,
) {
  const maxColumns = paper === "tabloid" ? 4 : 3;
  if (count <= 1) return 1;

  if (layout === "tables") {
    if (count <= 3) return 1;
    if (count <= (paper === "tabloid" ? 8 : 6)) return 2;
    return count > 12 && paper === "tabloid" ? 4 : 3;
  }

  for (let columns = 1; columns < maxColumns; columns += 1) {
    if (seatingNamePx(count, paper, columns) >= 24) return columns;
  }
  return maxColumns;
}

export function seatingNamePx(count: number, paper: PosterPaper, columns = 1) {
  const safeColumns = Math.max(columns, 1);
  const rows = Math.max(1, Math.ceil(Math.max(count, 1) / safeColumns));
  const fromHeight = SEATING_LIST_HEIGHT[paper] / rows / 1.32;
  const pageWidth = (paper === "tabloid" ? 11 : 8.5) * 96;
  const pad = (paper === "tabloid" ? 1.44 : 1.16) * 96;
  const columnWidth = (pageWidth - pad) / safeColumns - 36;
  const fromWidth = columnWidth / 11;
  const size = Math.min(SEATING_NAME_MAX[paper], fromHeight, fromWidth);
  return Math.round(Math.max(12, size) * 10) / 10;
}

export function sheetInches(piece: PrintPiece, plan: PrintPlan) {
  if (piece === "seating") return PAPER_INCHES[plan.seatingPaper];
  if (piece === "welcome") return PAPER_INCHES[plan.welcomePaper];
  if ((piece === "numbers" || piece === "signs") && plan.cardPaper === "card") {
    return PAPER_INCHES.card;
  }
  return PAPER_INCHES.letter;
}

export function signTitleSize(title: string) {
  if (title.length > 28) return "2.15rem";
  if (title.length > 18) return "2.7rem";
  if (title.length > 12) return "3.15rem";
  return "3.6rem";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readTables(value: unknown): PrintTable[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    if (typeof entry.id !== "string" || typeof entry.label !== "string") return [];
    const guestIds = Array.isArray(entry.guestIds)
      ? entry.guestIds.filter((id): id is string => typeof id === "string")
      : [];
    return [{ id: entry.id, label: entry.label.slice(0, 40), guestIds }];
  });
}

function readSigns(value: unknown): PrintSign[] | null {
  if (!Array.isArray(value)) return null;
  const signs = value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    if (typeof entry.id !== "string" || typeof entry.title !== "string") return [];
    return [
      {
        id: entry.id,
        kicker: typeof entry.kicker === "string" ? entry.kicker.slice(0, 48) : "",
        title: entry.title.slice(0, 60),
        detail: typeof entry.detail === "string" ? entry.detail.slice(0, 160) : "",
      },
    ];
  });
  return signs.length ? signs : null;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

export function readPrintPlan(raw: string | null): PrintPlan | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const defaults = defaultPrintPlan();
    return {
      tables: readTables(parsed.tables),
      includePending: parsed.includePending === true,
      seatingLayout: oneOf(
        parsed.seatingLayout,
        ["alphabetical", "tables"] as const,
        defaults.seatingLayout,
      ),
      seatingPaper: oneOf(
        parsed.seatingPaper,
        ["letter", "tabloid"] as const,
        defaults.seatingPaper,
      ),
      welcomePaper: oneOf(
        parsed.welcomePaper,
        ["letter", "tabloid"] as const,
        defaults.welcomePaper,
      ),
      cardPaper: oneOf(parsed.cardPaper, ["letter", "card"] as const, defaults.cardPaper),
      signs: readSigns(parsed.signs) ?? defaults.signs,
    };
  } catch {
    return null;
  }
}
