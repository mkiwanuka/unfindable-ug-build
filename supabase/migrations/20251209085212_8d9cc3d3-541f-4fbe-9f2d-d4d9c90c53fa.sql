-- Fix the SECURITY DEFINER view issue by setting security_invoker to true
ALTER VIEW public.public_profiles SET (security_invoker = true);