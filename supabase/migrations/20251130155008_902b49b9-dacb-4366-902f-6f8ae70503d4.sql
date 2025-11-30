-- Add foreign key relationships to reviews table
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewed_id_fkey 
FOREIGN KEY (reviewed_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_request_id_fkey 
FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;