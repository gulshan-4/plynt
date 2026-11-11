import { createClient } from '@/utils/supabase/client';

export async function uploadImage(file, bucketName = 'blog-images') {
  if (!file) return null;

  const supabase = createClient();
  
  // Generate a unique file name to avoid collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload the file to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.message);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrl;
}
