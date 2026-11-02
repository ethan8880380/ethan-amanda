"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { submitWeddingRSVP } from "@/app/wedding/actions";
import { markWeddingRsvpComplete } from "@/hooks/use-wedding-rsvp-session";
import { weddingContent } from "@/lib/wedding-content";
import {
  MAX_PARTY_GUESTS,
  validateWebsiteRsvp,
  type WebsiteRsvpSnapshot,
} from "@/lib/website-rsvp";
import { cn } from "@/lib/utils";
import { Cta, ExternalArrowIcon } from "./cta";
import { SectionHeading } from "./section-heading";
import { weddingPhotos } from "./wedding-photos";

const { rsvp, hero, registry } = weddingContent;
const photo = weddingPhotos.handOnFace;

type Attendance = "yes" | "no";

interface GuestDraft {
  key: string;
  name: string;
  attending: Attendance | null;
  dietary: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; guests: GuestDraft[] };

const fieldClass =
  "w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3.5 text-[1.0625rem] text-ink placeholder:text-ink/35 transition-colors focus:border-blood focus:outline-none focus-visible:ring-0 aria-invalid:border-blood md:text-lg";

const labelClass = "wedding-eyebrow block text-ink/60";

interface WeddingRsvpProps {
  initialRsvp?: WebsiteRsvpSnapshot | null;
}

function draftsFrom(initialRsvp?: WebsiteRsvpSnapshot | null): GuestDraft[] {
  if (!initialRsvp?.guests.length) {
    return [{ key: "guest-1", name: "", attending: null, dietary: "" }];
  }

  return initialRsvp.guests.map((guest, index) => ({
    key: `saved-${index}`,
    name: guest.name,
    attending:
      guest.attending === true
        ? "yes"
        : guest.attending === false
          ? "no"
          : null,
    dietary: guest.dietaryNotes,
  }));
}

function formatNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
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
  const [guests, setGuests] = useState<GuestDraft[]>(() =>
    draftsFrom(initialRsvp),
  );
  const [email, setEmail] = useState(initialRsvp?.email ?? "");
  const [canUpdate, setCanUpdate] = useState(Boolean(initialRsvp?.guests.length));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();
  const nextKey = useRef(1);

  useEffect(() => {
    if (initialRsvp?.guests.length) markWeddingRsvpComplete();
  }, [initialRsvp]);

  function updateGuest(key: string, patch: Partial<GuestDraft>) {
    setGuests((current) =>
      current.map((guest) => (guest.key === key ? { ...guest, ...patch } : guest)),
    );
  }

  function addGuest() {
    if (guests.length >= MAX_PARTY_GUESTS) return;
    nextKey.current += 1;
    setGuests((current) => [
      ...current,
      {
        key: `guest-${nextKey.current}`,
        name: "",
        attending: null,
        dietary: "",
      },
    ]);
  }

  function removeGuest(key: string) {
    setGuests((current) =>
      current.length === 1 ? current : current.filter((guest) => guest.key !== key),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateWebsiteRsvp({
      email,
      guests: guests.map((guest) => ({
        name: guest.name,
        attending: guest.attending,
        dietaryNotes: guest.dietary,
      })),
    });

    if (!validated.ok) {
      setStatus({ kind: "error", message: validated.error });
      return;
    }

    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result = await submitWeddingRSVP({
        email,
        guests: guests.map((guest) => ({
          name: guest.name,
          attending: guest.attending,
          dietaryNotes: guest.dietary,
        })),
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

  const isSuccess = status.kind === "success";
  const anyoneComing =
    status.kind === "success" &&
    status.guests.some((guest) => guest.attending === "yes");

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="wedding-hairline scroll-mt-16 border-t md:grid md:grid-cols-2"
    >
      <figure className="relative aspect-[3/2] overflow-hidden bg-ink/5 md:sticky md:top-16 md:aspect-auto md:h-[calc(100svh-4rem)]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          quality={70}
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: photo.focal }}
          className="object-cover"
        />
      </figure>

      <div className="px-6 pb-28 pt-16 md:flex md:items-center md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-lg">
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.div
                key="thanks"
                role="status"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeading
                  id="rsvp-heading"
                  eyebrow={rsvp.thanksEyebrow}
                  title={rsvp.thanksTitle}
                />
                <p className="mt-6 text-[1.0625rem] leading-[1.7] text-ink/75 md:text-lg">
                  {thanksCopy(status.guests)}
                </p>
                {anyoneComing && (
                  <a
                    href="/wedding/calendar"
                    className="mt-4 inline-flex min-h-11 items-center text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-blood underline-offset-[6px] hover:underline outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  >
                    Add to calendar
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setStatus({ kind: "idle" })}
                  className="mt-4 block min-h-11 text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-ink/60 underline-offset-[6px] hover:text-ink hover:underline outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  Edit your RSVP
                </button>

                <div className="mt-12 border-t border-ink/15 pt-10">
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
            ) : (
              <motion.div
                key="form"
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: 0.35 }}
              >
                <SectionHeading
                  id="rsvp-heading"
                  eyebrow={rsvp.eyebrow}
                  title={rsvp.title}
                />
                <p className="mt-6 text-[1.0625rem] leading-[1.7] text-ink/75 md:text-lg">
                  {rsvp.intro}
                </p>
                <p className="mt-3 font-wedding-serif text-xl italic text-blood">
                  {rsvp.deadline}
                </p>
                {canUpdate && (
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/60">
                    We already have a reply from this browser. Sending again
                    updates it.
                  </p>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-12 space-y-10"
                  aria-busy={isPending}
                >
                  <div className="space-y-8">
                    {guests.map((guest, index) => (
                      <div
                        key={guest.key}
                        className={cn(
                          "min-w-0 space-y-6",
                          index > 0 && "border-t border-ink/15 pt-8",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <label
                            htmlFor={`${baseId}-${guest.key}-name`}
                            className={labelClass}
                          >
                            {guests.length > 1 ? `Person ${index + 1}` : "Name"}
                          </label>
                          {guests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGuest(guest.key)}
                              className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink/40 transition-colors hover:text-blood outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          id={`${baseId}-${guest.key}-name`}
                          value={guest.name}
                          onChange={(event) =>
                            updateGuest(guest.key, { name: event.target.value })
                          }
                          type="text"
                          autoComplete={index === 0 ? "name" : "off"}
                          placeholder={index === 0 ? "Your name" : "Their name"}
                          className={fieldClass}
                        />

                        <div className="space-y-3">
                          <p className={labelClass} id={`${baseId}-${guest.key}-attend`}>
                            {index === 0 ? "Will you attend?" : "Will they attend?"}
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
                                  Dietary notes{" "}
                                  <span className="text-ink/40">(optional)</span>
                                </label>
                                <textarea
                                  id={`${baseId}-${guest.key}-dietary`}
                                  value={guest.dietary}
                                  onChange={(event) =>
                                    updateGuest(guest.key, {
                                      dietary: event.target.value,
                                    })
                                  }
                                  rows={2}
                                  placeholder="Allergies, restrictions, etc."
                                  className={cn(fieldClass, "resize-none")}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {guests.length < MAX_PARTY_GUESTS && (
                    <button
                      type="button"
                      onClick={addGuest}
                      className="flex min-h-12 w-full items-center justify-center border border-ink/25 px-3 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-ink/75 transition-colors hover:border-ink hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                      Add another person
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
                    className="flex h-14 w-full items-center justify-center bg-blood text-[0.8125rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blood-deep disabled:cursor-wait disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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
          "flex min-h-14 cursor-pointer items-center justify-center border px-3 text-center text-[0.8125rem] font-medium uppercase leading-tight tracking-[0.14em] transition-colors duration-300",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-blood peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper",
          checked
            ? "border-blood bg-blood text-paper"
            : "border-ink/25 text-ink/75 hover:border-ink",
        )}
      >
        {label}
      </label>
    </div>
  );
}
