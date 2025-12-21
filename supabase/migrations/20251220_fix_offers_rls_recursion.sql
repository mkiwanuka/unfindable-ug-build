-- Fix infinite recursion in offers RLS policy
-- The "Block offers when free limit reached" policy causes infinite recursion
-- because it queries the offers table within its own policy
DROP POLICY IF EXISTS "Block offers when free limit reached" ON public.offers;

-- The limit checking should be done at the application level or through a trigger/function
-- For now, we'll add a simple policy that allows finders to insert offers
CREATE POLICY "Finders can create offers"
  ON public.offers FOR INSERT
  WITH CHECK (auth.uid() = finder_id);
