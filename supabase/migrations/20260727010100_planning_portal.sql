-- Wedding planning portal tables (admin / service_role + authenticated).
-- Idempotent: safe to re-run.

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('todo', 'doing', 'done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.vendor_status AS ENUM ('researching', 'contacted', 'booked', 'paid', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.budget_category AS ENUM (
    'venue',
    'catering',
    'photo_video',
    'florals',
    'attire',
    'music',
    'stationery',
    'travel',
    'gifts',
    'misc'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tasks / checklist
CREATE TABLE IF NOT EXISTS public.planning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status public.task_status NOT NULL DEFAULT 'todo',
  due_date date,
  category text,
  assignee text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.planning_tasks IS 'Couple checklist / to-dos for wedding planning.';

DROP TRIGGER IF EXISTS planning_tasks_set_updated_at ON public.planning_tasks;
CREATE TRIGGER planning_tasks_set_updated_at
  BEFORE UPDATE ON public.planning_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  contact_name text,
  email text,
  phone text,
  website text,
  status public.vendor_status NOT NULL DEFAULT 'researching',
  quoted_amount numeric(12, 2),
  deposit_amount numeric(12, 2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.vendors IS 'Vendors being researched or booked for the wedding.';

DROP TRIGGER IF EXISTS vendors_set_updated_at ON public.vendors;
CREATE TRIGGER vendors_set_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Budget line items
CREATE TABLE IF NOT EXISTS public.budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.budget_category NOT NULL DEFAULT 'misc',
  label text NOT NULL,
  estimated_amount numeric(12, 2) NOT NULL DEFAULT 0,
  actual_amount numeric(12, 2),
  vendor_id uuid REFERENCES public.vendors (id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.budget_items IS 'Budget estimates vs actuals, optionally linked to a vendor.';

DROP TRIGGER IF EXISTS budget_items_set_updated_at ON public.budget_items;
CREATE TRIGGER budget_items_set_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Day-of / event timeline
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.timeline_events IS 'Ceremony/reception schedule and other day-of beats.';

DROP TRIGGER IF EXISTS timeline_events_set_updated_at ON public.timeline_events;
CREATE TRIGGER timeline_events_set_updated_at
  BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Freeform notes
CREATE TABLE IF NOT EXISTS public.planning_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.planning_notes IS 'Scratchpad notes for planning decisions.';

DROP TRIGGER IF EXISTS planning_notes_set_updated_at ON public.planning_notes;
CREATE TRIGGER planning_notes_set_updated_at
  BEFORE UPDATE ON public.planning_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: no anon access; authenticated + service_role manage
ALTER TABLE public.planning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_notes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'planning_tasks', 'vendors', 'budget_items',
        'timeline_events', 'planning_notes'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

CREATE POLICY planning_tasks_authenticated_all ON public.planning_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY vendors_authenticated_all ON public.vendors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY budget_items_authenticated_all ON public.budget_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY timeline_events_authenticated_all ON public.timeline_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY planning_notes_authenticated_all ON public.planning_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

REVOKE ALL ON TABLE public.planning_tasks FROM anon, public;
REVOKE ALL ON TABLE public.vendors FROM anon, public;
REVOKE ALL ON TABLE public.budget_items FROM anon, public;
REVOKE ALL ON TABLE public.timeline_events FROM anon, public;
REVOKE ALL ON TABLE public.planning_notes FROM anon, public;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.planning_tasks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vendors TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budget_items TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.timeline_events TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.planning_notes TO authenticated, service_role;
