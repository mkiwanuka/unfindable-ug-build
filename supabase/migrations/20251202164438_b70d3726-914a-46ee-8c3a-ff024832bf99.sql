-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true);

-- Allow users to upload files to their conversation folders
CREATE POLICY "Users can upload attachments to their conversations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view attachments in their conversations
CREATE POLICY "Users can view message attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'message-attachments'
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add attachment columns to messages table
ALTER TABLE public.messages
ADD COLUMN attachment_url TEXT DEFAULT NULL,
ADD COLUMN attachment_type TEXT DEFAULT NULL,
ADD COLUMN attachment_name TEXT DEFAULT NULL;