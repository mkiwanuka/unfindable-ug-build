-- Allow admins to update any request
CREATE POLICY "Admins can update any request"
  ON public.requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any request
CREATE POLICY "Admins can delete any request"
  ON public.requests
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any offer
CREATE POLICY "Admins can update any offer"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete any offer
CREATE POLICY "Admins can delete any offer"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));