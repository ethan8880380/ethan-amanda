"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  listWeddingGroups,
  submitGroupRsvp,
  submitWeddingRSVP,
} from "@/app/wedding/actions";
import { markWeddingRsvpComplete } from "@/hooks/use-wedding-rsvp-session";
import { weddingContent } from "@/lib/wedding-content";
import {
  MAX_PARTY_GUESTS,
  matchGroups,
  parseGroupQuery,
  validateGroupRsvp,
  validateWebsiteRsvp,
  type WebsiteRsvpGuest,
  type WebsiteRsvpSnapshot,
} from "@/lib/website-rsvp";
import { cn } from "@/lib/utils";
import { Cta, ExternalArrowIcon } from "./cta";
import { SectionHeading } from "./section-heading";

const { rsvp, hero, registry } = weddingContent;

type Attendance = "yes" | "no";
type RsvpMode = "find" | "group" | "open";

interface GuestDraft {
  key: string;
  id: string | null;
  name: string;
  attending: Attendance | null;
  dietary: string;
  isPlusOne: boolean;
  nameLocked: boolean;
}

interface SelectedParty {
  id: string;
  name: string;
  source: "manual" | "website";
}

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; guests: GuestDraft[] };

const fieldClass =
  "w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3.5 text-[1.0625rem] text-ink placeholder:text-ink/35 transition-colors focus:border-blood focus:outline-none focus-visible:ring-0 aria-invalid:border-blood md:text-lg";

const labelClass = "block text-sm font-medium text-ink/60";

const textButtonClass =
  "min-h-11 text-left text-[0.9375rem] text-ink/60 underline decoration-ink/20 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const outlineButtonClass =
  "flex min-h-12 w-full items-center justify-center rounded-full border border-ink/20 px-3 text-[0.9375rem] font-medium text-ink/75 transition-colors hover:border-ink hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

interface WeddingRsvpProps {
  initialRsvp?: WebsiteRsvpSnapshot | null;
}

function emptyGuest(key: string): GuestDraft {
  return {
    key,
    id: null,
    name: "",
    attending: null,
    dietary: "",
    isPlusOne: false,
    nameLocked: false,
  };
}

function draftsFrom(snapshot?: WebsiteRsvpSnapshot | null): GuestDraft[] {
  if (!snapshot?.guests.length) return [emptyGuest("guest-1")];

  const lockInvited = snapshot.source === "manual";
  return snapshot.guests.map((guest) => ({
    key: guest.id,
    id: guest.id,
    name: guest.name,
    attending:
      guest.attending === true
        ? "yes"
        : guest.attending === false
          ? "no"
          : null,
    dietary: guest.dietaryNotes,
    isPlusOne: guest.isPlusOne,
    nameLocked: lockInvited && !guest.isPlusOne,
  }));
}

function formatNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function memberLabel(guest: Pick<WebsiteRsvpGuest, "name" | "isPlusOne">) {
  const name = guest.name.trim();
  if (!guest.isPlusOne) return name;
  if (/^(plus one|guest|\+1)$/i.test(name)) return "Plus one";
  return `${name} (plus one)`;
}

