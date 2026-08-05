-- Guest management: parties + guests with tokenized anon access via SECURITY DEFINER RPCs.
-- Idempotent: safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.rsvp_status AS ENUM ('pending', 'attending', 'declined');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.meal_choice AS ENUM (
    'beef',
    'chicken',
    'fish',
    'vegetarian',
    'vegan',
    'kids',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.guest_phase AS ENUM ('save_the_date', 'invite');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.rsvp_status IS 'Household-level RSVP outcome for a party.';
COMMENT ON TYPE public.meal_choice IS 'Per-guest meal selection during invite/RSVP phase.';
COMMENT ON TYPE public.guest_phase IS 'Which guest-facing form the personalized link should show.';

-- ---------------------------------------------------------------------------
-- Helpers: updated_at trigger + url-safe token
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_access_token(byte_length integer DEFAULT 18)
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT rtrim(
    translate(encode(extensions.gen_random_bytes(byte_length), 'base64'), '+/', '-_'),
    '='
  );
$$;

COMMENT ON FUNCTION public.generate_access_token(integer) IS
  'URL-safe, collision-resistant token for personalized /r/{token} links.';

-- ---------------------------------------------------------------------------
-- wedding_settings (single-row phase control)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wedding_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  guest_phase public.guest_phase NOT NULL DEFAULT 'save_the_date',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wedding_settings IS
  'Singleton settings row. guest_phase flips the /r/{token} experience between address collection and RSVP.';
COMMENT ON COLUMN public.wedding_settings.guest_phase IS
  'save_the_date = collect mailing address; invite = collect RSVP + meal choices.';

DROP TRIGGER IF EXISTS wedding_settings_set_updated_at ON public.wedding_settings;
CREATE TRIGGER wedding_settings_set_updated_at
  BEFORE UPDATE ON public.wedding_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.wedding_settings (id, guest_phase)
VALUES (1, 'save_the_date')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- parties
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL DEFAULT public.generate_access_token(),
  party_name text,
  contact_email text,
  contact_phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  address_collected_at timestamptz,
  rsvp_status public.rsvp_status NOT NULL DEFAULT 'pending',
  rsvp_submitted_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parties_access_token_nonempty CHECK (char_length(access_token) >= 16)
);

CREATE UNIQUE INDEX IF NOT EXISTS parties_access_token_uidx
  ON public.parties (access_token);

COMMENT ON TABLE public.parties IS
  'Invite group / household. Guests never log in — they use a personalized /r/{access_token} link.';
COMMENT ON COLUMN public.parties.access_token IS
  'Secret URL-safe token. Knowing it is the only guest credential; never expose in list APIs.';
COMMENT ON COLUMN public.parties.address_collected_at IS
  'Set when the household submits their mailing address during save-the-date phase.';
COMMENT ON COLUMN public.parties.rsvp_status IS
  'Derived household RSVP status after submit_rsvp (pending until first RSVP submit).';
COMMENT ON COLUMN public.parties.rsvp_submitted_at IS
  'Set on each successful submit_rsvp call.';

DROP TRIGGER IF EXISTS parties_set_updated_at ON public.parties;
CREATE TRIGGER parties_set_updated_at
  BEFORE UPDATE ON public.parties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  is_plus_one boolean NOT NULL DEFAULT false,
  attending boolean,
  meal_choice public.meal_choice,
  dietary_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guests_party_id_idx ON public.guests (party_id);

COMMENT ON TABLE public.guests IS
  'Individuals within a party. Plus-ones are pre-created by admin (is_plus_one = true); guests cannot add people via anon RPCs.';
COMMENT ON COLUMN public.guests.is_plus_one IS
  'True when this row is an optional +1 slot created by the couple/admin ahead of time.';
COMMENT ON COLUMN public.guests.attending IS
  'Null until RSVP; true/false after submit_rsvp.';

DROP TRIGGER IF EXISTS guests_set_updated_at ON public.guests;
CREATE TRIGGER guests_set_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: deny anon direct table access; service_role bypasses RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;

