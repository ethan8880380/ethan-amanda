-- Household food allergies collected during save-the-date address form

ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS food_allergies text;

COMMENT ON COLUMN public.parties.food_allergies IS
  'Household food allergies / dietary restrictions from save-the-date form.';

-- Recreate get_party to include food_allergies
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
      'food_allergies', v_party.food_allergies,
      'created_at', v_party.created_at,
      'updated_at', v_party.updated_at
    ),
    'guests', v_guests,
    'guest_phase', coalesce(v_phase, 'save_the_date')
  );
END;
$$;

-- Replace update_address with food_allergies param (drop old signature first)
DROP FUNCTION IF EXISTS public.update_address(text, text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.update_address(
  p_token text,
  p_address_line1 text,
  p_address_line2 text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_country text DEFAULT 'US',
  p_contact_email text DEFAULT NULL,
  p_contact_phone text DEFAULT NULL,
  p_food_allergies text DEFAULT NULL
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
    food_allergies = NULLIF(trim(coalesce(p_food_allergies, '')), ''),
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
  'Anon-safe: updates mailing address, optional contact, and household food allergies for the party matching p_token only.';

REVOKE ALL ON FUNCTION public.update_address(text, text, text, text, text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_address(text, text, text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;
