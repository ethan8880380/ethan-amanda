"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import type { PartyPayload } from "@/lib/guests";
import { weddingContent as c } from "@/lib/wedding-content";
import { AddressForm } from "@/components/save-the-date/address-form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const ease = [0.22, 1, 0.36, 1] as const;

interface SaveTheDateSiteProps {
  party?: PartyPayload;
  token?: string;
}

export function SaveTheDateSite({ party, token }: SaveTheDateSiteProps) {
  const reduce = useReducedMotion();
  const isGuest = Boolean(token && party);
  const greeting = party ? getPersonalGreeting(party) : null;
  const partyName = party?.party.party_name?.trim() || null;
  const [addressCollected, setAddressCollected] = useState(
    Boolean(party?.party.address_collected_at),
  );
  const [addressOpen, setAddressOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#171512]">
      {/* Hero: photo plane + light type plane — same structure, new look */}
      <section className="flex min-h-[100svh] flex-col">
        <div className="relative h-[46svh] min-h-[16rem] w-full overflow-hidden sm:h-[52svh]">
          <motion.div
            initial={reduce ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease }}
            className="absolute inset-0"
          >
            <Image
              src={c.saveTheDate.image}
              alt={`${c.couple.short} — save the date`}
              fill
              priority
              className="object-cover object-[center_25%]"
              sizes="100vw"
            />
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-12 lg:px-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="flex items-baseline justify-between gap-3"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a]">
              {c.couple.partnerTwo}{" "}
              <span className="text-[#e11d2e]">&</span>{" "}
              {c.couple.partnerOne}
            </p>
            {!isGuest ? (
              <Link
                href="/wedding"
                className="text-[11px] uppercase tracking-[0.18em] text-[#8a8a8a] transition md:hover:text-[#171512]"
              >
                Wedding site
              </Link>
            ) : partyName ? (
              <p className="max-w-[50%] truncate text-right text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a]">
                {partyName}
              </p>
            ) : (
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a8a8a]">
                {c.saveTheDate.eyebrow}
              </p>
            )}
          </motion.div>

          <div className="mt-10 max-w-lg sm:mt-12">
            {isGuest && greeting ? (
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease }}
                className="font-serif text-[2rem] leading-[1.15] tracking-tight text-[#171512] sm:text-4xl"
              >
                {greeting}
                <span>,</span>
              </motion.h1>
            ) : (
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease }}
                className="font-serif text-[2rem] leading-[1.15] tracking-tight text-[#171512] sm:text-4xl"
              >
                {c.saveTheDate.headline}
              </motion.h1>
            )}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35, ease }}
              className="mt-4 space-y-2"
            >
              {isGuest ? (
                <>
                  <p className="text-base font-medium leading-snug text-[#171512] sm:text-lg">
                    {c.saveTheDate.headline}
                  </p>
                  <p className="max-w-md text-[15px] leading-relaxed text-[#5c564e]">
                    {c.saveTheDate.guestInviteLine}
                  </p>
                </>
              ) : (
                <p className="max-w-md text-[15px] leading-relaxed text-[#5c564e]">
                  {c.saveTheDate.subhead}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5, ease }}
              className="mt-8 grid grid-cols-2 gap-6 border-t border-[#e8e8e8] pt-6 sm:max-w-md"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a8378]">
                  When
                </p>
                <p className="mt-1.5 text-base font-medium leading-snug text-[#171512] sm:text-lg">
                  {formatShortDate(c.date.iso, c.date.short)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a8378]">
                  Where
                </p>
                <p className="mt-1.5 text-base font-medium leading-snug text-[#171512] sm:text-lg">
                  {c.saveTheDate.cityHint}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62, ease }}
              className="mt-8 sm:max-w-md"
            >
              {isGuest && token && party ? (
                <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
                  <Drawer open={addressOpen} onOpenChange={setAddressOpen}>
                    <DrawerTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center bg-[#171512] px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#ffffff] transition active:scale-[0.98] md:hover:bg-[#e11d2e] sm:flex-1"
                      >
                        {addressCollected
                          ? "Update your address"
                          : "Share your address"}
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="gap-0 border-0 bg-[#ffffff] p-0 text-[#171512] before:inset-0 before:rounded-t-2xl before:bg-[#ffffff] data-[vaul-drawer-direction=bottom]:max-h-[88vh] [&>div:first-child]:!hidden">
                      <div className="mx-auto mt-3 h-1.5 w-14 shrink-0 rounded-full bg-[#b8b0a4]" />
                      <DrawerHeader className="gap-1 px-5 pb-1 pt-4 text-left">
                        <DrawerTitle className="font-serif text-2xl font-normal tracking-tight">
                          Your address
                        </DrawerTitle>
                        <DrawerDescription className="text-left text-sm text-[#5c564e]">
                          {c.saveTheDate.guestSubhead}
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
                        <AddressForm
                          token={token}
                          initial={party}
                          onSaved={() => {
                            setAddressCollected(true);
                            setAddressOpen(false);
                          }}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                  <a
                    href="/wedding/calendar"
                    className="inline-flex w-full items-center justify-center gap-2 border border-[#171512]/20 px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#171512] transition active:scale-[0.98] md:hover:border-[#171512] sm:w-auto"
                  >
                    <CalendarPlus className="size-4" />
                    Calendar
                  </a>
                </div>
              ) : (
                <a
                  href="/wedding/calendar"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#171512] px-5 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#ffffff] transition active:scale-[0.98] md:hover:bg-[#e11d2e] sm:w-auto"
                >
                  <CalendarPlus className="size-4" />
                  Add to calendar
                </a>
              )}
              {isGuest && addressCollected ? (
                <p className="mt-3 text-sm text-[#5c564e]">
                  You&apos;re all set — we&apos;ll send your invitation here.
                </p>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative h-[40vh] min-h-[14rem] max-h-[26rem] overflow-hidden bg-[#ffffff] sm:h-[48vh] sm:max-h-[34rem]">
        <Image
          src="/wedding/wedding-03.png"
          alt={`${c.couple.short}`}
          fill
          className="object-cover object-[center_40%]"
          sizes="100vw"
        />
      </section>

      <section className="border-t border-[#e8e8e8] bg-[#ffffff] px-5 py-14 sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-10 sm:gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a8378]">
              The celebration
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-[#171512] sm:text-4xl">
              {isGuest ? "A little more detail" : "Invitations to follow"}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#5c564e]">
              {isGuest
                ? "Ceremony in Seattle, reception in Mukilteo — more to come with your invitation."
                : c.saveTheDate.subhead}
            </p>
          </div>

          <dl className="space-y-6">
            <DetailRow
              label="Ceremony"
              value={c.venue.ceremony.name}
              detail={c.venue.ceremony.city}
            />
            <DetailRow
              label="Reception"
              value={c.venue.reception.name}
              detail={c.venue.reception.city}
            />
          </dl>
        </div>
      </section>

      <section className="relative h-[42vh] min-h-[15rem] max-h-[28rem] overflow-hidden bg-[#ffffff] sm:h-[50vh] sm:max-h-[36rem]">
        <Image
          src="/wedding/wedding-02.png"
          alt={`${c.couple.short}`}
          fill
          className="object-cover object-[center_40%]"
          sizes="100vw"
        />
      </section>

      <footer className="flex items-end justify-between gap-4 border-t border-[#e8e8e8] bg-[#ffffff] px-5 pt-8 sm:px-10">
        <div className="pb-8 text-left">
          <p className="font-serif text-xl text-[#171512] sm:text-2xl">
            {c.couple.short}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#8a8378]">
            {c.footer.note} {c.footer.year}
          </p>
        </div>
        <Image
          src="/gallery/mona-bg.png"
          alt=""
          width={96}
          height={96}
          className="h-20 w-20 shrink-0 object-contain object-bottom sm:h-24 sm:w-24"
        />
      </footer>
    </div>
  );
}

function getPersonalGreeting(party: PartyPayload) {
  const guestNames = party.guests
    .filter((guest) => !guest.is_plus_one && guest.full_name.trim())
    .map((guest) => firstName(guest.full_name));

  if (guestNames.length > 0) return `Hello ${formatNameList(guestNames)}`;

  const partyName = party.party.party_name?.trim();
  if (!partyName) return "Hello friends";
  if (/^the\s+/i.test(partyName) || partyName.includes("&")) {
    return `Hello ${partyName}`;
  }
  return `Hello ${firstName(partyName)}`;
}

function formatNameList(names: string[]) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

function formatShortDate(iso: string, fallback: string) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-[#8a8378]">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-xl leading-snug text-[#171512] sm:text-2xl">
        {value}
        {detail ? (
          <span className="mt-1 block text-sm font-sans tracking-normal text-[#8a8378]">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
