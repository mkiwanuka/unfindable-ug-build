-- Fix 1: Replace check_finder_can_place_offer to only allow checking own eligibility
-- This prevents users from checking other users' premium status and offer counts

CREATE OR REPLACE FUNCTION public.check_finder_can_place_offer(p_finder_id uuid)
RETURNS TABLE(can_place boolean, accepted_count integer, is_premium boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if the caller is checking their own eligibility
  SELECT 
    COALESCE(p.is_premium, false) OR 
    (SELECT COUNT(*) FROM offers WHERE finder_id = p_finder_id AND status = 'Accepted') < 5,
    (SELECT COUNT(*)::int FROM offers WHERE finder_id = p_finder_id AND status = 'Accepted'),
    COALESCE(p.is_premium, false)
  FROM profiles p 
  WHERE p.id = p_finder_id 
  AND p_finder_id = auth.uid();  -- Only allow checking own eligibility
$$;

-- Fix 2: Create admin-only RPC function for fetching all users with roles
-- This enforces server-side admin verification instead of client-side

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(
  id uuid,
  name text,
  avatar text,
  verified boolean,
  joined_date timestamptz,
  completed_tasks integer,
  rating numeric,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin - throws exception if not
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.avatar,
    p.verified,
    p.joined_date,
    p.completed_tasks,
    p.rating,
    COALESCE(ARRAY_AGG(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY['guest']::text[]) as roles
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  GROUP BY p.id, p.name, p.avatar, p.verified, p.joined_date, p.completed_tasks, p.rating
  ORDER BY p.joined_date DESC;
END;
$$;

-- Grant execute to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;