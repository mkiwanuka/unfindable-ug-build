-- Add completion metadata fields to requests table for smart archival system
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Create index for archived queries to improve performance
CREATE INDEX IF NOT EXISTS idx_requests_archived ON public.requests(archived);

-- Create index for completed_at to support sorting by completion date
CREATE INDEX IF NOT EXISTS idx_requests_completed_at ON public.requests(completed_at DESC NULLS LAST);

-- Create composite index for requester's active requests
CREATE INDEX IF NOT EXISTS idx_requests_posted_by_status_archived
ON public.requests(posted_by_id, status, archived);
