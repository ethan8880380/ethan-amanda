"use client";

import Image from "next/image";
import { useId, useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { submitWeddingRSVP } from "@/app/wedding/actions";
import { markWeddingRsvpComplete } from "@/hooks/use-wedding-rsvp-session";
import { weddingContent } from "@/lib/wedding-content";
import { cn } from "@/lib/utils";
import { Cta, ExternalArrowIcon } from "./cta";
import { SectionHeading } from "./section-heading";
import { weddingPhotos } from "./wedding-photos";

const { rsvp, hero, registry } = weddingContent;
const photo = weddingPhotos.handOnFace;

type Attendance = "yes" | "no";
type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; attending: Attendance };

const fieldClass =
  "w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3.5 text-[1.0625rem] text-ink placeholder:text-ink/35 transition-colors focus:border-blood focus:outline-none focus-visible:ring-0 aria-invalid:border-blood md:text-lg";

const labelClass =
  "wedding-eyebrow block text-ink/60";

export function WeddingRsvp() {
  const [attending, setAttending] = useState<Attendance | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const guests = String(data.get("guests") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const allergies = String(data.get("allergies") ?? "").trim();

    if (!guests || !attending) {
      setStatus({
        kind: "error",
        message: "Please fill in your name and whether you can attend.",
      });
      return;
    }

    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result = await submitWeddingRSVP({
        guests,
        email,
        allergies,
        attending,
      });
      if (result.success) {
        markWeddingRsvpComplete();
        setStatus({ kind: "success", attending });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          message: result.error ?? "Something went wrong. Please try again.",
        });
      }
    });
  }

  const isSuccess = status.kind === "success";

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="wedding-hairline scroll-mt-16 border-t md:grid md:grid-cols-2"
    >
      {/* Photograph — a quiet emotional beat before the ask */}
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
                  {status.attending === "yes"
                    ? rsvp.successYes
                    : rsvp.successNo}
                </p>
                {status.attending === "yes" && (
                  <a
                    href="/wedding/calendar"
                    className="mt-4 inline-flex min-h-11 items-center text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-blood underline-offset-[6px] hover:underline outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  >
                    Add to calendar
                  </a>
                )}

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

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-12 space-y-9"
                  aria-busy={isPending}
                >
                  <div className="space-y-2">
                    <label htmlFor={`${baseId}-guests`} className={labelClass}>
                      Guest name(s)
                    </label>
                    <input
                      id={`${baseId}-guests`}
                      name="guests"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Alex Smith, Jordan Lee"
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`${baseId}-email`} className={labelClass}>
                      Email <span className="text-ink/40">(optional)</span>
                    </label>
                    <input
                      id={`${baseId}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@email.com"
                      className={fieldClass}
                    />
                  </div>

                  <fieldset className="space-y-3">
                    <legend className={labelClass}>Will you attend?</legend>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <AttendanceOption
                        id={`${baseId}-yes`}
                        value="yes"
                        label="Joyfully accept"
                        checked={attending === "yes"}
                        onChange={() => setAttending("yes")}
                      />
                      <AttendanceOption
                        id={`${baseId}-no`}
                        value="no"
                        label="Regretfully decline"
                        checked={attending === "no"}
                        onChange={() => setAttending("no")}
                      />
                    </div>
                  </fieldset>

                  <AnimatePresence initial={false}>
                    {attending === "yes" && (
                      <motion.div
                        key="allergies"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pb-1">
                          <label
                            htmlFor={`${baseId}-allergies`}
                            className={labelClass}
                          >
                            Dietary notes{" "}
                            <span className="text-ink/40">(optional)</span>
                          </label>
                          <textarea
                            id={`${baseId}-allergies`}
                            name="allergies"
                            rows={2}
                            placeholder="Allergies, restrictions, etc."
                            className={cn(fieldClass, "resize-none")}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                    {isPending ? "Sending…" : `Send ${hero.cta}`}
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
  value: Attendance;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function AttendanceOption({
  id,
  value,
  label,
  checked,
  onChange,
}: AttendanceOptionProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type="radio"
        name="attending"
        value={value}
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
            : "border-ink/25 text-ink/75 hover:border-ink"
        )}
      >
        {label}
      </label>
    </div>
  );
}
