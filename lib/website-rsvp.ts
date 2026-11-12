export const MAX_PARTY_GUESTS = 10;
export const MAX_GROUP_MATCHES = 8;

export interface WebsiteRsvpGuest {
  id: string;
  name: string;
  isPlusOne: boolean;
  attending: boolean | null;
  dietaryNotes: string;
}

export interface WebsiteRsvpSnapshot {
  partyId: string;
  partyName: string;
  source: "manual" | "website";
  email: string;
  notes: string;
  guests: WebsiteRsvpGuest[];
}

export interface WebsiteGuestInput {
  name: string;
  attending: "yes" | "no" | null;
}

export interface ValidWebsiteRsvp {
  email: string;
  partyName: string;
  notes: string;
  guests: Array<{
    name: string;
    attending: "yes" | "no";
  }>;
}

/** Household note, or the older per-person notes folded into one. */
export function householdNotes(
  saved: string | null | undefined,
  guests: Array<{ dietaryNotes: string }>,
) {
  const household = saved?.trim() ?? "";
  if (household) return household;
  return [
    ...new Set(
      guests.map((guest) => guest.dietaryNotes.trim()).filter(Boolean),
    ),
  ].join("\n");
}

function validateNotes(notes: string):
  | { ok: true; value: string }
  | { ok: false; error: string } {
  const value = notes.trim();
  if (value.length > 400) {
    return { ok: false, error: "Notes need to be 400 characters or fewer." };
  }
  return { ok: true, value };
}

export function buildPartyName(names: string[]): string {
  const label =
    names.length <= 1
      ? (names[0] ?? "")
      : names.length === 2
        ? `${names[0]} & ${names[1]}`
        : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;

  if (label.length <= 180) return label;
  return `${names[0]} & party`;
}

export function validateWebsiteRsvp(input: {
  email: string;
  notes: string;
  guests: WebsiteGuestInput[];
}):
  | { ok: true; value: ValidWebsiteRsvp }
  | { ok: false; error: string } {
  const email = input.email.trim();
  if (
    email.length > 254 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return { ok: false, error: "Enter a valid email, or leave it blank." };
  }

  if (input.guests.length < 1) {
    return { ok: false, error: "Add at least one person." };
  }

  if (input.guests.length > MAX_PARTY_GUESTS) {
    return {
      ok: false,
      error: "You can RSVP for up to 10 people at a time.",
    };
  }

  const guests: ValidWebsiteRsvp["guests"] = [];
  for (const guest of input.guests) {
    const name = guest.name.trim().replace(/\s+/g, " ");
    if (!name || !guest.attending) {
      return {
        ok: false,
        error: "Add a name and a reply for each person.",
      };
    }
    if (name.length > 80) {
      return { ok: false, error: "Names need to be 80 characters or fewer." };
    }

    guests.push({ name, attending: guest.attending });
  }

  const notes = validateNotes(input.notes);
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      email,
      notes: notes.value,
      partyName: buildPartyName(guests.map((guest) => guest.name)),
      guests,
    },
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GroupRsvpGuestInput {
  id: string | null;
  name: string;
  attending: "yes" | "no" | null;
}

export interface ValidGroupRsvp {
  partyId: string;
  email: string;
  notes: string;
  guests: Array<{
    id: string | null;
    name: string;
    attending: "yes" | "no";
  }>;
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseGroupQuery(query: string):
  | { ok: true; tokens: string[] }
  | { ok: false; error: string } {
  const normalized = normalizeSearchText(query);
  if (normalized.length < 2) {
    return { ok: false, error: "Enter at least two letters of a name." };
  }

  const tokens = normalized.split(" ").filter((token) => token.length >= 2);
  if (!tokens.length) {
    return { ok: false, error: "Enter at least two letters of a name." };
  }

  return { ok: true, tokens };
}

interface MatchableGroup {
  partyName: string;
  source: "manual" | "website";
  guests: Array<{ name: string }>;
}

export function matchGroups<T extends MatchableGroup>(
  query: string,
  parties: T[],
  limit = MAX_GROUP_MATCHES,
): { groups: T[]; truncated: boolean } {
  const parsed = parseGroupQuery(query);
  if (!parsed.ok) return { groups: [], truncated: false };

  const tokens = parsed.tokens;
  const normalizedQuery = tokens.join(" ");
  const ranked = parties
    .map((party) => ({ party, score: scoreParty(tokens, normalizedQuery, party) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.party.partyName.localeCompare(b.party.partyName);
    });

  return {
    groups: ranked.slice(0, limit).map((entry) => entry.party),
    truncated: ranked.length > limit,
  };
}

function scoreParty(
  tokens: string[],
  normalizedQuery: string,
  party: MatchableGroup,
) {
  const combined = normalizeSearchText(
    [party.partyName, ...party.guests.map((guest) => guest.name)].join(" "),
  );
  if (!tokens.every((token) => combined.includes(token))) return 0;

  let best = 0;
  for (const guest of party.guests) {
    const name = normalizeSearchText(guest.name);
    if (!name) continue;
    if (name === normalizedQuery) best = Math.max(best, 100);
    else if (name.startsWith(normalizedQuery)) best = Math.max(best, 80);
    else if (tokens.every((token) => name.includes(token))) best = Math.max(best, 60);
  }

  const partyName = normalizeSearchText(party.partyName);
  if (partyName === normalizedQuery) best = Math.max(best, 70);
  else if (partyName && tokens.every((token) => partyName.includes(token))) {
    best = Math.max(best, 40);
  }

  if (best === 0) best = 30;
  if (party.source === "manual") best += 1;
  return best;
}

export function validateGroupRsvp(input: {
  partyId: string;
  email: string;
  notes: string;
  guests: GroupRsvpGuestInput[];
}):
  | { ok: true; value: ValidGroupRsvp }
  | { ok: false; error: string } {
  const partyId = input.partyId.trim();
  if (!UUID_RE.test(partyId)) {
    return { ok: false, error: "Search for your group again." };
  }

  const email = input.email.trim();
  if (
    email.length > 254 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return { ok: false, error: "Enter a valid email, or leave it blank." };
  }

  if (input.guests.length < 1) {
    return { ok: false, error: "Add at least one person." };
  }

  if (input.guests.length > MAX_PARTY_GUESTS) {
    return {
      ok: false,
      error: "You can RSVP for up to 10 people in a group.",
    };
  }

  const seen = new Set<string>();
  const guests: ValidGroupRsvp["guests"] = [];

  for (const guest of input.guests) {
    const id = guest.id?.trim() || null;
    if (id && !UUID_RE.test(id)) {
      return { ok: false, error: "Search for your group again." };
    }
    if (id) {
      if (seen.has(id)) {
        return { ok: false, error: "Search for your group again." };
      }
      seen.add(id);
    }

    const name = guest.name.trim().replace(/\s+/g, " ");
    if (!name || !guest.attending) {
      return {
        ok: false,
        error: "Add a name and a reply for each person.",
      };
    }
    if (name.length > 80) {
      return { ok: false, error: "Names need to be 80 characters or fewer." };
    }

    guests.push({ id, name, attending: guest.attending });
  }

  const notes = validateNotes(input.notes);
  if (!notes.ok) return notes;

  return { ok: true, value: { partyId, email, notes: notes.value, guests } };
}
