"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Eye, Mail, Share2 } from "lucide-react";
import { setSaveTheDateSent } from "@/app/plan/actions";

export interface MailPartyRow {
  id: string;
  party_name: string | null;
  access_token: string;
  contact_email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  address_collected_at: string | null;
  save_the_date_sent_at: string | null;
  link_opened_at: string | null;
  link_last_opened_at: string | null;
  link_open_count: number;
  guest_names: string[];
}

type Filter =
  | "all"
  | "unsent"
  | "sent"
  | "opened"
  | "not_opened"
  | "no_address";

interface SaveTheDateMailProps {
  parties: MailPartyRow[];
  origin: string;
}

function formatAddress(party: MailPartyRow) {
  const lines = [
    party.address_line1,
    party.address_line2,
    [party.city, party.state, party.postal_code].filter(Boolean).join(", "),
    party.country && party.country !== "US" ? party.country : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function hasAddress(party: MailPartyRow) {
  return Boolean(party.address_line1 || party.address_collected_at);
}

function formatWhen(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SaveTheDateMail({ parties, origin }: SaveTheDateMailProps) {
  const [filter, setFilter] = useState<Filter>("unsent");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const sent = parties.filter((p) => p.save_the_date_sent_at).length;
    const opened = parties.filter((p) => p.link_opened_at).length;
    const withAddress = parties.filter(hasAddress).length;
    return {
      total: parties.length,
      sent,
      unsent: parties.length - sent,
      opened,
      notOpened: parties.length - opened,
      withAddress,
      noAddress: parties.length - withAddress,
    };
  }, [parties]);

  const filtered = useMemo(() => {
    const rows = parties.filter((party) => {
      if (filter === "sent") return Boolean(party.save_the_date_sent_at);
      if (filter === "unsent") return !party.save_the_date_sent_at;
      if (filter === "opened") return Boolean(party.link_opened_at);
      if (filter === "not_opened") return !party.link_opened_at;
      if (filter === "no_address") return !hasAddress(party);
      return true;
    });

    return rows.sort((a, b) => {
      const aSent = Boolean(a.save_the_date_sent_at);
      const bSent = Boolean(b.save_the_date_sent_at);
      if (aSent !== bSent) return aSent ? 1 : -1;
      return (a.party_name || "").localeCompare(b.party_name || "");
    });
  }, [parties, filter]);

  async function copyLink(partyId: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(partyId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  async function shareLink(party: MailPartyRow, link: string) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: party.party_name || "Save the date",
          text: `Save the date for ${party.party_name || "our wedding"}`,
          url: link,
        });
        return;
      }
    } catch {
      // fall through to copy
    }
    await copyLink(party.id, link);
  }

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "unsent", label: "Unsent", count: stats.unsent },
    { id: "sent", label: "Sent", count: stats.sent },
    { id: "opened", label: "Opened", count: stats.opened },
    { id: "not_opened", label: "Not opened", count: stats.notOpened },
    { id: "no_address", label: "No address", count: stats.noAddress },
    { id: "all", label: "All", count: stats.total },
  ];

  return (
    <div className="space-y-6">
      <section className="border border-[#e4ddd4] bg-white p-4 sm:p-6">
        <p className="font-serif text-2xl">Save the date mail</p>
        <p className="mt-1 text-sm text-[#6f6258]">
          Copy each household link, send it, then mark as sent. Opens update
          when they visit their link.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Households" value={String(stats.total)} />
          <Stat label="Sent" value={`${stats.sent}/${stats.total || 0}`} />
          <Stat label="Opened" value={`${stats.opened}/${stats.total || 0}`} />
          <Stat label="Unsent" value={String(stats.unsent)} />
          <Stat
            label="Addresses"
            value={`${stats.withAddress}/${stats.total || 0}`}
          />
        </div>
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
                  ? "bg-[#1c1714] text-[#f7f3ee]"
                  : "border border-[#e4ddd4] bg-white text-[#6f6258]"
              }`}
            >
              {item.label} · {item.count}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-[#d9d0c5] bg-white px-5 py-8 text-center text-[#6f6258]">
          {parties.length === 0
            ? "No parties yet — add households on the Guests page."
            : "Nothing in this filter."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((party) => {
            const link = `${origin}/r/${party.access_token}`;
            const sent = Boolean(party.save_the_date_sent_at);
            const opened = Boolean(party.link_opened_at);
            const address = formatAddress(party);
            const copied = copiedId === party.id;
            const firstOpen = formatWhen(party.link_opened_at);
            const lastOpen = formatWhen(party.link_last_opened_at);

            return (
              <li
                key={party.id}
                className={`border bg-white p-4 sm:p-5 ${
                  sent ? "border-[#e4ddd4] opacity-80" : "border-[#e4ddd4]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl">
                        {party.party_name || "Untitled party"}
                      </h2>
                      {sent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#6f6258]">
                          <Mail className="size-3" />
                          Sent
                        </span>
                      ) : null}
                      {opened ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#6f6258]">
                          <Eye className="size-3" />
                          Opened
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-[#a89482]">
                          Not opened
                        </span>
                      )}
                    </div>
                    {party.guest_names.length ? (
                      <p className="mt-1 text-sm text-[#6f6258]">
                        {party.guest_names.join(" · ")}
                      </p>
                    ) : null}
                    {party.contact_email ? (
                      <p className="mt-1 break-all text-sm text-[#6f6258]">
                        {party.contact_email}
                      </p>
                    ) : null}
                    {opened ? (
                      <p className="mt-1 text-xs text-[#6f6258]">
                        First open {firstOpen}
                        {lastOpen && lastOpen !== firstOpen
                          ? ` · last ${lastOpen}`
                          : ""}
                        {party.link_open_count > 1
                          ? ` · ${party.link_open_count} opens`
                          : ""}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex min-h-11 cursor-pointer items-center gap-2 border border-[#d9d0c5] px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={sent}
                      disabled={isPending}
                      onChange={(e) => {
                        const next = e.target.checked;
                        startTransition(async () => {
                          await setSaveTheDateSent(party.id, next);
                        });
                      }}
                      className="size-4 accent-[#1c1714]"
                    />
                    Mark sent
                  </label>
                </div>

                <div className="mt-3 whitespace-pre-line text-sm text-[#6f6258]">
                  {address || (
                    <span className="text-[#a89482]">
                      No mailing address yet
                    </span>
                  )}
                </div>

                <div className="mt-3 break-all bg-[#f7f3ee] px-3 py-2.5 text-xs sm:text-sm">
                  {link}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(party.id, link)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1c1714] px-3 text-xs uppercase tracking-[0.16em]"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareLink(party, link)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#1c1714] px-3 text-xs uppercase tracking-[0.16em] text-[#f7f3ee]"
                  >
                    <Share2 className="size-3.5" />
                    Share
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#eee6dc] bg-[#f7f3ee] px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f6258]">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  );
}
