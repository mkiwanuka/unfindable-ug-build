-- Temporarily disable RLS on request_views to allow inserts
-- The RLS policies were preventing legitimate inserts
ALTER TABLE public.request_views DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own views" ON public.request_views;
DROP POLICY IF EXISTS "Users can read their own views" ON public.request_views;
DROP POLICY IF EXISTS "Users can update their own views" ON public.request_views;

-- Re-enable RLS with simpler, more permissive policies
ALTER TABLE public.request_views ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow authenticated users to insert view records
CREATE POLICY "Allow authenticated users to insert views"
  ON public.request_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Simple policy: Allow users to read their own views
CREATE POLICY "Allow users to read their own views"
  ON public.request_views FOR SELECT
  TO authenticated
  USING (auth.uid() = viewer_id);

-- Simple policy: Allow users to update their own views
CREATE POLICY "Allow users to update their own views"
  ON public.request_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = viewer_id)
  WITH CHECK (auth.uid() = viewer_id);
