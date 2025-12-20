-- Drop the existing foreign key to auth.users
ALTER TABLE public.requests
DROP CONSTRAINT IF EXISTS requests_posted_by_id_fkey;

-- Add new foreign key to profiles
ALTER TABLE public.requests
ADD CONSTRAINT requests_posted_by_id_fkey
FOREIGN KEY (posted_by_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';