import { weddingContent } from "@/lib/wedding-content";

export type BudgetCategory =
  | "venue"
  | "catering"
  | "photo_video"
  | "florals"
  | "attire"
  | "music"
  | "stationery"
  | "travel"
  | "gifts"
  | "misc";

export const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photo_video", label: "Photo / video" },
  { value: "florals", label: "Florals" },
  { value: "attire", label: "Attire" },
  { value: "music", label: "Music" },
  { value: "stationery", label: "Stationery" },
  { value: "travel", label: "Travel" },
  { value: "gifts", label: "Gifts" },
  { value: "misc", label: "Misc" },
];

export const TASK_CATEGORIES = [
  "Admin",
  "Guests",
  "Venue",
  "Vendors",
  "Attire",
  "Stationery",
  "Day-of",
  "Travel",
  "Misc",
] as const;

export const VENDOR_CATEGORIES = [
  "Venue",
  "Catering",
  "Photographer",
  "Videographer",
  "Florist",
  "DJ / Band",
  "Officiant",
  "Cake",
  "Hair / Makeup",
  "Rentals",
  "Transportation",
  "Planner",
  "Other",
] as const;

export interface TaskPreset {
  title: string;
  description: string;
  category: string;
  /** Months before wedding day (negative = after). */
  monthsBefore: number;
  assignee?: string;
}

/** Classic 12-month wedding checklist, due dates computed from wedding ISO date. */
export const TASK_PRESETS: TaskPreset[] = [
  {
    title: "Set wedding date & budget range",
    description: "Lock the date in wedding-content and agree on a total budget.",
    category: "Admin",
    monthsBefore: 12,
  },
  {
    title: "Book ceremony & reception venues",
    description: "Tour options, confirm capacity, and sign contracts.",
    category: "Venue",
    monthsBefore: 11,
  },
  {
    title: "Draft guest list (A / B)",
    description: "Start the household list in the Guests tab; mark must-invites.",
    category: "Guests",
    monthsBefore: 11,
  },
  {
    title: "Hire photographer & videographer",
    description: "Compare packages, review portfolios, put deposits down.",
    category: "Vendors",
    monthsBefore: 10,
  },
  {
    title: "Book catering / meal style",
    description: "Decide plated vs buffet, tasting date, and dietary plan.",
    category: "Vendors",
    monthsBefore: 10,
  },
  {
    title: "Book florist & music",
    description: "Ceremony florals, bouquets, and DJ/band or playlist plan.",
    category: "Vendors",
    monthsBefore: 9,
  },
  {
    title: "Send save-the-dates",
    description: "Collect addresses via guest links, then mail or email STDs.",
    category: "Stationery",
    monthsBefore: 8,
  },
  {
    title: "Shop attire & schedule fittings",
    description: "Wedding party outfits, shoes, and alteration timeline.",
    category: "Attire",
    monthsBefore: 8,
  },
  {
    title: "Book hair, makeup & officiant",
    description: "Trials for hair/makeup; confirm ceremony script with officiant.",
    category: "Vendors",
    monthsBefore: 7,
  },
  {
    title: "Order invitations & envelopes",
    description: "Finalize wording, RSVP deadline, and envelope addressing plan.",
    category: "Stationery",
    monthsBefore: 6,
  },
  {
    title: "Reserve hotel block",
    description: "Block rooms for out-of-town guests; add details to the site.",
    category: "Travel",
    monthsBefore: 6,
  },
  {
    title: "Register for gifts / honeymoon fund",
    description: "Publish registry links on the wedding site.",
    category: "Admin",
    monthsBefore: 5,
  },
  {
    title: "Mail invitations",
    description: "Switch guest phase to Invite, then send formal invites.",
    category: "Stationery",
    monthsBefore: 4,
  },
  {
    title: "Plan rehearsal dinner",
    description: "Venue, guest list, and toasts for the night before.",
    category: "Day-of",
    monthsBefore: 3,
  },
  {
    title: "Finalize menu & meal counts",
    description: "Pull meal choices from RSVPs and send to catering.",
    category: "Vendors",
    monthsBefore: 2,
  },
  {
    title: "Build day-of timeline & seating",
    description: "Sync timeline from the site, assign seats, print run sheet.",
    category: "Day-of",
    monthsBefore: 2,
  },
  {
    title: "Final vendor confirmations",
    description: "Confirm arrival times, payments due, and contact sheet.",
    category: "Vendors",
    monthsBefore: 1,
  },
  {
    title: "Pick up attire & marriage license",
    description: "Final fittings, license appointment, emergency kit.",
    category: "Admin",
    monthsBefore: 1,
  },
  {
    title: "Rehearsal & welcome notes",
    description: "Walk through ceremony, share day-of contacts with wedding party.",
    category: "Day-of",
    monthsBefore: 0,
  },
  {
    title: "Write vows & gather day-of essentials",
    description: "Rings, vows, tips envelopes, seating chart, vendor tips.",
    category: "Day-of",
    monthsBefore: 0,
  },
];

export interface BudgetPreset {
  label: string;
  category: BudgetCategory;
  estimated_amount: number;
  notes?: string;
}

