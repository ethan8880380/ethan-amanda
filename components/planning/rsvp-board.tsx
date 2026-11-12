"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface RsvpBoardGuest {
  name: string;
  plusOne: boolean;
  attending: boolean | null;
}

export interface RsvpBoardParty {
  id: string;
  partyName: string;
  email: string | null;
  sentAt: string | null;
  status: "pending" | "attending" | "declined";
  submittedAt: string | null;
  guests: RsvpBoardGuest[];
}

type Filter = "waiting" | "replied" | "sent" | "unsent" | "all";

interface RsvpBoardProps {
  parties: RsvpBoardParty[];
}

function formatWhen(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function guestLabel(guest: RsvpBoardGuest, partyReplied: boolean) {
  const name = guest.plusOne ? `${guest.name} (+1)` : guest.name;
  if (guest.attending === true) return `${name} · Yes`;
  if (guest.attending === false) return `${name} · No`;
  if (partyReplied) return `${name} · No answer`;
  return name;
}

function statusLabel(status: RsvpBoardParty["status"]) {
  if (status === "attending") return "Yes";
  if (status === "declined") return "No";
  return "No reply";
}

export function RsvpBoard({ parties }: RsvpBoardProps) {
  const [filter, setFilter] = useState<Filter>("waiting");

  const stats = useMemo(() => {
    const sent = parties.filter((party) => party.sentAt).length;
    const replied = parties.filter((party) => party.status !== "pending");
    const waiting = parties.filter(
      (party) => party.sentAt && party.status === "pending",
    );
    const coming = parties.reduce(
      (count, party) =>
        count + party.guests.filter((guest) => guest.attending === true).length,
      0,
    );
    const declinedGuests = parties.reduce(
      (count, party) =>
        count +
        party.guests.filter((guest) => guest.attending === false).length,
      0,
    );
    return {
      total: parties.length,
      sent,
      unsent: parties.length - sent,
      replied: replied.length,
      repliedYes: replied.filter((party) => party.status === "attending")
        .length,
      repliedNo: replied.filter((party) => party.status === "declined").length,
      repliedNotSent: replied.filter((party) => !party.sentAt).length,
      waiting: waiting.length,
      waitingGuests: waiting.reduce(
        (count, party) => count + party.guests.length,
        0,
      ),
      coming,
      declinedGuests,
    };
  }, [parties]);

  const filtered = useMemo(() => {
    const rows = parties.filter((party) => {
      if (filter === "waiting") return Boolean(party.sentAt) && party.status === "pending";
      if (filter === "replied") return party.status !== "pending";
      if (filter === "sent") return Boolean(party.sentAt);
      if (filter === "unsent") return !party.sentAt;
      return true;
    });

    return rows.sort((a, b) => {
      if (filter === "waiting") {
        return (a.sentAt ?? "").localeCompare(b.sentAt ?? "");
      }
      if (filter === "replied") {
        return (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "");
      }
      return a.partyName.localeCompare(b.partyName);
    });
  }, [parties, filter]);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "waiting", label: "No reply", count: stats.waiting },
    { id: "replied", label: "Replied", count: stats.replied },
    { id: "sent", label: "Sent", count: stats.sent },
    { id: "unsent", label: "Not sent", count: stats.unsent },
    { id: "all", label: "All", count: stats.total },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] bg-[#161616] p-4 sm:p-6">
        <p className="font-medium text-2xl">Replies</p>
        <p className="mt-1 max-w-xl text-sm text-[#8e8e8e]">
          Households marked sent on Mail, who has replied, and who is still
          waiting.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Sent" value={`${stats.sent}/${stats.total || 0}`} />
          <Stat
            label="Replied"
            value={String(stats.replied)}
            detail={`${stats.repliedYes} yes · ${stats.repliedNo} no`}
          />
          <Stat
            label="No reply"
            value={String(stats.waiting)}
            detail={
              stats.waiting
                ? `${stats.waitingGuests} ${stats.waitingGuests === 1 ? "person" : "people"}`
                : "All caught up"
            }
          />
          <Stat
            label="Coming"
            value={String(stats.coming)}
            detail={`${stats.declinedGuests} declined`}
          />
        </div>
        {stats.repliedNotSent > 0 ? (
          <p className="mt-4 text-sm text-[#8e8e8e]">
            {stats.repliedNotSent}{" "}
            {stats.repliedNotSent === 1 ? "reply came" : "replies came"} in
            without a sent mark.
          </p>
        ) : null}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                active
                  ? "rounded-full bg-white text-black"
                  : "rounded-full bg-[#161616] text-[#8e8e8e]"
              }`}
            >
              {item.label} · {item.count}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-[#101010] px-5 py-8 text-center text-[#8e8e8e]">
          {parties.length === 0 ? (
            <p>No households yet. Add them on Guests.</p>
          ) : filter === "waiting" && stats.sent === 0 ? (
            <p>
              Nothing is marked sent yet.{" "}
              <Link href="/plan/mail" className="text-[#141414] underline">
                Mark invitations on Mail.
              </Link>
            </p>
          ) : filter === "waiting" ? (
            <p>Everyone who was sent an invitation has replied.</p>
          ) : (
            <p>Nothing in this filter.</p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((party) => {
            const sent = formatWhen(party.sentAt);
            const replied = formatWhen(party.submittedAt);
            return (
              <li
                key={party.id}
                className="rounded-[1.75rem] bg-[#161616] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 className="font-medium text-xl sm:text-2xl">
                    {party.partyName}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#8e8e8e]">
                    {statusLabel(party.status)}
                  </p>
                </div>
                {party.guests.length ? (
                  <p className="mt-2 text-sm text-[#8e8e8e]">
                    {party.guests
                      .map((guest) =>
                        guestLabel(guest, party.status !== "pending"),
                      )
                      .join(" · ")}
                  </p>
                ) : null}
                {party.email ? (
                  <p className="mt-1 break-all text-sm text-[#8e8e8e]">
                    {party.email}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[#8e8e8e]">
                  {sent ? `Sent ${sent}` : "Not sent"}
                  {replied ? ` · Replied ${replied}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl bg-black px-3 py-3">
      <p className="text-sm text-[#8e8e8e]">{label}</p>
      <p className="mt-1 text-2xl font-medium tracking-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-[#8e8e8e]">{detail}</p> : null}
    </div>
  );
}
