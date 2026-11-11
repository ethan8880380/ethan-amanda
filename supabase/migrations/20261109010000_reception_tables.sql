-- Reception seating for the print studio.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.reception_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reception_tables IS
  'Reception tables for seating charts, escort cards, and table numbers.';

DROP TRIGGER IF EXISTS reception_tables_set_updated_at ON public.reception_tables;
CREATE TRIGGER reception_tables_set_updated_at
  BEFORE UPDATE ON public.reception_tables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES public.reception_tables (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.guests.table_id IS
  'Reception table for printed seating. Null until the couple assigns a seat.';

CREATE INDEX IF NOT EXISTS guests_table_id_idx ON public.guests (table_id);

ALTER TABLE public.reception_tables ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reception_tables'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.reception_tables', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY reception_tables_authenticated_all ON public.reception_tables
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.reception_tables FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reception_tables TO authenticated, service_role;
