-- 1. Create SECURITY DEFINER function for safe profile updates
CREATE OR REPLACE FUNCTION public.update_user_profile_secure(
  _name text DEFAULT NULL,
  _avatar text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _location text DEFAULT NULL,
  _skills text[] DEFAULT NULL,
  _response_time text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    name = COALESCE(_name, name),
    avatar = COALESCE(_avatar, avatar),
    bio = COALESCE(_bio, bio),
    location = COALESCE(_location, location),
    skills = COALESCE(_skills, skills),
    response_time = COALESCE(_response_time, response_time),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

-- 2. Drop the existing permissive UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Create restrictive policy that blocks all direct updates from authenticated users
CREATE POLICY "Block direct profile updates"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (false);

-- 4. Drop the overly permissive INSERT policy on notifications
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- 5. Create restrictive policy that blocks all direct inserts from authenticated users
-- (Notifications should ONLY be created via SECURITY DEFINER triggers)
CREATE POLICY "Block direct notification inserts"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (false);