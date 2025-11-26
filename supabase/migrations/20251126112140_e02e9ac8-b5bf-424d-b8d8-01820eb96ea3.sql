-- Allow users to delete their own non-admin roles
CREATE POLICY "Users can delete their own roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND role != 'admin'::app_role);

-- Allow users to insert non-admin roles for themselves
CREATE POLICY "Users can insert non-admin roles for themselves"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('requester'::app_role, 'finder'::app_role));

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';