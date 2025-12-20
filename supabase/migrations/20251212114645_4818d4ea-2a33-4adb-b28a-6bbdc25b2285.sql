-- Add premium status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_upgraded_at timestamptz;

-- Create premium payments tracking table
CREATE TABLE IF NOT EXISTS public.premium_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flutterwave_tx_ref text UNIQUE NOT NULL,
  flutterwave_tx_id text,
  amount numeric NOT NULL DEFAULT 35000,
  currency text NOT NULL DEFAULT 'UGX',
  status text NOT NULL DEFAULT 'pending',
  payment_type text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on premium_payments
ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for premium_payments
CREATE POLICY "Users can view their own payments"
ON public.premium_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.premium_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.premium_payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payments"
ON public.premium_payments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check finder eligibility
CREATE OR REPLACE FUNCTION public.check_finder_can_place_offer(p_finder_id uuid)
RETURNS TABLE(can_place boolean, accepted_count integer, is_premium boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.is_premium, false) OR 
    (SELECT COUNT(*) FROM offers WHERE finder_id = p_finder_id AND status = 'Accepted') < 5,
    (SELECT COUNT(*)::int FROM offers WHERE finder_id = p_finder_id AND status = 'Accepted'),
    COALESCE(p.is_premium, false)
  FROM profiles p WHERE p.id = p_finder_id;
$$;

-- Create function to upgrade user to premium (called by webhook)
CREATE OR REPLACE FUNCTION public.upgrade_to_premium(p_user_id uuid, p_tx_ref text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile to premium
  UPDATE profiles
  SET is_premium = true, premium_upgraded_at = now()
  WHERE id = p_user_id;
  
  -- Update payment record
  UPDATE premium_payments
  SET status = 'completed', completed_at = now()
  WHERE user_id = p_user_id AND flutterwave_tx_ref = p_tx_ref;
END;
$$;

-- Add RLS policy to block offers when limit reached (additional server-side enforcement)
CREATE POLICY "Block offers when free limit reached"
ON public.offers FOR INSERT
WITH CHECK (
  auth.uid() = finder_id AND (
    (SELECT is_premium FROM profiles WHERE id = auth.uid()) = true
    OR
    (SELECT COUNT(*) FROM offers WHERE finder_id = auth.uid() AND status = 'Accepted') < 5
  )
);

-- Update public_profiles view to include is_premium
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
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