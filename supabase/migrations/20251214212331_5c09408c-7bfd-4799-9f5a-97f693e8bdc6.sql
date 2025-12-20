-- Fix: Secure the upgrade_to_premium function
-- Only allow service_role (webhooks) or admins to call this function
-- Also verify that a pending payment exists before upgrading

CREATE OR REPLACE FUNCTION public.upgrade_to_premium(p_user_id uuid, p_tx_ref text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service_role (webhooks via edge functions) or admins
  -- auth.uid() IS NULL when called with service_role key
  IF auth.uid() IS NOT NULL AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only system webhooks or admins can upgrade users to premium';
  END IF;
  
  -- Verify payment exists and is pending before upgrading
  IF NOT EXISTS (
    SELECT 1 FROM premium_payments 
    WHERE user_id = p_user_id 
    AND flutterwave_tx_ref = p_tx_ref 
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Invalid or already processed payment transaction';
  END IF;
  
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

-- Revoke execute from authenticated users, only service_role should call this
REVOKE EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, text) TO service_role;