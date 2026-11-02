-- Shared-link RSVPs from /wedding land in parties + guests.
-- source distinguishes planner-created households from website replies.
-- sort_order preserves the order names were entered.

ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

ALTER TABLE public.parties
  DROP CONSTRAINT IF EXISTS parties_source_check;

ALTER TABLE public.parties
  ADD CONSTRAINT parties_source_check CHECK (source IN ('manual', 'website'));

COMMENT ON COLUMN public.parties.source IS
  'manual = created in the planning portal; website = submitted from the shared wedding RSVP form.';

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.guests.sort_order IS
  'Order of guests within a party, as entered. Planner-created rows stay at 0 and fall back to plus-one then created_at.';

CREATE OR REPLACE FUNCTION public.submit_website_rsvp(
  p_token text,
  p_email text,
  p_party_name text,
  p_guests jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party_id uuid;
  v_token text;
  v_guest jsonb;
  v_index integer := 0;
  v_name text;
  v_attending boolean;
  v_dietary text;
  v_email text;
  v_any_attending boolean := false;
  v_count integer;
BEGIN
  IF p_guests IS NULL OR jsonb_typeof(p_guests) <> 'array' THEN
    RAISE EXCEPTION 'guests_required' USING ERRCODE = 'P0003';
  END IF;

  v_count := jsonb_array_length(p_guests);
  IF v_count < 1 OR v_count > 10 THEN
    RAISE EXCEPTION 'guest_count_invalid' USING ERRCODE = 'P0003';
  END IF;

  IF p_party_name IS NULL OR char_length(trim(p_party_name)) = 0 OR char_length(trim(p_party_name)) > 180 THEN
    RAISE EXCEPTION 'party_name_invalid' USING ERRCODE = 'P0003';
  END IF;

  v_email := NULLIF(trim(coalesce(p_email, '')), '');
  IF v_email IS NOT NULL AND char_length(v_email) > 254 THEN
    RAISE EXCEPTION 'email_invalid' USING ERRCODE = 'P0003';
  END IF;

  FOR v_guest IN SELECT value FROM jsonb_array_elements(p_guests)
  LOOP
    v_name := NULLIF(trim(coalesce(v_guest->>'full_name', '')), '');
    IF v_name IS NULL OR char_length(v_name) > 80 THEN
      RAISE EXCEPTION 'guest_name_invalid' USING ERRCODE = 'P0003';
    END IF;

    IF (v_guest->>'attending') IS NULL
      OR (v_guest->>'attending') NOT IN ('true', 'false') THEN
      RAISE EXCEPTION 'attending_required' USING ERRCODE = 'P0003';
    END IF;

    v_dietary := NULLIF(trim(coalesce(v_guest->>'dietary_notes', '')), '');
    IF v_dietary IS NOT NULL AND char_length(v_dietary) > 400 THEN
      RAISE EXCEPTION 'dietary_notes_too_long' USING ERRCODE = 'P0003';
    END IF;
  END LOOP;

  IF p_token IS NOT NULL AND char_length(trim(p_token)) >= 16 THEN
    SELECT id, access_token
    INTO v_party_id, v_token
    FROM public.parties
    WHERE access_token = trim(p_token)
      AND source = 'website'
    FOR UPDATE;
  END IF;

  IF v_party_id IS NULL THEN
    INSERT INTO public.parties (
      party_name,
      contact_email,
      source,
      rsvp_status,
      rsvp_submitted_at
    )
    VALUES (
      trim(p_party_name),
      v_email,
      'website',
      'pending',
      now()
    )
    RETURNING id, access_token INTO v_party_id, v_token;
  ELSE
    UPDATE public.parties
    SET
      party_name = trim(p_party_name),
      contact_email = v_email,
      rsvp_submitted_at = now()
    WHERE id = v_party_id;
  END IF;

  DELETE FROM public.guests WHERE party_id = v_party_id;

  FOR v_guest IN SELECT value FROM jsonb_array_elements(p_guests)
  LOOP
    v_name := trim(v_guest->>'full_name');
    v_attending := (v_guest->>'attending')::boolean;
    v_dietary := NULLIF(trim(coalesce(v_guest->>'dietary_notes', '')), '');

    IF v_attending IS NOT TRUE THEN
      v_dietary := NULL;
    ELSE
      v_any_attending := true;
    END IF;

    INSERT INTO public.guests (
      party_id,
      full_name,
      is_plus_one,
      attending,
      meal_choice,
      dietary_notes,
      sort_order
    )
    VALUES (
      v_party_id,
      v_name,
      false,
      v_attending,
      NULL,
      v_dietary,
      v_index
    );

    v_index := v_index + 1;
  END LOOP;

  UPDATE public.parties
  SET
    rsvp_status = CASE
      WHEN v_any_attending THEN 'attending'::public.rsvp_status
      ELSE 'declined'::public.rsvp_status
    END,
    rsvp_submitted_at = now()
  WHERE id = v_party_id;

  RETURN jsonb_build_object(
    'party_id', v_party_id,
    'access_token', v_token
  );
END;
$$;

COMMENT ON FUNCTION public.submit_website_rsvp(text, text, text, jsonb) IS
  'Service-role only. Creates or updates one website RSVP party and replaces its guests in a single transaction.';

REVOKE ALL ON FUNCTION public.submit_website_rsvp(text, text, text, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_website_rsvp(text, text, text, jsonb) TO service_role;

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
      ORDER BY g.sort_order ASC, g.is_plus_one ASC, g.created_at ASC
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
      'food_allergies', v_party.food_allergies,
      'created_at', v_party.created_at,
      'updated_at', v_party.updated_at
    ),
    'guests', v_guests,
    'guest_phase', coalesce(v_phase, 'save_the_date')
  );
END;
$$;
