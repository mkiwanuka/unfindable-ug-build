-- Fix 1: Add CHECK constraint for message content length
ALTER TABLE public.messages ADD CONSTRAINT content_length CHECK (length(content) <= 5000);

-- Fix 2: Drop the overly permissive user_roles SELECT policy and replace with restricted one
DROP POLICY IF EXISTS "Authenticated users can view non-admin roles" ON public.user_roles;

-- Users can only view their own roles (fixes enumeration vulnerability)
CREATE POLICY "Users can view their own roles only"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 3: Create secure role management function with audit logging
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit logs"
ON public.role_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create secure function for role management
CREATE OR REPLACE FUNCTION public.manage_user_role(
  _target_user_id uuid,
  _role app_role,
  _action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can manage roles';
  END IF;

  -- Prevent self-demotion from admin (safety measure)
  IF _target_user_id = auth.uid() AND _role = 'admin' AND _action = 'remove' THEN
    RAISE EXCEPTION 'Admins cannot remove their own admin role';
  END IF;

  IF _action = 'add' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF _action = 'remove' THEN
    DELETE FROM public.user_roles
    WHERE user_id = _target_user_id AND role = _role;
  ELSE
    RAISE EXCEPTION 'Invalid action. Use "add" or "remove"';
  END IF;

  -- Log the action
  INSERT INTO public.role_audit_log (admin_user_id, target_user_id, action, role)
  VALUES (auth.uid(), _target_user_id, _action, _role);
END;
$$;