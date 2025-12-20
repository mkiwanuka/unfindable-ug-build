-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  finder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  delivery_days INTEGER NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, finder_id)
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view offers on requests they can see"
ON public.offers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = offers.request_id
  )
);

CREATE POLICY "Finders can create their own offers"
ON public.offers
FOR INSERT
WITH CHECK (auth.uid() = finder_id);

CREATE POLICY "Finders can update their own offers"
ON public.offers
FOR UPDATE
USING (auth.uid() = finder_id);

CREATE POLICY "Requesters can update offer status on their requests"
ON public.offers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = offers.request_id
    AND requests.posted_by_id = auth.uid()
  )
);

-- Trigger to update offer_count on requests
CREATE OR REPLACE FUNCTION public.update_request_offer_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.requests
    SET offer_count = offer_count + 1
    WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.requests
    SET offer_count = GREATEST(offer_count - 1, 0)
    WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_offer_count_trigger
AFTER INSERT OR DELETE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_request_offer_count();

-- Trigger for updated_at
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();