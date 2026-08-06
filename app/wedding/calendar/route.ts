import { weddingContent } from "@/lib/wedding-content";

export async function GET() {
  const { date, venue, couple } = weddingContent;

  const day = date.iso.replace(/-/g, "");
  const nextDay = getNextDay(day);

  // All-day until ceremony time is finalized
  const location = [venue.ceremony.name, venue.ceremony.city]
    .filter(Boolean)
    .join(", ");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ethan & Amanda//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:wedding-${day}@ethan-amanda`,
    `DTSTAMP:${day}T000000Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${nextDay}`,
    `SUMMARY:${couple.partnerOne} & ${couple.partnerTwo}'s Wedding`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(`Join us for ${couple.short}'s wedding celebration.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ethan-amanda-wedding.ics"',
    },
  });
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function getNextDay(yyyymmdd: string) {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const next = new Date(Date.UTC(y, m, d + 1));
  const yy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}
