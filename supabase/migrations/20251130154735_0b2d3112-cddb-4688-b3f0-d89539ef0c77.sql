-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  reviewed_id uuid NOT NULL,
  request_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews (public for profile pages)
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Only requesters can create reviews for completed requests they own
CREATE POLICY "Requesters can create reviews for their completed requests"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = request_id
    AND r.posted_by_id = auth.uid()
    AND r.status = 'Completed'
  )
  AND EXISTS (
    SELECT 1 FROM public.offers o
    WHERE o.request_id = reviews.request_id
    AND o.finder_id = reviewed_id
    AND o.status = 'Accepted'
  )
);

-- Prevent duplicate reviews for the same request
CREATE UNIQUE INDEX unique_review_per_request ON public.reviews (reviewer_id, request_id);

-- Create function to update profile rating when a review is added
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.reviews
    WHERE reviewed_id = NEW.reviewed_id
  ),
  completed_tasks = (
    SELECT COUNT(*)
    FROM public.reviews
    WHERE reviewed_id = NEW.reviewed_id
  )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$;

-- Create trigger to update rating on new review
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_rating();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;