-- Fix RLS policies for request_views table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own views" ON public.request_views;
DROP POLICY IF EXISTS "Users can read their own views" ON public.request_views;
DROP POLICY IF EXISTS "Users can update their own views" ON public.request_views;

-- Re-create policies with correct configuration
CREATE POLICY "Users can insert their own views"
  ON public.request_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can read their own views"
  ON public.request_views FOR SELECT
  USING (auth.uid() = viewer_id);

CREATE POLICY "Users can update their own views"
  ON public.request_views FOR UPDATE
  WITH CHECK (auth.uid() = viewer_id);
