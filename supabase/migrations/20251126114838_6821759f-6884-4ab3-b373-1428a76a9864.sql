-- Update the handle_new_user function to respect role selection during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  selected_role app_role;
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

  -- Create profile
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || 
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  
  -- Assign the selected role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);
  
  RETURN NEW;
END;
$$;