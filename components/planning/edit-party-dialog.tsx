"use client";

import { useState, useTransition } from "react";
import { updateParty } from "@/app/plan/actions";
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

interface EditGuest {
  id: string;
  full_name: string;
  is_plus_one: boolean;
}

interface EditPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showGuests?: boolean;
  party: {
    id: string;
    party_name: string | null;
    contact_email: string | null;
    notes: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };
  guests: EditGuest[];
}

const fieldClass =
  "mt-1 w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base";

export function EditPartyDialog({
  open,
  onOpenChange,
  party,
  guests,
  showGuests = true,
}: EditPartyDialogProps) {
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const nextGuests = showGuests
      ? guests.map((guest) => ({
          id: guest.id,
          full_name: String(formData.get(`guest_name_${guest.id}`) ?? "").trim(),
          is_plus_one: formData.get(`guest_plus_${guest.id}`) === "on",
        }))
      : undefined;

    if (nextGuests?.some((guest) => !guest.full_name)) {
      setError("Every guest needs a name.");
      return;
    }

    startTransition(async () => {
      try {
        await updateParty({
          id: party.id,
          party_name: String(formData.get("party_name") ?? ""),
          contact_email: String(formData.get("contact_email") ?? "") || null,
          notes: String(formData.get("notes") ?? "") || null,
          address_line1: String(formData.get("address_line1") ?? "") || null,
          address_line2: String(formData.get("address_line2") ?? "") || null,
          city: String(formData.get("city") ?? "") || null,
          state: String(formData.get("state") ?? "") || null,
          postal_code: String(formData.get("postal_code") ?? "") || null,
          country: String(formData.get("country") ?? "") || null,
          ...(nextGuests ? { guests: nextGuests } : {}),
        });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save party.");
      }
    });
  }

  const form = (
    <form
      key={`${party.id}-${open}`}
      id={`edit-party-${party.id}`}
      action={onSubmit}
      className="grid gap-4"
    >
      {error ? (
        <p className="border-l-2 border-[#ff453a] bg-[#2c1515] px-3 py-2 text-sm text-[#ffb4ab]">
          {error}
        </p>
      ) : null}

      <label className="text-sm">
        Party name
        <input
          name="party_name"
          required
          defaultValue={party.party_name ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="text-sm">
        Email <span className="text-[#8e8e8e]">(optional)</span>
        <input
          name="contact_email"
          type="email"
          inputMode="email"
          defaultValue={party.contact_email ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="text-sm">
        Notes
        <textarea
          name="notes"
          rows={2}
          defaultValue={party.notes ?? ""}
          className={fieldClass}
        />
      </label>

      {showGuests && guests.length ? (
        <div className="border-t border-white/10 pt-3">
          <p className="font-medium text-lg">Guests</p>
          <ul className="mt-3 space-y-3">
            {guests.map((guest) => (
              <li key={guest.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  name={`guest_name_${guest.id}`}
                  required
                  defaultValue={guest.full_name}
                  className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-base"
                />
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`guest_plus_${guest.id}`}
                    defaultChecked={guest.is_plus_one}
                    className="size-4 accent-white"
                  />
                  Plus-one
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 border-t border-white/10 pt-3 md:grid-cols-2">
        <p className="font-medium text-lg md:col-span-2">Mailing address</p>
        <label className="text-sm md:col-span-2">
          Address line 1
          <input
            name="address_line1"
            defaultValue={party.address_line1 ?? ""}
            className={fieldClass}
            autoComplete="address-line1"
          />
        </label>
        <label className="text-sm md:col-span-2">
          Address line 2
          <input
            name="address_line2"
            defaultValue={party.address_line2 ?? ""}
            className={fieldClass}
            autoComplete="address-line2"
          />
        </label>
        <label className="text-sm">
          City
          <input
            name="city"
            defaultValue={party.city ?? ""}
            className={fieldClass}
            autoComplete="address-level2"
          />
        </label>
        <label className="text-sm">
          State
          <input
            name="state"
            defaultValue={party.state ?? ""}
            className={fieldClass}
            autoComplete="address-level1"
          />
        </label>
        <label className="text-sm">
          Postal code
          <input
            name="postal_code"
            defaultValue={party.postal_code ?? ""}
            className={fieldClass}
            autoComplete="postal-code"
            inputMode="numeric"
          />
        </label>
        <label className="text-sm">
          Country
          <input
            name="country"
            defaultValue={party.country ?? "US"}
            className={fieldClass}
            autoComplete="country-name"
          />
        </label>
      </div>
    </form>
  );

  const saveButton = (
    <button
      type="submit"
      form={`edit-party-${party.id}`}
      disabled={isPending}
      className="flex min-h-12 w-full items-center justify-center rounded-full bg-white px-4 text-xs uppercase tracking-[0.18em] text-black disabled:opacity-60"
    >
      {isPending ? "Saving…" : "Save changes"}
    </button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="plan scheme-dark gap-0 border-0 bg-[#101010] p-0 text-white before:inset-0 before:rounded-t-2xl before:bg-[#101010] data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-white/20" />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-2">
            <DrawerHeader className="gap-1 px-0 pb-3 pt-2 text-left">
              <DrawerTitle className="font-medium text-2xl font-normal">
                Edit party
              </DrawerTitle>
              <DrawerDescription className="text-[#8e8e8e]">
                Fix names, plus-ones, or the mailing address.
              </DrawerDescription>
            </DrawerHeader>
            {form}
          </div>
          <DrawerFooter className="gap-2 border-t border-white/10 bg-[#161616] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {saveButton}
            <DrawerClose asChild>
              <button
                type="button"
                className="min-h-11 w-full text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
              >
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="plan scheme-dark max-h-[90vh] max-w-lg overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#101010] text-white ring-0">
        <DialogHeader>
          <DialogTitle className="font-medium text-2xl font-normal">
            Edit party
          </DialogTitle>
          <DialogDescription className="text-[#8e8e8e]">
            Fix names, plus-ones, or the mailing address.
          </DialogDescription>
        </DialogHeader>
        {form}
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          {saveButton}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-11 w-full text-xs uppercase tracking-[0.18em] text-[#8e8e8e]"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
