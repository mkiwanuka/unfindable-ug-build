-- Make the message-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'message-attachments';

-- Update storage policies for private bucket access
-- Allow authenticated users to read files in their conversations
CREATE POLICY "Users can read their own attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read attachments sent to them in conversations
CREATE POLICY "Users can read attachments in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE m.attachment_url LIKE '%' || name || '%'
    AND (c.requester_id = auth.uid() OR c.finder_id = auth.uid())
  )
);