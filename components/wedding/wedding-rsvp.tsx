"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  listWeddingGroups,
  submitGroupRsvp,
  submitWeddingRSVP,
} from "@/app/wedding/actions";
import { markWeddingRsvpComplete } from "@/hooks/use-wedding-rsvp-session";
import { comingLine, weddingContent } from "@/lib/wedding-content";
import { RegistryRsvpGate } from "./registry-rsvp-gate";
import {
  MAX_PARTY_GUESTS,
  matchGroups,
  parseGroupQuery,
  validateGroupRsvp,
  validateWebsiteRsvp,
  type WebsiteRsvpGuest,
  type WebsiteRsvpSnapshot,
} from "@/lib/website-rsvp";
import { weddingFontVariables } from "@/lib/wedding-fonts";
import { cn } from "@/lib/utils";
import { WEDDING_RSVP_OPEN_EVENT } from "./open-wedding-rsvp";
import { Cta, ExternalArrowIcon } from "./cta";
import { SectionHeading } from "./section-heading";

const { rsvp, hero, registry } = weddingContent;

type Attendance = "yes" | "no";
type RsvpMode = "find" | "group" | "open";
type SheetStep = "find" | "form" | "thanks";

const STEP_ORDER: Record<SheetStep, number> = { find: 0, form: 1, thanks: 2 };

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stepVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: "spring", stiffness: 380, damping: 36 },
      opacity: { duration: 0.24, ease: EASE_OUT },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -28,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  }),
};

const sheetHeightTransition: Transition = { duration: 0.42, ease: EASE_OUT };

