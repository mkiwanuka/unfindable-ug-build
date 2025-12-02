import { useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

interface UploadResult {
  url: string;
  type: string;
  name: string;
}

export function useFileUpload(userId: string | null) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    if (!userId) {
      setUploadError('Please log in to upload files');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return null;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('File type not supported');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        type: file.type,
        name: file.name
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  };
}