-- Drop any prior open policies if re-running
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('parties', 'guests', 'wedding_settings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Authenticated (dashboard user) full access via RLS policies.
-- Service role bypasses RLS entirely for server-side admin.
CREATE POLICY parties_authenticated_all ON public.parties
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY guests_authenticated_all ON public.guests
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY wedding_settings_authenticated_all ON public.wedding_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Explicit table privilege posture for anon
REVOKE ALL ON TABLE public.parties FROM anon, public;
REVOKE ALL ON TABLE public.guests FROM anon, public;
REVOKE ALL ON TABLE public.wedding_settings FROM anon, public;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.parties TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.guests TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wedding_settings TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RPC: get_party
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_party(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party public.parties%ROWTYPE;
  v_guests jsonb;
  v_phase public.guest_phase;
BEGIN
  IF p_token IS NULL OR char_length(trim(p_token)) < 16 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_party
  FROM public.parties
  WHERE access_token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', g.id,
        'party_id', g.party_id,
        'full_name', g.full_name,
        'is_plus_one', g.is_plus_one,
        'attending', g.attending,
        'meal_choice', g.meal_choice,
        'dietary_notes', g.dietary_notes,
        'created_at', g.created_at,
        'updated_at', g.updated_at
      )
      ORDER BY g.is_plus_one ASC, g.created_at ASC
    ),
    '[]'::jsonb
  )
  INTO v_guests
  FROM public.guests g
  WHERE g.party_id = v_party.id;

  SELECT guest_phase INTO v_phase FROM public.wedding_settings WHERE id = 1;

  RETURN jsonb_build_object(
    'party', jsonb_build_object(
      'id', v_party.id,
      'party_name', v_party.party_name,
      'contact_email', v_party.contact_email,
      'contact_phone', v_party.contact_phone,
      'address_line1', v_party.address_line1,
      'address_line2', v_party.address_line2,
      'city', v_party.city,
      'state', v_party.state,
      'postal_code', v_party.postal_code,
      'country', v_party.country,
      'address_collected_at', v_party.address_collected_at,
      'rsvp_status', v_party.rsvp_status,
      'rsvp_submitted_at', v_party.rsvp_submitted_at,
      'notes', v_party.notes,
      'created_at', v_party.created_at,
      'updated_at', v_party.updated_at
    ),
    'guests', v_guests,
    'guest_phase', coalesce(v_phase, 'save_the_date')
  );
END;
$$;

COMMENT ON FUNCTION public.get_party(text) IS
  'Anon-safe: returns only the party matching p_token plus its guests and current guest_phase. Omits access_token.';

