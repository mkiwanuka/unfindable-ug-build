-- Add 'Cancelled' status to requests table constraint
ALTER TABLE public.requests
DROP CONSTRAINT requests_status_check;

ALTER TABLE public.requests
ADD CONSTRAINT requests_status_check CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled'));
