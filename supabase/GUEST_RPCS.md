# Guest RPCs (anon access layer)

Guests never touch `parties` / `guests` tables directly. The browser uses the **anon** key and calls these RPCs with the household’s `access_token` from `/r/{token}`.

Admin CRUD uses the **service role** (server) or **authenticated** role — tables have RLS enabled and deny anon by default.

## Plus-one / household rule (locked in)

- Plus-one slots are **pre-created by admin** as `guests` rows with `is_plus_one = true`.
- `submit_rsvp` may only **update** guest rows that already belong to the party.
- Anon **cannot** insert or delete guests.

## Phase control

`wedding_settings.guest_phase` (singleton row `id = 1`):

- `save_the_date` → show address form
- `invite` → show RSVP + meal form

Returned on every `get_party` / mutation response as `guest_phase`.

---

## `get_party`

```ts
const { data, error } = await supabase.rpc("get_party", {
  p_token: token,
});
```

**Params**

| Name | Type | Notes |
|------|------|--------|
| `p_token` | `text` | Party `access_token` (≥ 16 chars) |

**Returns** `jsonb`

```json
{
  "party": {
    "id": "uuid",
    "party_name": "string|null",
    "contact_email": "string|null",
    "contact_phone": "string|null",
    "address_line1": "string|null",
    "address_line2": "string|null",
    "city": "string|null",
    "state": "string|null",
    "postal_code": "string|null",
    "country": "string|null",
    "address_collected_at": "timestamptz|null",
    "rsvp_status": "pending|attending|declined",
    "rsvp_submitted_at": "timestamptz|null",
    "notes": "string|null",
    "food_allergies": "string|null",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  },
  "guests": [
    {
      "id": "uuid",
      "party_id": "uuid",
      "full_name": "string",
      "is_plus_one": false,
      "attending": null,
      "meal_choice": null,
      "dietary_notes": null,
      "created_at": "timestamptz",
      "updated_at": "timestamptz"
    }
  ],
  "guest_phase": "save_the_date"
}
```

`access_token` is intentionally omitted from the payload.

**Errors:** `invalid_token` (`P0001`), `not_found` (`P0002`)

---

## `update_address`

```ts
const { data, error } = await supabase.rpc("update_address", {
  p_token: token,
  p_address_line1: "123 Main St",
  p_address_line2: "Apt 4",
  p_city: "Portland",
  p_state: "OR",
  p_postal_code: "97201",
  p_country: "US",
  p_contact_email: "guest@example.com",
  p_contact_phone: "555-0100",
  p_food_allergies: "Peanut allergy",
});
```

**Params**

| Name | Type | Required |
|------|------|----------|
| `p_token` | `text` | yes |
| `p_address_line1` | `text` | yes |
| `p_address_line2` | `text` | no |
| `p_city` | `text` | no |
| `p_state` | `text` | no |
| `p_postal_code` | `text` | no |
| `p_country` | `text` | no (default `US`) |
| `p_contact_email` | `text` | no |
| `p_contact_phone` | `text` | no |
| `p_food_allergies` | `text` | no |

Sets `address_collected_at = now()`. Returns the same shape as `get_party`.

---

## `submit_rsvp`

```ts
const { data, error } = await supabase.rpc("submit_rsvp", {
  p_token: token,
  p_responses: [
    {
      guest_id: "uuid",
      attending: true,
      meal_choice: "vegetarian",
      dietary_notes: "No nuts",
    },
    {
      guest_id: "uuid",
      attending: false,
      meal_choice: null,
      dietary_notes: null,
    },
  ],
});
```

**Params**

| Name | Type | Notes |
|------|------|--------|
| `p_token` | `text` | Party token |
| `p_responses` | `jsonb` | Non-empty array |

Each response object:

| Field | Type | Notes |
|-------|------|--------|
| `guest_id` | `uuid` | Must belong to this party |
| `attending` | `boolean` | Required |
| `meal_choice` | `meal_choice \| null` | Required when `attending` is true |
| `dietary_notes` | `text \| null` | Optional |

`meal_choice` enum: `beef` · `chicken` · `fish` · `vegetarian` · `vegan` · `kids` · `other`

Party `rsvp_status` becomes `attending` if any guest attends, else `declined`. Sets `rsvp_submitted_at`. Returns `get_party` shape.

---

## `get_guest_phase`

```ts
const { data } = await supabase.rpc("get_guest_phase");
// data: "save_the_date" | "invite"
```

---

## Generate TypeScript types

From `ethan-amanda` (with project linked or `--project-id`):

```bash
npx supabase gen types typescript --project-id nzbizsazoqlifovvwdzf --schema public > lib/database.types.ts
```

If you use the local CLI linked to this project:

```bash
npx supabase gen types typescript --linked --schema public > lib/database.types.ts
```
