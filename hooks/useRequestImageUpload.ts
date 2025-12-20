import { useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface UploadResult {
  url: string;
  path: string;
}

export function useRequestImageUpload(userId: string | null) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    if (!userId) {
      setUploadError('Please log in to upload images');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Image must be less than 5MB');
      return null;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, GIF, and WebP images are allowed');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('request-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL since bucket is public
      const { data: urlData } = supabase.storage
        .from('request-images')
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('request-images')
        .remove([path]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  };
}
