export const MAX_PARTY_GUESTS = 10;

export interface WebsiteRsvpGuest {
  name: string;
  attending: boolean | null;
  dietaryNotes: string;
}

export interface WebsiteRsvpSnapshot {
  email: string;
  guests: WebsiteRsvpGuest[];
}

export interface WebsiteGuestInput {
  name: string;
  attending: "yes" | "no" | null;
  dietaryNotes: string;
}

export interface ValidWebsiteRsvp {
  email: string;
  partyName: string;
  guests: Array<{
    name: string;
    attending: "yes" | "no";
    dietaryNotes: string;
  }>;
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

    const dietaryNotes =
      guest.attending === "yes" ? guest.dietaryNotes.trim() : "";
    if (dietaryNotes.length > 400) {
      return {
        ok: false,
        error: "Dietary notes need to be 400 characters or fewer.",
      };
    }

    guests.push({ name, attending: guest.attending, dietaryNotes });
  }

  return {
    ok: true,
    value: {
      email,
      partyName: buildPartyName(guests.map((guest) => guest.name)),
      guests,
    },
  };
}
