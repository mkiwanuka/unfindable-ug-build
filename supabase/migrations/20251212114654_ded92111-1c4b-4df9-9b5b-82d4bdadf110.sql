-- Fix the security definer view issue by using SECURITY INVOKER (default)
-- The view should respect the caller's permissions
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  avatar,
  bio,
  location,
  skills,
  rating,
  completed_tasks,
  response_time,
  joined_date,
  verified,
  created_at,
  updated_at,
  is_premium
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add index for premium_payments lookup
CREATE INDEX IF NOT EXISTS idx_premium_payments_user ON public.premium_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_payments_tx_ref ON public.premium_payments(flutterwave_tx_ref);