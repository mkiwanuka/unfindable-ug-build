-- Fix: Update requests SELECT policy to include anonymous users
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.requests;

CREATE POLICY "Anyone can view open requests" 
ON public.requests 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Fix: Add policy for viewing public profile info (needed for request cards to show poster name/avatar)
CREATE POLICY "Anyone can view public profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated, anon
USING (true);