"use client";

import { useState, useTransition } from "react";
import { type PartyPayload, updateAddress } from "@/lib/guests";
import { weddingContent as c } from "@/lib/wedding-content";

interface AddressFormProps {
  token: string;
  initial: PartyPayload;
  onSaved?: () => void;
}

export function AddressForm({ token, initial, onSaved }: AddressFormProps) {
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
          food_allergies:
            String(formData.get("food_allergies") ?? "").trim() || null,
        });
        setPayload(next);
        setMessage(c.saveTheDate.addressThanks);
        onSaved?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save address");
      }
    });
  }

  return (
    <div className="w-full">
      {message ? (
        <p className="mb-3 border-l-2 border-[#171512] bg-[#171512]/[0.04] px-3 py-2 text-sm text-[#171512]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 border-l-2 border-[#e11d2e] bg-[#e11d2e]/[0.06] px-3 py-2 text-sm text-[#7a1520]">
          {error}
        </p>
      ) : null}

      <form action={onSubmit} className="space-y-2.5">
        <input type="hidden" name="country" value={party.country || "US"} />

        <Field
          label="Street address"
          name="address_line1"
          required
          defaultValue={party.address_line1}
          autoComplete="address-line1"
          placeholder="123 Main St"
        />
        <Field
          label="Apt / suite"
          name="address_line2"
          defaultValue={party.address_line2}
          autoComplete="address-line2"
          placeholder="Optional"
        />

        <div className="flex w-full gap-2">
          <Field
            className="min-w-0 flex-1"
            label="City"
            name="city"
            defaultValue={party.city}
            autoComplete="address-level2"
          />
          <div className="flex min-w-0 flex-1 gap-2">
            <Field
              className="min-w-0 flex-1"
              label="State"
              name="state"
              defaultValue={party.state}
              autoComplete="address-level1"
            />
            <Field
              className="min-w-0 flex-1"
              label="ZIP"
              name="postal_code"
              defaultValue={party.postal_code}
              autoComplete="postal-code"
            />
          </div>
        </div>

        <div className="flex w-full gap-2">
          <Field
            className="min-w-0 flex-1"
            label="Email"
            name="contact_email"
            type="email"
            defaultValue={party.contact_email}
            autoComplete="email"
          />
          <Field
            className="min-w-0 flex-1"
            label="Phone"
            name="contact_phone"
            type="tel"
            defaultValue={party.contact_phone}
            autoComplete="tel"
          />
        </div>

        <label className="block w-full pt-0.5 text-[12px] text-[#5c564e]">
          <span className="mb-1 block">Food allergies</span>
          <textarea
            name="food_allergies"
            rows={2}
            defaultValue={party.food_allergies ?? ""}
            placeholder="None, or list any for your household"
            className="w-full resize-none border border-[#e8e8e8] bg-white px-3 py-2 text-[15px] text-[#171512] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#171512]"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full bg-[#171512] px-4 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#ffffff] transition md:hover:bg-[#e11d2e] disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save details"}
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
  autoComplete,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-[12px] text-[#5c564e] ${className ?? ""}`}>
      <span className="mb-1 block">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full min-w-0 border border-[#e8e8e8] bg-white px-3 py-2 text-[15px] text-[#171512] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#171512]"
      />
    </label>
  );
}