function firstName(name: string) {
  const trimmed = name.trim();
  if (!trimmed || /^(plus[\s-]?one|guest|\+1)\b/i.test(trimmed)) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

/** Grows a single-row textarea with its content so the underline tracks the last line. */
function fitToContent(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "auto";
  const borderHeight = element.offsetHeight - element.clientHeight;
  element.style.height = `${element.scrollHeight + borderHeight}px`;
}

function thanksCopy(guests: GuestDraft[]) {
  const coming = guests
    .filter((guest) => guest.attending === "yes")
    .map((guest) => guest.name.trim());
  const declining = guests
    .filter((guest) => guest.attending === "no")
    .map((guest) => guest.name.trim());

  if (coming.length && declining.length) {
    const seats = coming.length === 1 ? "a seat" : "seats";
    return `We'll save ${seats} for ${formatNames(coming)}. We'll miss ${formatNames(declining)}.`;
  }
  if (coming.length > 1) return `We can't wait to see all ${coming.length} of you.`;
  if (coming.length === 1) return rsvp.successYes;
  return rsvp.successNo;
}

export function WeddingRsvp({ initialRsvp = null }: WeddingRsvpProps) {
  const [mode, setMode] = useState<RsvpMode>(
    initialRsvp?.guests.length ? "group" : "find",
  );
  const [party, setParty] = useState<SelectedParty | null>(
    initialRsvp
      ? {
          id: initialRsvp.partyId,
          name: initialRsvp.partyName,
          source: initialRsvp.source,
        }
      : null,
  );
  const [guests, setGuests] = useState<GuestDraft[]>(() =>
    draftsFrom(initialRsvp),
  );
  const [email, setEmail] = useState(initialRsvp?.email ?? "");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [catalog, setCatalog] = useState<WebsiteRsvpSnapshot[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [canUpdate, setCanUpdate] = useState(
    Boolean(initialRsvp?.guests.some((guest) => guest.attending !== null)),
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();
  const nextKey = useRef(1);
  const findAnchorRef = useRef<HTMLDivElement>(null);
  const didAnchorSearch = useRef(false);

  useEffect(() => {
    if (initialRsvp?.guests.some((guest) => guest.attending !== null)) {
      markWeddingRsvpComplete();
    }
  }, [initialRsvp]);

  useEffect(() => {
    if (mode !== "find") {
      didAnchorSearch.current = false;
      return;
    }
    if (!parseGroupQuery(query).ok) {
      didAnchorSearch.current = false;
      return;
    }
    if (didAnchorSearch.current) return;

    const node = findAnchorRef.current;
    if (!node) return;

    const headerOffset = window.matchMedia("(min-width: 768px)").matches
      ? 80
      : 16;
    if (node.getBoundingClientRect().top > headerOffset + 12) {
      node.scrollIntoView({
        block: "start",
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }
    didAnchorSearch.current = true;
  }, [mode, query, shouldReduceMotion]);

  useEffect(() => {
    if (mode !== "find" || catalog || catalogError) return;
    let cancelled = false;

    void listWeddingGroups().then((result) => {
      if (cancelled) return;
      if (!result.success || !result.groups) {
        setCatalogError(result.error ?? "Couldn't load groups. Try again.");
        return;
      }
      setCatalog(result.groups);
    });

    return () => {
      cancelled = true;
    };
  }, [mode, catalog, catalogError]);

  function updateGuest(key: string, patch: Partial<GuestDraft>) {
    setGuests((current) =>
      current.map((guest) => (guest.key === key ? { ...guest, ...patch } : guest)),
    );
  }

  function addGuest(isPlusOne: boolean) {
    if (guests.length >= MAX_PARTY_GUESTS) return;
    nextKey.current += 1;
    setGuests((current) => [
      ...current,
      { ...emptyGuest(`guest-${nextKey.current}`), isPlusOne },
    ]);
  }

  function removeGuest(key: string) {
    setGuests((current) =>
      current.length === 1 ? current : current.filter((guest) => guest.key !== key),
    );
  }

  function chooseGroup(match: WebsiteRsvpSnapshot) {
    setParty({
      id: match.partyId,
      name: match.partyName,
      source: match.source,
    });
    setGuests(draftsFrom(match));
    setEmail("");
    setCanUpdate(match.guests.some((guest) => guest.attending !== null));
    setStatus({ kind: "idle" });
    setMode("group");
  }

  function backToSearch() {
    setStatus({ kind: "idle" });
    setMode("find");
  }

  function startOpenReply() {
    nextKey.current = 1;
    setParty(null);
    setGuests([emptyGuest("guest-1")]);
    setCanUpdate(false);
    setStatus({ kind: "idle" });
    setMode("open");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guestInput = guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      attending: guest.attending,
      dietaryNotes: guest.dietary,
    }));

    if (mode === "group") {
      if (!party) {
        setStatus({ kind: "error", message: "Search for your group again." });
        return;
      }
      const validated = validateGroupRsvp({
        partyId: party.id,
        email,
        guests: guestInput,
      });
      if (!validated.ok) {
        setStatus({ kind: "error", message: validated.error });
        return;
      }
    } else {
      const validated = validateWebsiteRsvp({
        email,
        guests: guestInput,
      });
      if (!validated.ok) {
        setStatus({ kind: "error", message: validated.error });
        return;
      }
    }

    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result =
        mode === "group" && party
          ? await submitGroupRsvp({
              partyId: party.id,
              email,
              guests: guestInput,
            })
          : await submitWeddingRSVP({
              email,
              guests: guestInput,
            });

      if (result.success) {
        markWeddingRsvpComplete();
        setCanUpdate(true);
        setStatus({ kind: "success", guests });
      } else {
        setStatus({
          kind: "error",
          message: result.error ?? "Something went wrong. Please try again.",
        });
      }
    });
  }

  const suggestions =
    catalog && parseGroupQuery(query).ok ? matchGroups(query, catalog) : null;
  const suggestionIndex = suggestions
    ? Math.min(activeIndex, Math.max(suggestions.groups.length - 1, 0))
    : 0;
  const listId = `${baseId}-group-list`;

  function handleQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions?.groups.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((suggestionIndex + 1) % suggestions.groups.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (suggestionIndex - 1 + suggestions.groups.length) %
          suggestions.groups.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const group = suggestions.groups[suggestionIndex];
      if (group) chooseGroup(group);
    }
  }

  const isSuccess = status.kind === "success";
  const anyoneComing =
    status.kind === "success" &&
    status.guests.some((guest) => guest.attending === "yes");

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="scroll-mt-20 bg-linen px-6 pb-32 pt-24 md:px-10 md:py-32"
    >
        <div className="mx-auto w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.div
                key="thanks"
                role="status"
                className="text-center"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeading
                  align="center"
                  id="rsvp-heading"
                  title={rsvp.thanksTitle}
                />
                <p className="mt-6 text-center text-[1.0625rem] leading-[1.7] text-ink/65">
                  {thanksCopy(status.guests)}
                </p>
                {anyoneComing && (
                  <a
                    href="/wedding/calendar"
                    className="mt-4 inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-blood underline decoration-blood/30 underline-offset-[6px] hover:decoration-blood outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  >
                    Add to calendar
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setStatus({ kind: "idle" })}
                  className={cn("mx-auto mt-4 block", textButtonClass)}
                >
                  Edit your RSVP
                </button>

                <div className="mt-12 border-t border-ink/10 pt-10">
                  <p className="text-[1.0625rem] leading-[1.7] text-ink/75 md:text-lg">
                    {rsvp.thanksRegistry}
                  </p>
                  <Cta
                    href={registry.url}
                    variant="solid"
                    className="mt-6 min-h-14"
                  >
                    {registry.cta}
                    <ExternalArrowIcon />
                  </Cta>
                </div>
              </motion.div>
            ) : mode === "find" ? (
              <motion.div
                key="find"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeading
                  align="center"
                  id="rsvp-heading"
                  title={rsvp.title}
                />
                <p className="mt-6 text-center text-[1.0625rem] leading-[1.7] text-ink/65">
                  {rsvp.intro}
                </p>
                <p className="mt-3 text-center font-wedding-serif text-[1.375rem] italic text-blood">
                  {rsvp.deadline}
                </p>

                <div ref={findAnchorRef} className="mt-12 scroll-mt-4 md:scroll-mt-20">
                  <label htmlFor={`${baseId}-group-query`} className={labelClass}>
                    Your name
                  </label>
                  <input
                    id={`${baseId}-group-query`}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={handleQueryKeyDown}
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={Boolean(suggestions?.groups.length)}
                    aria-controls={listId}
                    aria-activedescendant={
                      suggestions?.groups[suggestionIndex]
                        ? `${baseId}-group-${suggestions.groups[suggestionIndex].partyId}`
                        : undefined
                    }
                    autoComplete="off"
                    placeholder="Start typing your name"
                    className={fieldClass}
                  />

                  {catalogError && (
                    <p
                      role="alert"
                      className="mt-6 border-l-2 border-blood pl-4 text-[0.9375rem] leading-relaxed text-blood"
                    >
                      {catalogError}{" "}
                      <button
                        type="button"
                        onClick={() => setCatalogError(null)}
                        className="underline underline-offset-4"
                      >
                        Try again
                      </button>
                    </p>
                  )}

                  {suggestions && (
                    <div className="mt-6" aria-live="polite">
                      {suggestions.groups.length === 0 ? (
                        <p className="text-[1.0625rem] leading-[1.7] text-ink/75">
                          No group matched that name. Try the full name on your
                          invitation.
                        </p>
                      ) : (
                        <ul
                          id={listId}
                          role="listbox"
                          aria-label="Matching groups"
                          className="max-h-[min(28rem,calc(100svh-13rem))] divide-y divide-ink/[0.07] overflow-y-auto rounded-[1.25rem] bg-paper shadow-[0_12px_32px_-12px_rgb(24_20_21/0.15)] md:max-h-[min(32rem,calc(100svh-12rem))]"
                        >
                          {suggestions.groups.map((group, index) => (
                            <li key={group.partyId}>
                              <button
                                id={`${baseId}-group-${group.partyId}`}
                                type="button"
                                role="option"
                                aria-selected={index === suggestionIndex}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => chooseGroup(group)}
                                className={cn(
                                  "w-full px-6 py-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                                  index === suggestionIndex && "bg-linen/60",
                                )}
                              >
                                <span className="block font-wedding-serif text-[2rem] leading-tight text-ink">
                                  {group.partyName}
                                </span>
                                <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink/70">
                                  {formatNames(group.guests.map(memberLabel))}
                                </span>
                                {group.guests.some(
                                  (guest) => guest.attending !== null,
                                ) && (
                                  <span className="mt-2 block font-wedding-serif text-base italic text-ink/50">
                                    Reply on file
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {suggestions.truncated && (
                        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/60">
                          Showing the closest matches. Add a last name if yours
                          isn't here.
                        </p>
                      )}
                    </div>
                  )}

                  {parseGroupQuery(query).ok && !catalog && !catalogError && (
                    <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink/60">
                      Looking up groups…
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={startOpenReply}
                  className={cn("mt-6 block", textButtonClass)}
                >
                  Can't find your group?
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeading
                  align="center"
                  id="rsvp-heading"
                  title={rsvp.title}
                />
                <p className="mt-6 text-center text-[1.0625rem] leading-[1.7] text-ink/65">
                  {mode === "group" ? rsvp.groupIntro : rsvp.openIntro}
                </p>
                <p className="mt-3 text-center font-wedding-serif text-[1.375rem] italic text-blood">
                  {rsvp.deadline}
                </p>
                {mode === "group" && party && (
                  <div className="mt-8">
                    <p className="font-wedding-serif text-[2rem] leading-tight text-ink">
                      {party.name}
                    </p>
                    <button
                      type="button"
                      onClick={backToSearch}
                      className={cn("mt-2 block", textButtonClass)}
                    >
                      Not your group?
                    </button>
                  </div>
                )}
                {canUpdate && (
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/60">
                    {mode === "group"
                      ? "We already have a reply for this group. Sending again updates it."
                      : "We already have a reply from this browser. Sending again updates it."}
                  </p>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-12 space-y-10"
                  aria-busy={isPending}
                >
                  <div className="space-y-8">
                    {guests.map((guest, index) => {
                      const nameId = `${baseId}-${guest.key}-name`;
                      const given = firstName(guest.name);
                      const attendPrompt =
                        mode === "open"
                          ? index === 0
                            ? "Will you attend?"
                            : "Will they attend?"
                          : given
                            ? `Will ${given} attend?`
                            : "Will they attend?";

                      return (
                        <div
                          key={guest.key}
                          className={cn(
                            "min-w-0 space-y-6",
                            index > 0 && "border-t border-ink/10 pt-8",
                          )}
                        >
                          <div className="flex items-baseline justify-between gap-4">
                            {guest.nameLocked ? (
                              <p className={labelClass}>
                                {guests.length > 1 ? `Person ${index + 1}` : "Name"}
                              </p>
                            ) : (
                              <label htmlFor={nameId} className={labelClass}>
                                {guest.isPlusOne
                                  ? "Plus one"
                                  : guests.length > 1
                                    ? `Person ${index + 1}`
                                    : "Name"}
                              </label>
                            )}
                            {!guest.id && guests.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeGuest(guest.key)}
                                className="text-sm text-ink/45 transition-colors hover:text-blood outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          {guest.nameLocked ? (
                            <p className="font-wedding-serif text-[2rem] leading-tight text-ink">
                              {guest.name}
                            </p>
                          ) : (
                            <input
                              id={nameId}
                              value={guest.name}
                              onChange={(event) =>
                                updateGuest(guest.key, {
                                  name: event.target.value,
                                })
                              }
                              type="text"
                              autoComplete={index === 0 ? "name" : "off"}
                              placeholder={
                                guest.isPlusOne
                                  ? "Their name"
                                  : index === 0
                                    ? "Your name"
                                    : "Their name"
                              }
                              className={fieldClass}
                            />
                          )}

                          <div className="space-y-3">
                            <p
                              className={labelClass}
                              id={`${baseId}-${guest.key}-attend`}
                            >
                              {attendPrompt}
                            </p>
                            <div
                              role="radiogroup"
                              aria-labelledby={`${baseId}-${guest.key}-attend`}
                              className="grid grid-cols-2 gap-3"
                            >
                              <AttendanceOption
                                id={`${baseId}-${guest.key}-yes`}
                                name={`attending-${guest.key}`}
                                label="Joyfully accept"
                                checked={guest.attending === "yes"}
                                onChange={() =>
                                  updateGuest(guest.key, { attending: "yes" })
                                }
                              />
                              <AttendanceOption
                                id={`${baseId}-${guest.key}-no`}
                                name={`attending-${guest.key}`}
                                label="Regretfully decline"
                                checked={guest.attending === "no"}
                                onChange={() =>
                                  updateGuest(guest.key, { attending: "no" })
                                }
                              />
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {guest.attending === "yes" && (
                              <motion.div
                                key="dietary"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.4,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-2">
                                  <label
                                    htmlFor={`${baseId}-${guest.key}-dietary`}
                                    className={labelClass}
                                  >
                                    Notes{" "}
                                    <span className="text-ink/40">
                                      (optional)
                                    </span>
                                  </label>
                                  <textarea
                                    id={`${baseId}-${guest.key}-dietary`}
                                    ref={fitToContent}
                                    value={guest.dietary}
                                    onChange={(event) => {
                                      fitToContent(event.currentTarget);
                                      updateGuest(guest.key, {
                                        dietary: event.target.value,
                                      });
                                    }}
                                    rows={1}
                                    placeholder="Allergies, dietary needs, light sensitivity..."
                                    className={cn(fieldClass, "block resize-none overflow-hidden")}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {mode === "open" && guests.length < MAX_PARTY_GUESTS && (
                    <button
                      type="button"
                      onClick={() => addGuest(false)}
                      className={outlineButtonClass}
                    >
                      Add another person
                    </button>
                  )}

                  {mode === "open" && (
                    <button
                      type="button"
                      onClick={backToSearch}
                      className={cn("block", textButtonClass)}
                    >
                      Search for your group
                    </button>
                  )}

                  <div className="space-y-2">
                    <label htmlFor={`${baseId}-email`} className={labelClass}>
                      Email <span className="text-ink/40">(optional)</span>
                    </label>
                    <input
                      id={`${baseId}-email`}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="So we can reach your party"
                      className={fieldClass}
                    />
                  </div>

                  {status.kind === "error" && (
                    <p
                      role="alert"
                      className="border-l-2 border-blood pl-4 text-[0.9375rem] leading-relaxed text-blood"
                    >
                      {status.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-14 w-full items-center justify-center rounded-full bg-blood text-base font-medium tracking-[0.01em] text-paper transition-colors hover:bg-blood-deep disabled:cursor-wait disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  >
                    {isPending
                      ? "Sending…"
                      : canUpdate
                        ? "Update RSVP"
                        : `Send ${hero.cta}`}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </section>
  );
}

interface AttendanceOptionProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function AttendanceOption({
  id,
  name,
  label,
  checked,
  onChange,
}: AttendanceOptionProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type="radio"
        name={name}
        value={label}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-14 cursor-pointer items-center justify-center rounded-full border px-3 text-center font-wedding-serif text-lg italic leading-tight transition-colors duration-300 md:text-xl",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-blood peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper",
          checked
            ? "border-ink bg-ink text-paper"
            : "border-ink/15 bg-paper text-ink/75 hover:border-ink/50",
        )}
      >
        {label}
      </label>
    </div>
  );
}
