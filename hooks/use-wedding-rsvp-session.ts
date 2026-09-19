"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wedding-rsvp-complete";
const EVENT_NAME = "wedding-rsvp-complete";

export function markWeddingRsvpComplete() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useHasWeddingRsvp() {
  const [hasRsvp, setHasRsvp] = useState(false);

  useEffect(() => {
    const sync = () =>
      setHasRsvp(window.sessionStorage.getItem(STORAGE_KEY) === "1");

    sync();
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, []);

  return hasRsvp;
}
