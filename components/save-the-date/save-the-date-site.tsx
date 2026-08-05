"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import type { PartyPayload } from "@/lib/guests";
import { weddingContent as c } from "@/lib/wedding-content";
import { AddressForm } from "@/components/save-the-date/address-form";

const ease = [0.22, 1, 0.36, 1] as const;

interface SaveTheDateSiteProps {
  party?: PartyPayload;
  token?: string;
}

export function SaveTheDateSite({ party, token }: SaveTheDateSiteProps) {
  const reduce = useReducedMotion();
  const showAddress = Boolean(token && party);

  return (
    <div className="min-h-screen bg-[#14110f] text-[#f7f3ee]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <motion.div
          initial={reduce ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease }}
          className="absolute inset-0"
        >
          <Image
            src={c.saveTheDate.image}
            alt={`${c.couple.short} — save the date`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-[#14110f]/55 to-[#14110f]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(20,17,15,0.45)_100%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col px-6 pb-14 pt-8 sm:px-10 lg:px-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="flex items-center justify-between"
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
              {c.saveTheDate.eyebrow}
            </p>
            <Link
              href="/wedding"
              className="text-[11px] uppercase tracking-[0.2em] text-white/55 transition hover:text-white"
            >
              Wedding site
            </Link>
          </motion.div>

          <div className="mt-auto max-w-4xl pb-4 pt-24">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="font-serif text-[clamp(3.4rem,12vw,8.5rem)] leading-[0.9] tracking-tight text-white"
            >
              {c.couple.partnerOne}
              <span className="mx-[0.12em] text-[#e11d2e]">&</span>
              {c.couple.partnerTwo}
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.45, ease }}
              className="mt-6 max-w-xl font-serif text-2xl text-white/95 sm:text-3xl"
            >
              {c.saveTheDate.headline}
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease }}
              className="mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg"
            >
              {c.date.display}
              <span className="mx-2 text-white/35">·</span>
              {c.saveTheDate.cityHint}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="/wedding/calendar"
                className="inline-flex items-center gap-2 bg-[#e11d2e] px-5 py-3.5 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#14110f]"
              >
                <CalendarPlus className="size-4" />
                Add to calendar
              </a>
              {showAddress ? (
                <a
                  href="#address"
                  className="inline-flex items-center border border-white/35 px-5 py-3.5 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#14110f]"
                >
                  Share your address
                </a>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-[#f4efe8] px-6 py-20 text-[#1c1714] sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a7462]">
              What&apos;s next
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Invitations to follow
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#5c5046]">
              {c.saveTheDate.subhead}
            </p>
            <dl className="mt-10 space-y-5 text-sm">
              <div>
                <dt className="uppercase tracking-[0.18em] text-[#8a7462]">
                  Date
                </dt>
                <dd className="mt-1 font-serif text-2xl">{c.date.display}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-[#8a7462]">
                  Time
                </dt>
                <dd className="mt-1 font-serif text-2xl">{c.date.time}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.18em] text-[#8a7462]">
                  Place
                </dt>
                <dd className="mt-1 font-serif text-2xl">
                  {c.saveTheDate.cityHint}
                </dd>
              </div>
            </dl>
          </div>

          {showAddress && token && party ? (
            <div
              id="address"
              className="scroll-mt-10 border border-[#e0d5c7] bg-white/70 p-6 sm:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a7462]">
                Mailing address
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight">
                Where should we write you?
              </h2>
              <p className="mt-3 text-[#5c5046]">{c.saveTheDate.addressIntro}</p>
              <div className="mt-6">
                <AddressForm token={token} initial={party} />
              </div>
            </div>
          ) : (
            <div className="relative min-h-[28rem] overflow-hidden">
              <Image
                src="/wedding/wedding-02.png"
                alt={`${c.couple.short}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#14110f] px-6 py-10 text-center sm:px-10">
        <p className="font-serif text-2xl text-white/90">{c.couple.short}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
          {c.footer.note} {c.footer.year}
        </p>
      </footer>
    </div>
  );
}
