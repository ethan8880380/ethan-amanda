"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "wedding-rsvp-complete";
const EVENT_NAME = "wedding-rsvp-complete";

export function markWeddingRsvpComplete() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(EVENT_NAME));
}

const WeddingRsvpCookieContext = createContext(false);

/** Server-read `wedding_rsvp` cookie. */
export function WeddingRsvpCookieProvider({
  hasRsvp,
  children,
}: {
  hasRsvp: boolean;
  children: ReactNode;
}) {
  return createElement(
    WeddingRsvpCookieContext.Provider,
    { value: hasRsvp },
    children,
  );
}

export function useWeddingRsvpCookie() {
  return useContext(WeddingRsvpCookieContext);
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
