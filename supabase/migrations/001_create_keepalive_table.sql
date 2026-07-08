-- supabase/migrations/001_create_keepalive_table.sql
-- Required for api/ping.js KeepAlive endpoint.
-- Must be executed before deploying the endpoint on any new Supabase project.

CREATE TABLE IF NOT EXISTS public.keepalive (
  id serial primary key,
  created_at timestamptz default now()
);

INSERT INTO public.keepalive DEFAULT VALUES;

ALTER TABLE public.keepalive ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_anon_select
ON public.keepalive
FOR SELECT
TO anon
USING (true);
