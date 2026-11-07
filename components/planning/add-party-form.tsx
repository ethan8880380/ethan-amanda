"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Copy, Link2, Share2 } from "lucide-react";
import { createParty } from "@/app/plan/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatedPartySummary {
  partyName: string;
  guestNames: string[];
  plusOneName?: string;
  contactEmail?: string;
  address?: string;
  link: string;
}

interface AddPartyFormProps {
  origin: string;
}

const fieldClass =
  "mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base";

export function AddPartyForm({ origin }: AddPartyFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [addressOpen, setAddressOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedPartySummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  function closeCreated() {
    setCreated(null);
    setCopied(false);
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link — select and copy it manually.");
    }
  }

  async function shareLink(createdParty: CreatedPartySummary) {
    try {
      await navigator.share({
        title: createdParty.partyName,
        text: `Your wedding link for ${createdParty.partyName}`,
        url: createdParty.link,
      });
    } catch {
      await copyLink(createdParty.link);
    }
  }

  function onSubmit(formData: FormData) {
    setError(null);
    const guestNames = String(formData.get("guest_names") ?? "")
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    const partyName = String(formData.get("party_name") ?? "").trim();
    const plusOneName =
      String(formData.get("plus_one_name") ?? "").trim() || undefined;
    const contactEmail =
      String(formData.get("contact_email") ?? "").trim() || undefined;
    const addressLine1 =
      String(formData.get("address_line1") ?? "").trim() || undefined;
    const addressLine2 =
      String(formData.get("address_line2") ?? "").trim() || undefined;
    const city = String(formData.get("city") ?? "").trim() || undefined;
    const state = String(formData.get("state") ?? "").trim() || undefined;
    const postalCode =
      String(formData.get("postal_code") ?? "").trim() || undefined;
    const country = String(formData.get("country") ?? "").trim() || undefined;

    startTransition(async () => {
      try {
        const party = await createParty({
          party_name: partyName,
          contact_email: contactEmail,
          notes: String(formData.get("notes") ?? "") || undefined,
          guest_names: guestNames,
          plus_one_name: plusOneName,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          postal_code: postalCode,
          country,
        });

        const address = addressLine1
          ? [
              addressLine1,
              addressLine2,
              [city, state, postalCode].filter(Boolean).join(", "),
              country,
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined;

        setCreated({
          partyName: party.party_name || partyName,
          guestNames,
          plusOneName,
          contactEmail: party.contact_email || contactEmail,
          address,
          link: `${origin}/r/${party.access_token}`,
        });
        setCopied(false);
        setAddressOpen(false);
        formRef.current?.reset();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not create party.",
        );
      }
    });
  }

  const successOpen = created !== null;
  const successBody = created ? (
    <CreatedPartyBody
      created={created}
      copied={copied}
      onCopy={() => copyLink(created.link)}
    />
  ) : null;

  const primaryAction = created ? (
    canShare ? (
      <button
        type="button"
        onClick={() => shareLink(created)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black"
      >
        <Share2 className="size-4" />
        Share invite link
      </button>
    ) : (
      <button
        type="button"
        onClick={() => copyLink(created.link)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black"
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy invite link
          </>
        )}
      </button>
    )
  ) : null;

  const secondaryCopy =
    created && canShare ? (
      <button
        type="button"
        onClick={() => copyLink(created.link)}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs uppercase tracking-[0.18em]"
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy link
          </>
        )}
      </button>
    ) : null;

  return (
    <section className="mb-8 rounded-[1.75rem] bg-[#161616] p-4 sm:mb-12 sm:p-6">
      <form
        ref={formRef}
        action={onSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <p className="font-medium text-2xl">Add party</p>
          <p className="mt-1 text-sm text-[#8e8e8e]">
            Create a household and get their invite link.
          </p>
        </div>

        {error ? (
          <p className="border-l-2 border-[#ff453a] bg-[#2c1515] px-3 py-2 text-sm text-[#ffb4ab] md:col-span-2">
            {error}
          </p>
        ) : null}

        <label className="text-sm">
          Party name
          <input
            name="party_name"
            required
            className={fieldClass}
            placeholder="The Smiths"
            autoComplete="organization"
          />
        </label>
        <label className="text-sm">
          Email{" "}
          <span className="text-[#8e8e8e]">(optional)</span>
          <input
            name="contact_email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          Plus-one slot{" "}
          <span className="text-[#8e8e8e]">(optional)</span>
          <input
            name="plus_one_name"
            className={fieldClass}
            placeholder="Guest of Alex"
          />
        </label>
        <label className="text-sm md:col-span-2">
          Guest names{" "}
          <span className="text-[#8e8e8e]">(one per line)</span>
          <textarea
            name="guest_names"
            required
            rows={3}
            className={fieldClass}
            placeholder={"Alex Smith\nJamie Smith"}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Notes
          <textarea name="notes" rows={2} className={fieldClass} />
        </label>

        <Collapsible
          open={addressOpen}
          onOpenChange={setAddressOpen}
          className="md:col-span-2 border-t border-white/10 pt-3"
        >
          <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-between gap-3 py-1 text-left">
            <div>
              <p className="font-medium text-lg sm:text-xl">
                Mailing address{" "}
                <span className="text-sm font-sans text-[#8e8e8e]">
                  (optional)
                </span>
              </p>
              <p className="mt-0.5 text-sm text-[#8e8e8e]">
                {addressOpen
                  ? "Leave blank to collect via save-the-date."
                  : "Tap to add an address you already have."}
              </p>
            </div>
            <ChevronDown
              className={`size-5 shrink-0 text-[#8e8e8e] transition-transform ${
                addressOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              Address line 1
              <input
                name="address_line1"
                className={fieldClass}
                autoComplete="address-line1"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Address line 2
              <input
                name="address_line2"
                className={fieldClass}
                autoComplete="address-line2"
              />
            </label>
            <label className="text-sm">
              City
              <input
                name="city"
                className={fieldClass}
                autoComplete="address-level2"
              />
            </label>
            <label className="text-sm">
              State
              <input
                name="state"
                className={fieldClass}
                autoComplete="address-level1"
              />
            </label>
            <label className="text-sm">
              Postal code
              <input
                name="postal_code"
                className={fieldClass}
                autoComplete="postal-code"
                inputMode="numeric"
              />
            </label>
            <label className="text-sm">
              Country
              <input
                name="country"
                defaultValue="US"
                className={fieldClass}
                autoComplete="country-name"
              />
            </label>
          </CollapsibleContent>
        </Collapsible>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-12 w-full rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black disabled:opacity-60 md:col-span-2 md:w-fit"
        >
          {isPending ? "Creating…" : "Create party + invite link"}
        </button>
      </form>

      {isMobile ? (
        <Drawer
          open={successOpen}
          onOpenChange={(open) => {
            if (!open) closeCreated();
          }}
        >
          <DrawerContent className="plan scheme-light gap-0 border-0 bg-[#101010] p-0 text-white before:inset-0 before:rounded-t-2xl before:bg-[#101010] data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-white/20" />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-2">
              <DrawerHeader className="gap-1 px-0 pb-3 pt-2 text-left">
                <DrawerTitle className="font-medium text-2xl font-normal">
                  Party created
                </DrawerTitle>
                <DrawerDescription className="text-[#8e8e8e]">
                  Share or copy their personalized link.
                </DrawerDescription>
              </DrawerHeader>
              {successBody}
            </div>
            <DrawerFooter className="gap-2 border-t border-white/10 bg-[#161616] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {primaryAction}
              {secondaryCopy}
              <DrawerClose asChild>
                <button
                  type="button"
                  className="min-h-11 w-full text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
                >
                  Done
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={successOpen}
          onOpenChange={(open) => {
            if (!open) closeCreated();
          }}
        >
          <DialogContent className="plan scheme-light max-w-md rounded-[1.75rem] border border-white/10 bg-[#101010] text-white ring-0">
            <DialogHeader>
              <DialogTitle className="font-medium text-2xl font-normal">
                Party created
              </DialogTitle>
              <DialogDescription className="text-[#8e8e8e]">
                Share or copy their personalized link.
              </DialogDescription>
            </DialogHeader>
            {successBody}
            <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              {primaryAction}
              {secondaryCopy}
              <button
                type="button"
                onClick={closeCreated}
                className="min-h-11 w-full text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
              >
                Done
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

function CreatedPartyBody({
  created,
  copied,
  onCopy,
}: {
  created: CreatedPartySummary;
  copied: boolean;
  onCopy: () => void;
}) {
  const guests = [
    ...created.guestNames,
    ...(created.plusOneName ? [`${created.plusOneName} (+1)`] : []),
  ];

  return (
    <div className="space-y-4 text-left">
      <div>
        <p className="font-medium text-xl">{created.partyName}</p>
        {guests.length ? (
          <p className="mt-1 text-sm leading-relaxed text-[#8e8e8e]">
            {guests.join(" · ")}
          </p>
        ) : null}
        {created.contactEmail ? (
          <p className="mt-1 break-words text-sm text-[#8e8e8e]">
            {created.contactEmail}
          </p>
        ) : null}
        {created.address ? (
          <p className="mt-1 break-words text-sm text-[#8e8e8e]">
            {created.address}
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#8e8e8e]">
          <Link2 className="size-3.5" />
          Personalized link
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="w-full break-all bg-[#161616] px-3 py-3 text-left text-sm leading-relaxed ring-1 ring-white/10"
        >
          {created.link}
        </button>
        <p className="mt-2 text-xs text-[#8e8e8e]">
          {copied ? "Link copied to clipboard." : "Tap the link to copy."}
        </p>
      </div>
    </div>
  );
}
