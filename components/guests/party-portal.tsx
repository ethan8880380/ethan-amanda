"use client";

import { useState, useTransition } from "react";
import {
  MEAL_CHOICES,
  type MealChoice,
  type PartyPayload,
  submitRsvp,
} from "@/lib/guests";

interface PartyPortalProps {
  token: string;
  initial: PartyPayload;
}

export function PartyPortal({ token, initial }: PartyPortalProps) {
  const [payload, setPayload] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { party, guests } = payload;

  function onRsvpSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const responses = guests.map((guest) => {
          const attending = formData.get(`attending_${guest.id}`) === "yes";
          const meal = String(
            formData.get(`meal_${guest.id}`) ?? "",
          ) as MealChoice | "";
          return {
            guest_id: guest.id,
            attending,
            meal_choice: attending && meal ? meal : null,
            dietary_notes:
              String(formData.get(`dietary_${guest.id}`) ?? "") || null,
          };
        });
        const next = await submitRsvp(token, responses);
        setPayload(next);
        setMessage("RSVP received — thank you!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not submit RSVP");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[#8a7462]">
        Ethan & Amanda
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#1c1714]">
        {party.party_name || "Your invitation"}
      </h1>
      <p className="mt-3 text-[#6f6258]">
        Please RSVP for everyone in your party.
      </p>

      {message ? (
        <p className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form action={onRsvpSubmit} className="mt-10 space-y-8">
        {guests.map((guest) => (
          <fieldset
            key={guest.id}
            className="border border-[#e4ddd4] bg-white/70 p-5"
          >
            <legend className="px-2 font-serif text-xl">
              {guest.full_name}
              {guest.is_plus_one ? (
                <span className="ml-2 text-sm text-[#6f6258]">(+1)</span>
              ) : null}
            </legend>
            <div className="mt-3 flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`attending_${guest.id}`}
                  value="yes"
                  defaultChecked={guest.attending === true}
                  required
                />
                Attending
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`attending_${guest.id}`}
                  value="no"
                  defaultChecked={guest.attending === false}
                  required
                />
                Declines
              </label>
            </div>
            <label className="mt-4 block text-sm">
              Meal choice
              <select
                name={`meal_${guest.id}`}
                defaultValue={guest.meal_choice ?? ""}
                className="mt-1 w-full border border-[#d9d0c5] bg-white px-3 py-2"
              >
                <option value="">Select if attending</option>
                {MEAL_CHOICES.map((meal) => (
                  <option key={meal.value} value={meal.value}>
                    {meal.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm">
              Dietary notes
              <input
                name={`dietary_${guest.id}`}
                defaultValue={guest.dietary_notes ?? ""}
                className="mt-1 w-full border border-[#d9d0c5] bg-white px-3 py-2"
              />
            </label>
          </fieldset>
        ))}
        <button
          type="submit"
          disabled={isPending || guests.length === 0}
          className="w-full bg-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee] disabled:opacity-60"
        >
          {isPending ? "Submitting…" : "Submit RSVP"}
        </button>
      </form>
    </div>
  );
}