-- ---------------------------------------------------------------------------
-- RPC: update_address
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_address(
  p_token text,
  p_address_line1 text,
  p_address_line2 text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_country text DEFAULT 'US',
  p_contact_email text DEFAULT NULL,
  p_contact_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party_id uuid;
BEGIN
  IF p_token IS NULL OR char_length(trim(p_token)) < 16 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  IF p_address_line1 IS NULL OR char_length(trim(p_address_line1)) = 0 THEN
    RAISE EXCEPTION 'address_line1_required' USING ERRCODE = 'P0003';
  END IF;

  UPDATE public.parties
  SET
    address_line1 = trim(p_address_line1),
    address_line2 = NULLIF(trim(coalesce(p_address_line2, '')), ''),
    city = NULLIF(trim(coalesce(p_city, '')), ''),
    state = NULLIF(trim(coalesce(p_state, '')), ''),
    postal_code = NULLIF(trim(coalesce(p_postal_code, '')), ''),
    country = coalesce(NULLIF(trim(coalesce(p_country, '')), ''), 'US'),
    contact_email = coalesce(NULLIF(trim(coalesce(p_contact_email, '')), ''), contact_email),
    contact_phone = coalesce(NULLIF(trim(coalesce(p_contact_phone, '')), ''), contact_phone),
    address_collected_at = now()
  WHERE access_token = p_token
  RETURNING id INTO v_party_id;

  IF v_party_id IS NULL THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN public.get_party(p_token);
END;
$$;

COMMENT ON FUNCTION public.update_address IS
  'Anon-safe: updates mailing address (+ optional contact) for the party matching p_token only.';

-- ---------------------------------------------------------------------------
-- RPC: submit_rsvp
-- p_responses: jsonb array of
--   { "guest_id": uuid, "attending": bool, "meal_choice": meal_choice|null, "dietary_notes": text|null }
-- Plus-one rule: guests may only update existing guest rows that belong to this party.
-- Admin pre-creates plus-one slots; anon cannot insert/delete guests.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_token text,
  p_responses jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party public.parties%ROWTYPE;
  v_response jsonb;
  v_guest_id uuid;
  v_attending boolean;
  v_meal public.meal_choice;
  v_dietary text;
  v_updated_count integer := 0;
  v_any_attending boolean := false;
  v_any_response boolean := false;
  v_new_status public.rsvp_status;
BEGIN
  IF p_token IS NULL OR char_length(trim(p_token)) < 16 THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  IF p_responses IS NULL OR jsonb_typeof(p_responses) <> 'array' OR jsonb_array_length(p_responses) = 0 THEN
    RAISE EXCEPTION 'responses_required' USING ERRCODE = 'P0003';
  END IF;

  SELECT * INTO v_party
  FROM public.parties
  WHERE access_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  FOR v_response IN SELECT * FROM jsonb_array_elements(p_responses)
  LOOP
    IF v_response->>'guest_id' IS NULL THEN
      RAISE EXCEPTION 'guest_id_required' USING ERRCODE = 'P0003';
    END IF;

    v_guest_id := (v_response->>'guest_id')::uuid;
    v_attending := (v_response->>'attending')::boolean;
    v_dietary := NULLIF(trim(coalesce(v_response->>'dietary_notes', '')), '');

    IF v_response ? 'meal_choice' AND NULLIF(v_response->>'meal_choice', '') IS NOT NULL THEN
      v_meal := (v_response->>'meal_choice')::public.meal_choice;
    ELSE
      v_meal := NULL;
    END IF;

    IF v_attending IS NULL THEN
      RAISE EXCEPTION 'attending_required' USING ERRCODE = 'P0003';
    END IF;

    -- Attending guests should pick a meal (nullable only when declining)
    IF v_attending IS TRUE AND v_meal IS NULL THEN
      RAISE EXCEPTION 'meal_choice_required_when_attending' USING ERRCODE = 'P0003';
    END IF;

    IF v_attending IS FALSE THEN
      v_meal := NULL;
    END IF;

    UPDATE public.guests g
    SET
      attending = v_attending,
      meal_choice = v_meal,
      dietary_notes = v_dietary
    WHERE g.id = v_guest_id
      AND g.party_id = v_party.id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'guest_not_in_party' USING ERRCODE = 'P0004';
    END IF;

    v_updated_count := v_updated_count + 1;
    v_any_response := true;
    IF v_attending THEN
      v_any_attending := true;
    END IF;
  END LOOP;

  IF v_updated_count = 0 THEN
    RAISE EXCEPTION 'no_guests_updated' USING ERRCODE = 'P0003';
  END IF;

  IF v_any_attending THEN
    v_new_status := 'attending';
  ELSIF v_any_response THEN
    v_new_status := 'declined';
  ELSE
    v_new_status := 'pending';
  END IF;

  UPDATE public.parties
  SET
    rsvp_status = v_new_status,
    rsvp_submitted_at = now()
  WHERE id = v_party.id;

  RETURN public.get_party(p_token);
END;
$$;

COMMENT ON FUNCTION public.submit_rsvp(text, jsonb) IS
  'Anon-safe: updates RSVP fields for guests in the party matching p_token. Cannot create/delete guests.';

-- ---------------------------------------------------------------------------
-- RPC: get_guest_phase (optional convenience for the guest page)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_guest_phase()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT guest_phase::text FROM public.wedding_settings WHERE id = 1;
$$;

-- ---------------------------------------------------------------------------
-- Grants: anon may only EXECUTE the RPCs
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_party(text) FROM public;
REVOKE ALL ON FUNCTION public.update_address(text, text, text, text, text, text, text, text, text) FROM public;
REVOKE ALL ON FUNCTION public.submit_rsvp(text, jsonb) FROM public;
REVOKE ALL ON FUNCTION public.get_guest_phase() FROM public;

GRANT EXECUTE ON FUNCTION public.get_party(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_address(text, text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_guest_phase() TO anon, authenticated, service_role;
