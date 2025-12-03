-- Drop the overly permissive storage policy that allows any authenticated user to view all attachments
DROP POLICY IF EXISTS "Users can view message attachments" ON storage.objects;