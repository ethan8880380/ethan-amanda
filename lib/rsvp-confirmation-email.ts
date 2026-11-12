import { weddingContent } from "./wedding-content";

const INK = "#181415";
const PAPER = "#ffffff";
const LINEN = "#f4f4f4";
const BLOOD = "#8f0e1f";
const MUTED = "#6d696b";
const SERIF = "'Geist Serif', 'Iowan Old Style', Georgia, serif";
const SANS = "'Geist Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const FONT_CSS = `
@font-face { font-family: 'Geist Sans'; font-style: normal; font-weight: 400; src: url('https://cdn.jsdelivr.net/npm/geist@1.9.2/dist/fonts/geist-sans/Geist-Regular.woff2') format('woff2'); }
@font-face { font-family: 'Geist Sans'; font-style: normal; font-weight: 500; src: url('https://cdn.jsdelivr.net/npm/geist@1.9.2/dist/fonts/geist-sans/Geist-Medium.woff2') format('woff2'); }
@font-face { font-family: 'Geist Serif'; font-style: normal; font-weight: 400; src: url('https://cdn.jsdelivr.net/npm/geist@1.9.2/dist/fonts/geist-serif/GeistSerif-Regular.woff2') format('woff2'); }
`.trim();

export interface RsvpConfirmationGuest {
  name: string;
  attending: "yes" | "no";
  isPlusOne?: boolean;
}

export interface RsvpConfirmationEmail {
  partyName: string;
  notes: string;
  guests: RsvpConfirmationGuest[];
  siteUrl: string;
}

export function rsvpConfirmationSubject() {
  return `Your RSVP is confirmed — ${weddingContent.couple.short}`;
}

export function renderRsvpConfirmationEmail(value: RsvpConfirmationEmail) {
  const { couple, date, venue, schedule } = weddingContent;
  const coming = value.guests.some((guest) => guest.attending === "yes");
  const lead = coming
    ? "We have your reply, and we can\u2019t wait to celebrate with you."
    : "We have your reply. We\u2019ll miss you, and we\u2019re glad you let us know.";
  const editUrl = `${value.siteUrl.replace(/\/$/, "")}/wedding#rsvp`;
  const ceremonyTime =
    schedule.items.find((item) => item.title === "Ceremony")?.time ?? "1:00 PM";
  const receptionTime =
    schedule.items.find((item) => item.title === "Cocktail hour")?.time ?? "3:00 PM";

  const guestRows = value.guests
    .map((guest, index) => {
      const plusOne = guest.isPlusOne
        ? `<div style="margin-top:3px;font-family:${SANS};font-size:12px;font-weight:400;line-height:1.3;color:${MUTED};">Plus one</div>`
        : "";
      const answer =
        guest.attending === "yes"
          ? `<span style="display:inline-block;border-radius:999px;background:${INK};color:${PAPER};font-family:${SANS};font-size:12px;font-weight:500;line-height:1;padding:6px 11px;">Yes</span>`
          : `<span style="display:inline-block;border-radius:999px;border:1px solid #d5d3d4;color:${MUTED};font-family:${SANS};font-size:12px;font-weight:500;line-height:1;padding:5px 11px;">No</span>`;
      const rule = index > 0 ? `border-top:1px solid #e4e2e3;` : "";
      return `
        <tr>
          <td valign="middle" style="${rule}padding:12px 12px 12px 0;font-family:${SANS};font-size:16px;font-weight:400;line-height:1.3;color:${INK};">${escapeHtml(guest.name)}${plusOne}</td>
          <td valign="middle" align="right" style="${rule}padding:12px 0;white-space:nowrap;">${answer}</td>
        </tr>`;
    })
    .join("");

  const notes = value.notes.trim()
    ? `
      <tr>
        <td colspan="2" style="padding:14px 0 2px;border-top:1px solid #e4e2e3;">
          <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">Notes</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;font-weight:400;line-height:1.5;color:${INK};">${escapeHtml(value.notes.trim())}</p>
        </td>
      </tr>`
    : "";

  const place = (label: string, time: string, name: string, city: string) => `
    <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)} · ${escapeHtml(time)}</p>
    <p style="margin:6px 0 0;font-family:${SANS};font-size:15px;font-weight:400;line-height:1.45;color:${INK};">${escapeHtml(name)}<br /><span style="color:${MUTED};">${escapeHtml(city)}</span></p>`;

  const where = coming
    ? `
      <tr>
        <td style="padding:26px 4px 0;">
          ${place("Ceremony", ceremonyTime, venue.ceremony.name, venue.ceremony.city)}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 4px 0;">
          ${place("Reception", receptionTime, venue.reception.name, venue.reception.city)}
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(rsvpConfirmationSubject())}</title>
  <style>${FONT_CSS}</style>
</head>
<body style="margin:0;padding:0;background:${LINEN};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(lead)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LINEN};">
    <tr>
      <td align="center" style="padding:28px 16px;font-family:${SANS};font-weight:400;color:${INK};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${PAPER};border-radius:28px;">
          <tr>
            <td style="padding:40px 36px 32px;font-family:${SANS};font-weight:400;color:${INK};">
              <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:${MUTED};">${escapeHtml(date.display)}</p>
              <p style="margin:16px 0 0;font-family:${SERIF};font-weight:400;font-size:48px;line-height:0.94;letter-spacing:-0.025em;color:${INK};">
                ${escapeHtml(couple.partnerOne)}<br />
                <span style="font-style:italic;color:${BLOOD};">&amp;</span> ${escapeHtml(couple.partnerTwo)}
              </p>
              <p style="margin:20px 0 0;font-family:${SANS};font-size:16px;font-weight:400;line-height:1.55;color:${MUTED};">${escapeHtml(lead)}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;background:${LINEN};border-radius:20px;">
                <tr>
                  <td style="padding:18px 20px 8px;">
                    <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">${escapeHtml(value.partyName)}</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
                      ${guestRows}
                      ${notes}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${where}
                <tr>
                  <td align="center" style="padding:28px 0 0;">
                    <a href="${escapeHtml(editUrl)}" style="display:inline-block;border-radius:999px;background:${BLOOD};color:${PAPER};font-family:${SANS};font-size:15px;font-weight:500;line-height:1;text-decoration:none;padding:14px 26px;">Edit your RSVP</a>
                  </td>
                </tr>
              </table>

              <p style="margin:26px 0 0;font-family:${SERIF};font-size:16px;font-weight:400;line-height:1.45;text-align:center;color:${MUTED};">With love,<br />${escapeHtml(couple.short)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