interface GuestDraft {
  key: string;
  id: string | null;
  name: string;
  attending: Attendance | null;
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
  "w-full border-0 border-b border-ink/20 bg-transparent px-0 py-2 text-base text-ink placeholder:text-ink/35 transition-colors focus:border-blood focus:outline-none focus-visible:ring-0 aria-invalid:border-blood";

const labelClass = "block text-xs font-medium tracking-wide text-ink/50";

const textButtonClass =
  "text-left text-sm text-ink/55 underline decoration-ink/20 underline-offset-4 transition-colors md:hover:text-ink md:hover:decoration-ink outline-none focus-visible:ring-2 focus-visible:ring-blood";

const outlineButtonClass =
  "text-sm text-ink/55 underline decoration-ink/20 underline-offset-4 transition-colors md:hover:text-ink md:hover:decoration-ink outline-none focus-visible:ring-2 focus-visible:ring-blood";

interface WeddingRsvpProps {
  initialRsvp?: WebsiteRsvpSnapshot | null;
}

function emptyGuest(key: string): GuestDraft {
  return {
    key,
    id: null,
    name: "",
    attending: null,
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
  if (coming.length) return comingLine(coming.length);
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
  const [notes, setNotes] = useState(initialRsvp?.notes ?? "");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [catalog, setCatalog] = useState<WebsiteRsvpSnapshot[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [canUpdate, setCanUpdate] = useState(
    Boolean(initialRsvp?.guests.some((guest) => guest.attending !== null)),
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettledClosed, setIsSettledClosed] = useState(true);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [sheetHeight, setSheetHeight] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();
  const nextKey = useRef(1);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const didPushHash = useRef(false);
  const focusSearchRef = useRef(true);
  const pendingSearchFocus = useRef(false);

  useLayoutEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const steps = stepsRef.current;
    if (!header || !steps) return;
    const measure = () =>
      setSheetHeight(header.offsetHeight + steps.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(steps);
    return () => observer.disconnect();
  }, [portalTarget]);

  useLayoutEffect(() => {
    if (!isOpen || !pendingSearchFocus.current) return;
    pendingSearchFocus.current = false;
    queryRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (initialRsvp?.guests.some((guest) => guest.attending !== null)) {
      markWeddingRsvpComplete();
    }
  }, [initialRsvp]);

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
    setEmail(match.email);
    setNotes(match.notes);
    setCanUpdate(match.guests.some((guest) => guest.attending !== null));
    setStatus({ kind: "idle" });
    setMode("group");
    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });
  }

  function backToSearch() {
    setStatus({ kind: "idle" });
    setMode("find");
    window.requestAnimationFrame(() => {
      queryRef.current?.focus({ preventScroll: true });
    });
  }

  function startOpenReply() {
    nextKey.current = 1;
    if (party) {
      setEmail("");
      setNotes("");
    }
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
    }));

    if (mode === "group") {
      if (!party) {
        setStatus({ kind: "error", message: "Search for your group again." });
        return;
      }
      const validated = validateGroupRsvp({
        partyId: party.id,
        email,
        notes,
        guests: guestInput,
      });
      if (!validated.ok) {
        setStatus({ kind: "error", message: validated.error });
        return;
      }
    } else {
      const validated = validateWebsiteRsvp({
        email,
        notes,
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
              notes,
              guests: guestInput,
            })
          : await submitWeddingRSVP({
              email,
              notes,
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
      setIsKeyboardNav(true);
      setActiveIndex((suggestionIndex + 1) % suggestions.groups.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsKeyboardNav(true);
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
  const showSearch = mode === "find" && !isSuccess;
  const step: SheetStep = isSuccess ? "thanks" : mode === "find" ? "find" : "form";
  const [stepMotion, setStepMotion] = useState({ step, direction: 1 });
  if (stepMotion.step !== step) {
    setStepMotion({
      step,
      direction: STEP_ORDER[step] > STEP_ORDER[stepMotion.step] ? 1 : -1,
    });
  }
  const stepDirection = shouldReduceMotion ? 0 : stepMotion.direction;
  const anyoneComing =
    status.kind === "success" &&
    status.guests.some((guest) => guest.attending === "yes");
  focusSearchRef.current = showSearch;

  const openSheet = useCallback((options?: { focusSearch?: boolean }) => {
    const sheet = sheetRef.current;
    if (options?.focusSearch && sheet) {
      sheet.style.visibility = "visible";
      sheet.removeAttribute("inert");
      sheet.removeAttribute("aria-hidden");
    }
    setIsSettledClosed(false);
    setIsOpen(true);
    if (window.location.hash !== "#rsvp") {
      didPushHash.current = true;
      window.history.pushState({ weddingRsvp: true }, "", "#rsvp");
    }
    if (options?.focusSearch) {
      pendingSearchFocus.current = true;
      queryRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const closeSheet = useCallback(() => {
    setIsOpen(false);
    if (window.location.hash !== "#rsvp") return;
    if (didPushHash.current) {
      didPushHash.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  useEffect(() => {
    if (!portalTarget) return;

    function syncToLocation() {
      if (window.location.hash === "#rsvp") openSheet();
      else setIsOpen(false);
    }

    if (window.location.hash === "#rsvp") openSheet();

    function onOpenEvent() {
      openSheet({ focusSearch: focusSearchRef.current });
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor?.href) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;
      if (url.hash !== "#rsvp") return;
      event.preventDefault();
      openSheet({ focusSearch: focusSearchRef.current });
    }

    window.addEventListener("popstate", syncToLocation);
    window.addEventListener("hashchange", syncToLocation);
    window.addEventListener(WEDDING_RSVP_OPEN_EVENT, onOpenEvent);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", syncToLocation);
      window.removeEventListener("hashchange", syncToLocation);
      window.removeEventListener(WEDDING_RSVP_OPEN_EVENT, onOpenEvent);
      document.removeEventListener("click", onClick);
    };
  }, [openSheet, portalTarget]);

  useEffect(() => {
    if (!isOpen) return;
    const nodes = [
      ...document.querySelectorAll<HTMLElement>(".wedding-root > *"),
    ];
    nodes.forEach((node) => node.setAttribute("inert", ""));
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      nodes.forEach((node) => node.removeAttribute("inert"));
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      const active = document.activeElement;
      if (active instanceof Node && sheetRef.current?.contains(active)) {
        launcherRef.current?.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusable = [
        ...sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!(active instanceof Node) || !sheet.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeSheet]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.scrollTo({ top: 0 });
  }, [isOpen, mode, isSuccess, query]);

  const sheetTitleId = `${baseId}-sheet-title`;
  const sheetDescriptionId = `${baseId}-sheet-description`;
  const launcherLabel = isSuccess
    ? "View your reply"
    : canUpdate
      ? "Edit your RSVP"
      : "Continue your RSVP";
  const hasReply = (canUpdate || isSuccess) && !showSearch;
  const comingCount = guests.filter((guest) => guest.attending === "yes").length;
  const repliedYes = comingCount > 0;

  const sheet = (
    <motion.div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={sheetTitleId}
      aria-describedby={sheetDescriptionId}
      aria-hidden={!isOpen}
      inert={!isOpen}
      initial={false}
      style={{
        visibility: isOpen || !isSettledClosed ? "visible" : "hidden",
      }}
      className={cn(
        weddingFontVariables,
        "fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 font-wedding-sans text-ink antialiased outline-none sm:items-center sm:p-8",
        !isOpen && "pointer-events-none",
      )}
    >
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: isOpen ? 0.32 : 0.24, ease: EASE_OUT }
        }
        onAnimationComplete={() => {
          if (!isOpen) setIsSettledClosed(true);
        }}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={closeSheet}
      />
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen || shouldReduceMotion ? 1 : 0.96,
          y: isOpen || shouldReduceMotion ? 0 : 12,
          height: sheetHeight ?? "auto",
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : isOpen
              ? {
                  opacity: { duration: 0.24, ease: EASE_OUT },
                  scale: { type: "spring", stiffness: 340, damping: 30 },
                  y: { type: "spring", stiffness: 340, damping: 30 },
                  height: sheetHeightTransition,
                }
              : {
                  duration: 0.18,
                  ease: [0.4, 0, 1, 1],
                  height: sheetHeightTransition,
                }
        }
        onAnimationStart={() => setIsResizing(true)}
        onAnimationComplete={() => setIsResizing(false)}
        className="relative flex max-h-[min(32rem,calc(100dvh-1.5rem))] w-full max-w-md origin-top flex-col overflow-hidden rounded-[1.75rem] bg-paper/90 shadow-[0_24px_70px_-28px_rgb(24_20_21/0.7)] ring-1 ring-ink/10 backdrop-blur-xl will-change-transform sm:origin-center"
      >
      <h2 id={sheetTitleId} className="sr-only">
        {isSuccess
          ? rsvp.thanksReady
          : showSearch
            ? "Find your group"
            : party?.name || "Your reply"}
      </h2>
      <p id={sheetDescriptionId} className="sr-only">
        {rsvp.intro}
      </p>

      <div ref={headerRef} className="shrink-0 pt-[env(safe-area-inset-top)]">
        {showSearch ? (
          <motion.div
            key="search-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: EASE_OUT }}
            className="flex items-center gap-2 p-3"
          >
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink/40" />
              <label htmlFor={`${baseId}-group-query`} className="sr-only">
                Your name
              </label>
              <input
                ref={queryRef}
                id={`${baseId}-group-query`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                  setIsKeyboardNav(false);
                }}
                onKeyDown={handleQueryKeyDown}
                type="search"
                role="combobox"
                enterKeyHint="search"
                aria-autocomplete="list"
                aria-expanded={Boolean(suggestions?.groups.length)}
                aria-controls={listId}
                aria-activedescendant={
                  suggestions?.groups[suggestionIndex]
                    ? `${baseId}-group-${suggestions.groups[suggestionIndex].partyId}`
                    : undefined
                }
                autoComplete="off"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Your name"
                className="h-9 w-full rounded-full bg-linen pr-9 pl-9 text-base text-ink outline-none placeholder:text-ink/35 focus-visible:ring-2 focus-visible:ring-blood [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear name"
                  onPointerDown={keepFieldFocus}
                  onClick={() => {
                    setQuery("");
                    setActiveIndex(0);
                    queryRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 outline-none md:hover:text-ink focus-visible:ring-2 focus-visible:ring-blood"
                >
                  <CloseIcon />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onPointerDown={keepFieldFocus}
              onClick={closeSheet}
              className="shrink-0 px-1 text-[0.9375rem] font-medium text-blood outline-none focus-visible:ring-2 focus-visible:ring-blood"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: EASE_OUT }}
            className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center px-5 pt-5"
          >
            {isSuccess ? (
              <span />
            ) : (
              <button
                type="button"
                onPointerDown={keepFieldFocus}
                onClick={backToSearch}
                className="flex items-center gap-0.5 justify-self-start text-[0.9375rem] font-medium text-blood outline-none focus-visible:ring-2 focus-visible:ring-blood"
              >
                <ChevronLeftIcon />
                Back
              </button>
            )}
            <p className="truncate text-center text-sm font-medium text-ink">
              {isSuccess ? rsvp.thanksReady : party?.name || "Your reply"}
            </p>
            <button
              type="button"
              aria-label={isSuccess ? "Close" : undefined}
              onPointerDown={keepFieldFocus}
              onClick={closeSheet}
              className={cn(
                "justify-self-end font-medium text-blood outline-none focus-visible:ring-2 focus-visible:ring-blood",
                isSuccess
                  ? "flex size-9 items-center justify-center rounded-full"
                  : "text-[0.9375rem]",
              )}
            >
              {isSuccess ? <CloseIcon /> : "Cancel"}
            </button>
          </motion.div>
        )}
      </div>

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "min-h-0 flex-1 overscroll-contain outline-none",
          isResizing ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        <div ref={stepsRef} className="relative">
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={stepDirection}
        >
          {isSuccess ? (
            <motion.div
              key="thanks"
              role="status"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col px-5 pt-8 pb-5 text-center"
            >
              <SectionHeading align="center" title={rsvp.thanksTitle} />
              <p className="mt-3 text-center text-sm leading-relaxed text-ink/65">
                {thanksCopy(status.guests)}
              </p>
              {email.trim() ? (
                <p className="mt-2 text-center text-sm leading-relaxed text-ink/55">
                  A confirmation is on its way to your email.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setStatus({ kind: "idle" })}
                className={cn("mx-auto mt-4 block", textButtonClass)}
              >
                Edit your RSVP
              </button>
              <div className="mt-6 flex items-stretch gap-2">
                  {anyoneComing ? (
                    <Cta
                      href="/wedding/calendar"
                      variant="outline"
                      className="h-auto min-h-10 flex-1 px-3 text-sm leading-tight"
                    >
                      Add to calendar
                    </Cta>
                  ) : null}
                  <RegistryRsvpGate>
                    <Cta
                      href={registry.url}
                      variant="solid"
                      className={cn(
                        "h-auto min-h-10 text-sm leading-tight",
                        anyoneComing ? "flex-1 px-3" : "w-full",
                      )}
                    >
                      Registry
                      <ExternalArrowIcon />
                    </Cta>
                  </RegistryRsvpGate>
                </div>
            </motion.div>
          ) : mode === "find" ? (
            <motion.div
              key="find"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col"
            >
              <SearchResults
                baseId={baseId}
                listId={listId}
                query={query}
                catalog={catalog}
                catalogError={catalogError}
                suggestions={suggestions}
                suggestionIndex={suggestionIndex}
                isKeyboardNav={isKeyboardNav}
                onRetry={() => setCatalogError(null)}
                onActiveIndex={(index) => {
                  setIsKeyboardNav(false);
                  setActiveIndex(index);
                }}
                onChoose={chooseGroup}
                onOpenReply={startOpenReply}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="px-5 pt-6 pb-5"
            >
              {canUpdate ? (
                <p className="mb-5 text-sm leading-relaxed text-ink/55">
                  Sending again updates the reply on file.
                </p>
              ) : null}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
                aria-busy={isPending}
              >
                <ul className="divide-y divide-ink/10">
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
                    const nameLabel = guest.isPlusOne
                      ? "Plus one"
                      : guests.length > 1
                        ? `Person ${index + 1}`
                        : "Name";

                    return (
                      <li key={guest.key} className="flex items-center gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0 flex-1">
                          {guest.nameLocked ? (
                            <p className="truncate font-wedding-serif text-base text-ink">
                              {guest.name}
                            </p>
                          ) : (
                            <>
                              <label htmlFor={nameId} className="sr-only">
                                {nameLabel}
                              </label>
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
                                  guest.isPlusOne ? "Plus one" : "Name"
                                }
                                className={fieldClass}
                              />
                            </>
                          )}
                          {!guest.id && guests.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeGuest(guest.key)}
                              className="mt-1 text-xs text-ink/45 outline-none md:hover:text-blood focus-visible:ring-2 focus-visible:ring-blood"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <div
                          role="radiogroup"
                          aria-label={attendPrompt}
                          className="flex shrink-0 gap-1.5"
                        >
                          <AttendanceOption
                            id={`${baseId}-${guest.key}-yes`}
                            name={`attending-${guest.key}`}
                            label="Yes"
                            checked={guest.attending === "yes"}
                            onChange={() =>
                              updateGuest(guest.key, { attending: "yes" })
                            }
                          />
                          <AttendanceOption
                            id={`${baseId}-${guest.key}-no`}
                            name={`attending-${guest.key}`}
                            label="No"
                            checked={guest.attending === "no"}
                            onChange={() =>
                              updateGuest(guest.key, { attending: "no" })
                            }
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {mode === "open" && guests.length < MAX_PARTY_GUESTS ? (
                  <button
                    type="button"
                    onClick={() => addGuest(false)}
                    className={outlineButtonClass}
                  >
                    Add another person
                  </button>
                ) : null}

                <div className="space-y-1.5">
                  <label htmlFor={`${baseId}-notes`} className={labelClass}>
                    Notes <span className="text-ink/35">(optional)</span>
                  </label>
                  <textarea
                    id={`${baseId}-notes`}
                    ref={fitToContent}
                    value={notes}
                    onChange={(event) => {
                      fitToContent(event.currentTarget);
                      setNotes(event.target.value);
                    }}
                    rows={1}
                    placeholder="Allergies or anything we should know for your group"
                    className={cn(fieldClass, "block resize-none overflow-hidden")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${baseId}-email`} className={labelClass}>
                    Email <span className="text-ink/35">(optional)</span>
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

                {status.kind === "error" ? (
                  <p
                    role="alert"
                    className="border-l-2 border-blood pl-3 text-sm leading-relaxed text-blood"
                  >
                    {status.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex h-10 w-full items-center justify-center rounded-full bg-blood text-sm font-medium text-paper transition-colors md:hover:bg-blood-deep disabled:cursor-wait disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <section
        id="rsvp"
        aria-labelledby="rsvp-heading"
        className="scroll-mt-20 bg-linen px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <SectionHeading
            align="center"
            id="rsvp-heading"
            title={
              hasReply
                ? repliedYes
                  ? comingLine(comingCount)
                  : rsvp.repliedNoTitle
                : rsvp.title
            }
          />
          {hasReply ? null : (
            <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-ink/65">
              {rsvp.intro} {rsvp.deadline}
            </p>
          )}
          <button
            ref={launcherRef}
            type="button"
            onClick={() => openSheet({ focusSearch: showSearch })}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-8 text-[0.9375rem] font-medium text-paper transition-colors outline-none md:hover:bg-blood focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
          >
            {showSearch ? hero.cta : launcherLabel}
          </button>
        </div>
      </section>
      {portalTarget ? createPortal(sheet, portalTarget) : null}
    </>
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
          "flex h-8 cursor-pointer items-center justify-center rounded-full border px-3 text-sm leading-none transition-colors duration-200",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-blood peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper",
          checked
            ? "border-ink bg-ink text-paper"
            : "border-ink/15 bg-paper text-ink/75 md:hover:border-ink/50",
        )}
      >
        {label}
      </label>
    </div>
  );
}

function keepFieldFocus(event: PointerEvent<HTMLButtonElement>) {
  event.preventDefault();
}

interface SearchResultsProps {
  baseId: string;
  listId: string;
  query: string;
  catalog: WebsiteRsvpSnapshot[] | null;
  catalogError: string | null;
  suggestions: { groups: WebsiteRsvpSnapshot[]; truncated: boolean } | null;
  suggestionIndex: number;
  isKeyboardNav: boolean;
  onRetry: () => void;
  onActiveIndex: (index: number) => void;
  onChoose: (group: WebsiteRsvpSnapshot) => void;
  onOpenReply: () => void;
}

function SearchResults({
  baseId,
  listId,
  query,
  catalog,
  catalogError,
  suggestions,
  suggestionIndex,
  isKeyboardNav,
  onRetry,
  onActiveIndex,
  onChoose,
  onOpenReply,
}: SearchResultsProps) {
  const { rsvp } = weddingContent;
  const hasQuery = query.trim().length > 0;
  const queryReady = parseGroupQuery(query).ok;

  if (!hasQuery) {
    return (
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <p className="font-wedding-serif text-xl leading-snug text-balance text-ink">
          {rsvp.searchTitle}
        </p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/55">
          {rsvp.searchHint}
        </p>
        <button
          type="button"
          onPointerDown={keepFieldFocus}
          onClick={onOpenReply}
          className={cn("mt-5", textButtonClass, "text-center")}
        >
          Can't find your group?
        </button>
      </div>
    );
  }

  return (
    <div className="pb-[max(2rem,env(safe-area-inset-bottom))]">
      {catalogError ? (
        <p
          role="alert"
          className="mx-5 mt-8 border-l-2 border-blood pl-4 text-[0.9375rem] leading-relaxed text-blood"
        >
          {catalogError}{" "}
          <button
            type="button"
            onClick={onRetry}
            className="underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      ) : null}

      {!queryReady ? (
        <p className="px-5 py-8 text-[0.9375rem] leading-relaxed text-ink/50">
          Keep typing…
        </p>
      ) : null}

      {queryReady && !catalog && !catalogError ? (
        <p className="px-5 py-8 text-[0.9375rem] leading-relaxed text-ink/50">
          Looking up groups…
        </p>
      ) : null}

      {suggestions ? (
        <div aria-live="polite">
          {suggestions.groups.length === 0 ? (
            <div className="px-4 py-6">
              <p className="font-wedding-serif text-lg leading-snug text-ink">
                No group matched that name.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Try the full name on your invitation.
              </p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Matching groups">
              {suggestions.groups.map((group, index) => (
                <li key={group.partyId} className="border-b border-ink/10">
                  <button
                    id={`${baseId}-group-${group.partyId}`}
                    type="button"
                    role="option"
                    aria-selected={index === suggestionIndex}
                    onMouseEnter={() => onActiveIndex(index)}
                    onPointerDown={keepFieldFocus}
                    onClick={() => onChoose(group)}
                    className={cn(
                      "flex w-full items-center gap-3 p-4 text-left outline-none transition-colors focus-visible:bg-linen md:hover:bg-linen",
                      isKeyboardNav && index === suggestionIndex && "bg-linen",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base leading-tight text-ink">
                        {group.partyName}
                      </span>
                      <span className="mt-0.5 block truncate text-sm leading-snug text-ink/55">
                        {formatNames(group.guests.map(memberLabel))}
                      </span>
                      {group.guests.some((guest) => guest.attending !== null) ? (
                        <span className="mt-0.5 block text-xs text-ink/40">
                          Reply on file
                        </span>
                      ) : null}
                    </span>
                    <ChevronRightIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {suggestions.truncated ? (
            <p className="px-5 pt-4 text-[0.9375rem] leading-relaxed text-ink/55">
              Showing the closest matches. Add a last name if yours isn't here.
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onPointerDown={keepFieldFocus}
        onClick={onOpenReply}
        className={cn("mt-3 mb-3 ml-4 block", textButtonClass)}
      >
        Can't find your group?
      </button>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className={cn("size-4", className)}
    >
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className="size-3.5"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M10 3.5 5.5 8 10 12.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-ink/30"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}
