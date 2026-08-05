"use client";

import { useState, useTransition } from "react";
import {
  type PartyPayload,
  updateAddress,
} from "@/lib/guests";
import { weddingContent as c } from "@/lib/wedding-content";

interface AddressFormProps {
  token: string;
  initial: PartyPayload;
}

export function AddressForm({ token, initial }: AddressFormProps) {
  const [payload, setPayload] = useState(initial);
  const [message, setMessage] = useState<string | null>(
    initial.party.address_collected_at ? c.saveTheDate.addressThanks : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { party } = payload;

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const next = await updateAddress(token, {
          address_line1: String(formData.get("address_line1") ?? ""),
          address_line2: String(formData.get("address_line2") ?? "") || null,
          city: String(formData.get("city") ?? "") || null,
          state: String(formData.get("state") ?? "") || null,
          postal_code: String(formData.get("postal_code") ?? "") || null,
          country: String(formData.get("country") ?? "US") || "US",
          contact_email: String(formData.get("contact_email") ?? "") || null,
          contact_phone: String(formData.get("contact_phone") ?? "") || null,
        });
        setPayload(next);
        setMessage(c.saveTheDate.addressThanks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save address");
      }
    });
  }

  return (
    <div className="w-full max-w-lg">
      {party.party_name ? (
        <p className="mb-4 text-sm text-[#8a7462]">For {party.party_name}</p>
      ) : null}

      {message ? (
        <p className="mb-5 border border-emerald-800/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-5 border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <form action={onSubmit} className="space-y-4">
        <Field
          label="Address line 1"
          name="address_line1"
          required
          defaultValue={party.address_line1}
        />
        <Field
          label="Address line 2"
          name="address_line2"
          defaultValue={party.address_line2}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" defaultValue={party.city} />
          <Field label="State" name="state" defaultValue={party.state} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Postal code"
            name="postal_code"
            defaultValue={party.postal_code}
          />
          <Field
            label="Country"
            name="country"
            defaultValue={party.country || "US"}
          />
        </div>
        <Field
          label="Email"
          name="contact_email"
          type="email"
          defaultValue={party.contact_email}
        />
        <Field
          label="Phone"
          name="contact_phone"
          defaultValue={party.contact_phone}
        />
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full bg-[#1c1714] px-4 py-3.5 text-xs uppercase tracking-[0.2em] text-[#f7f3ee] transition hover:bg-[#e11d2e] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save mailing address"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm text-[#4d433c]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-1.5 w-full border border-[#d4c8b8] bg-white/80 px-3 py-2.5 outline-none transition focus:border-[#1c1714]"
      />
    </label>
  );
}
