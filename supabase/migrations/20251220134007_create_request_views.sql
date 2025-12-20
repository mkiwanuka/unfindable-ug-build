-- Create request_views table to track when finders view requests
CREATE TABLE public.request_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_request_view UNIQUE(request_id, viewer_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_request_views_viewer ON public.request_views(viewer_id);
CREATE INDEX idx_request_views_request ON public.request_views(request_id);
CREATE INDEX idx_request_views_viewed_at ON public.request_views(viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.request_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own view records
CREATE POLICY "Users can insert their own views"
  ON public.request_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- RLS Policy: Users can read their own view records
CREATE POLICY "Users can read their own views"
  ON public.request_views FOR SELECT
  USING (auth.uid() = viewer_id);

-- RLS Policy: Users can update their own view records (for timestamp updates)
CREATE POLICY "Users can update their own views"
  ON public.request_views FOR UPDATE
  USING (auth.uid() = viewer_id)
  WITH CHECK (auth.uid() = viewer_id);
