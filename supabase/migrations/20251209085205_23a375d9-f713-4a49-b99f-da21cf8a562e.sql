-- Create a public view that excludes sensitive balance field
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
  updated_at
FROM public.profiles;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Update the existing RLS policy to only allow users to view their own full profile
-- First drop the existing permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: users can only see their own full profile (including balance)
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);