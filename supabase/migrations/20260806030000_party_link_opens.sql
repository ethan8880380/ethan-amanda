-- Track when guests open their personalized /r/{token} link

ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS link_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS link_last_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS link_open_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.parties.link_opened_at IS
  'First time get_party was called for this household token (guest opened the link).';
COMMENT ON COLUMN public.parties.link_last_opened_at IS
  'Most recent get_party call for this household token.';
COMMENT ON COLUMN public.parties.link_open_count IS
  'Number of successful get_party loads for this household token.';

-- Record opens whenever a guest loads their party via token
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

  UPDATE public.parties
  SET
    link_opened_at = coalesce(link_opened_at, now()),
    link_last_opened_at = now(),
    link_open_count = coalesce(link_open_count, 0) + 1
  WHERE id = v_party.id;

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

COMMENT ON FUNCTION public.get_party(text) IS
  'Anon-safe: returns the party matching p_token plus guests and guest_phase. Records a link open. Omits access_token.';