/** Starter budget template (edit amounts after seeding). */
export const BUDGET_PRESETS: BudgetPreset[] = [
  { label: "Ceremony venue", category: "venue", estimated_amount: 3000 },
  { label: "Reception venue", category: "venue", estimated_amount: 8000 },
  { label: "Catering & bar", category: "catering", estimated_amount: 12000 },
  { label: "Cake / dessert", category: "catering", estimated_amount: 800 },
  {
    label: "Photography",
    category: "photo_video",
    estimated_amount: 4000,
  },
  {
    label: "Videography",
    category: "photo_video",
    estimated_amount: 2500,
  },
  { label: "Florals & décor", category: "florals", estimated_amount: 2500 },
  { label: "Wedding attire", category: "attire", estimated_amount: 2500 },
  { label: "DJ / band", category: "music", estimated_amount: 1800 },
  {
    label: "Save-the-dates & invitations",
    category: "stationery",
    estimated_amount: 600,
  },
  {
    label: "Hotel block / guest travel help",
    category: "travel",
    estimated_amount: 500,
  },
  { label: "Wedding party gifts", category: "gifts", estimated_amount: 600 },
  {
    label: "Misc / contingency (10%)",
    category: "misc",
    estimated_amount: 4000,
    notes: "Buffer for tips, overtime, and surprises.",
  },
];

export interface VendorPreset {
  name: string;
  category: string;
  notes: string;
}

export const VENDOR_PRESETS: VendorPreset[] = [
  {
    name: "Ceremony venue",
    category: "Venue",
    notes: "Replace with booked venue name once confirmed.",
  },
  {
    name: "Reception venue",
    category: "Venue",
    notes: "Same as ceremony if one location.",
  },
  {
    name: "Catering",
    category: "Catering",
    notes: "Track tasting date and final headcount here.",
  },
  {
    name: "Photographer",
    category: "Photographer",
    notes: "Compare 2–3 portfolios before booking.",
  },
  {
    name: "Videographer",
    category: "Videographer",
    notes: "Optional — decide highlight vs full film.",
  },
  {
    name: "Florist",
    category: "Florist",
    notes: "Bouquets, ceremony arch, centerpieces.",
  },
  {
    name: "DJ / Band",
    category: "DJ / Band",
    notes: "Must-play / do-not-play lists later.",
  },
  {
    name: "Officiant",
    category: "Officiant",
    notes: "Script meeting 4–6 weeks out.",
  },
  {
    name: "Cake / bakery",
    category: "Cake",
    notes: "Flavor tasting + delivery window.",
  },
  {
    name: "Hair & makeup",
    category: "Hair / Makeup",
    notes: "Book trials; include wedding party slots.",
  },
];

export interface NotePreset {
  title: string;
  body: string;
  pinned?: boolean;
}

export const NOTE_PRESETS: NotePreset[] = [
  {
    title: "Vision & vibe",
    body: "Describe the feel of the day (colors, formality, must-have moments).",
    pinned: true,
  },
  {
    title: "Decision log",
    body: "Big calls and why — venue, meal style, guest count cap, kids policy.",
    pinned: true,
  },
  {
    title: "Open questions",
    body: "- \n- \n-",
  },
  {
    title: "Day-of contacts",
    body: "Venue coordinator:\nPhotographer:\nPlanner / point person:\nEmergency:",
  },
];

export function getWeddingDate(): Date {
  const iso = weddingContent.date.iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatWeddingDateLabel(): string {
  return weddingContent.date.display;
}

export function daysUntilWedding(from = new Date()): number {
  const wedding = getWeddingDate();
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(
    wedding.getFullYear(),
    wedding.getMonth(),
    wedding.getDate(),
  );
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function dueDateMonthsBefore(monthsBefore: number): string {
  const wedding = getWeddingDate();
  const due = new Date(wedding);
  due.setMonth(due.getMonth() - monthsBefore);
  const y = due.getFullYear();
  const m = String(due.getMonth() + 1).padStart(2, "0");
  const d = String(due.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseContentTime(time: string): { hours: number; minutes: number } {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 16, minutes: 0 };
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

export interface TimelinePresetRow {
  title: string;
  starts_at: string;
  location: string;
  notes: string;
  sort_order: number;
}

/** Build day-of timeline rows from wedding-content schedule + venues. */
export function buildTimelinePresets(): TimelinePresetRow[] {
  const wedding = getWeddingDate();
  const ceremonyLoc = weddingContent.venue.sameLocation
    ? weddingContent.venue.ceremony.name
    : weddingContent.venue.ceremony.name;
  const receptionLoc = weddingContent.venue.sameLocation
    ? weddingContent.venue.ceremony.name
    : weddingContent.venue.reception.name;

  return weddingContent.schedule.items.map((item, index) => {
    const { hours, minutes } = parseContentTime(item.time);
    const starts = new Date(wedding);
    starts.setHours(hours, minutes, 0, 0);
    const lower = item.title.toLowerCase();
    const location =
      lower.includes("ceremony") || lower.includes("arrival")
        ? ceremonyLoc
        : receptionLoc;

    return {
      title: item.title,
      starts_at: starts.toISOString(),
      location,
      notes: item.description,
      sort_order: index,
    };
  });
}

export function budgetCategoryLabel(value: string): string {
  return BUDGET_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
