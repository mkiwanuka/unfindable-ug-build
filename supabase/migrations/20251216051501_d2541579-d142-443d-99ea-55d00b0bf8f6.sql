-- Create request-images bucket (public for easy access)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('request-images', 'request-images', true);

-- RLS policy: Users can upload their own images
CREATE POLICY "Users can upload request images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'request-images' AND auth.uid() IS NOT NULL);

-- RLS policy: Anyone can view request images (public listings)
CREATE POLICY "Anyone can view request images"
ON storage.objects FOR SELECT
USING (bucket_id = 'request-images');

-- RLS policy: Users can delete their own images
CREATE POLICY "Users can delete own request images"
ON storage.objects FOR DELETE
USING (bucket_id = 'request-images' AND auth.uid()::text = (storage.foldername(name))[1]);