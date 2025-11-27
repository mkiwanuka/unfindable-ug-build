-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a policy that allows viewing own roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to see non-admin roles for profile displays
CREATE POLICY "Authenticated users can view non-admin roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (role IN ('finder', 'requester'));