-- Update handle_new_user to support Google OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  selected_role app_role;
  user_name text;
BEGIN
  -- Get role from metadata, default to 'requester' if not provided
  selected_role := COALESCE(
    (NEW.raw_user_meta_data->>'selectedRole')::app_role, 
    'requester'::app_role
  );
  
  -- Ensure only valid non-admin roles can be selected during signup
  IF selected_role NOT IN ('requester', 'finder') THEN
    selected_role := 'requester';
  END IF;

  -- Build user name - handle both email/password and OAuth signups
  user_name := COALESCE(
    -- Try Google OAuth full_name first
    NEW.raw_user_meta_data->>'full_name',
    -- Then try name field (some providers use this)
    NEW.raw_user_meta_data->>'name',
    -- Then try combining first + last name (email signup)
    NULLIF(
      TRIM(
        COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || 
        COALESCE(NEW.raw_user_meta_data->>'lastName', '')
      ),
      ''
    ),
    -- Fallback to email prefix
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Create profile with avatar from Google or generated
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    user_name,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    )
  );
  
  -- Assign the selected role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);
  
  RETURN NEW;
END;
$$;