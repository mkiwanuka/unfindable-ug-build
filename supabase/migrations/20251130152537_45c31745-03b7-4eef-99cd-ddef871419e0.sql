-- Enable REPLICA IDENTITY FULL on requests table for real-time updates
ALTER TABLE public.requests REPLICA IDENTITY FULL;

-- Add requests table to supabase_realtime publication if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;