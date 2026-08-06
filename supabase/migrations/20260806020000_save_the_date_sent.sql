-- Track whether a save-the-date has been mailed / sent to each household

ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS save_the_date_sent_at timestamptz;

COMMENT ON COLUMN public.parties.save_the_date_sent_at IS
  'Set when the couple marks the save-the-date as sent (mail or digital).';
