"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, Share2, Trash2 } from "lucide-react";
import { addGuestToParty, deleteGuest, deleteParty } from "@/app/plan/actions";

interface PartyGuest {
  id: string;
  full_name: string;
  is_plus_one: boolean;
  attending: boolean | null;
  meal_choice: string | null;
  dietary_notes: string | null;
}

interface PartyCardProps {
  party: {
    id: string;
    party_name: string | null;
    access_token: string;
    rsvp_status: string;
    address_collected_at: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    notes: string | null;
    food_allergies?: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };
  guests: PartyGuest[];
  link: string;
}

export function PartyCard({ party, guests, link }: PartyCardProps) {
  const addGuestFormRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const address = [
    party.address_line1,
    party.address_line2,
    [party.city, party.state, party.postal_code].filter(Boolean).join(", "),
    party.country,
  ]
    .filter(Boolean)
    .join(" · ");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function shareLink() {
    try {
      await navigator.share({
        title: party.party_name || "Wedding invite",
        text: `Your link for ${party.party_name || "our wedding"}`,
        url: link,
      });
    } catch {
      await copyLink();
    }
  }

  return (
    <article className="border border-[#e4ddd4] bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl leading-tight sm:text-2xl">
            {party.party_name || "Untitled party"}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#6f6258] sm:text-sm">
            <span className="capitalize">RSVP: {party.rsvp_status}</span>
            <span aria-hidden>·</span>
            <span>
              {party.address_collected_at
                ? "Address collected"
                : "Address pending"}
            </span>
          </div>
          {(party.contact_email || party.contact_phone) && (
            <p className="mt-1 break-words text-sm text-[#6f6258]">
              {[party.contact_email, party.contact_phone]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {address ? (
            <p className="mt-1 break-words text-sm text-[#6f6258]">{address}</p>
          ) : null}
          {party.food_allergies ? (
            <p className="mt-1 text-sm text-[#6f6258]">
              <span className="text-[#8a7462]">Allergies:</span>{" "}
              {party.food_allergies}
            </p>
          ) : null}
          {party.notes ? (
            <p className="mt-1 text-sm text-[#6f6258]">{party.notes}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm(`Delete ${party.party_name || "this party"}?`))
              return;
            startTransition(async () => {
              await deleteParty(party.id);
            });
          }}
          className="inline-flex size-10 shrink-0 items-center justify-center text-red-700 disabled:opacity-50"
          aria-label="Delete party"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#6f6258]">
          Personalized link
        </p>
        <p className="mt-2 break-all bg-[#f7f3ee] px-3 py-2.5 text-xs leading-relaxed sm:text-sm">
          {link}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copyLink}
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
                Copy
              </>
            )}
          </button>
          {canShare ? (
            <button
              type="button"
              onClick={shareLink}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#1c1714] px-3 text-xs uppercase tracking-[0.16em] text-[#f7f3ee]"
            >
              <Share2 className="size-3.5" />
              Share
            </button>
          ) : (
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#1c1714] px-3 text-xs uppercase tracking-[0.16em] text-[#f7f3ee]"
            >
              <Copy className="size-3.5" />
              Copy link
            </button>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-3 border-t border-[#eee6dc] pt-4">
        {guests.map((guest) => (
          <li
            key={guest.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p>
                {guest.full_name}
                {guest.is_plus_one ? (
                  <span className="ml-1.5 text-[#6f6258]">(+1)</span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[#6f6258]">
                {guest.attending == null
                  ? "No RSVP yet"
                  : guest.attending
                    ? `Attending${guest.meal_choice ? ` · ${guest.meal_choice}` : ""}`
                    : "Declined"}
                {guest.dietary_notes ? ` · ${guest.dietary_notes}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await deleteGuest(guest.id);
                });
              }}
              className="shrink-0 px-2 py-2 text-xs uppercase tracking-[0.14em] text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form
        ref={addGuestFormRef}
        action={(formData) => {
          startTransition(async () => {
            await addGuestToParty({
              party_id: party.id,
              full_name: String(formData.get("full_name") ?? ""),
              is_plus_one: formData.get("is_plus_one") === "on",
            });
            addGuestFormRef.current?.reset();
          });
        }}
        className="mt-4 space-y-3 border-t border-[#eee6dc] pt-4"
      >
        <label className="block text-sm">
          Add guest
          <input
            name="full_name"
            required
            className="mt-1 w-full border border-[#d9d0c5] px-3 py-3 text-base"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 flex-1 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_plus_one"
              className="size-4 accent-[#1c1714]"
            />
            Plus-one slot
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 flex-1 border border-[#1c1714] px-4 text-xs uppercase tracking-[0.18em] disabled:opacity-50 sm:flex-none"
          >
            Add
          </button>
        </div>
      </form>
    </article>
  );
}
