export const WEDDING_RSVP_OPEN_EVENT = "wedding-rsvp-open";

/** Ask the wedding page RSVP sheet to open. No-op if that page isn't mounted. */
export function openWeddingRsvp() {
  window.dispatchEvent(new Event(WEDDING_RSVP_OPEN_EVENT));
}
