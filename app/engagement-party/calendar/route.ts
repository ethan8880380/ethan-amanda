export async function GET() {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ethan & Amanda//Engagement Party//EN",
    "BEGIN:VEVENT",
    "DTSTART:20260315T200000Z",
    "DTEND:20260316T000000Z",
    "SUMMARY:Ethan & Amanda's Engagement Party",
    "LOCATION:Local 104\\, 18498 Ballinger Way NE\\, Lake Forest Park\\, WA 98155",
    "DESCRIPTION:Join us as we celebrate our engagement!",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="engagement-party.ics"',
    },
  });
}
