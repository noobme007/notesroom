import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { env } from '../config/env';

const BUCKET_NAME = env.supabase.bucket;

/**
 * Upload a file to Cloud Storage (Supabase).
 */
export const uploadToCloudStorage = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  roomId: string,
  folderId: string
): Promise<{ fileUrl: string; storagePath: string }> => {
  const ext = originalName.split('.').pop() || '';
  const storagePath = `rooms/${roomId}/${folderId}/${uuidv4()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload file to storage');
  }

  // Generate public URL (assuming the bucket is public; if private, ignore this URL as we use presigned URLs anyway)
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return { fileUrl: publicUrl, storagePath };
};

/**
 * Delete a file from Cloud Storage (Supabase).
 */
export const deleteFromCloudStorage = async (storagePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.error('Error deleting file from Supabase:', error);
    }
  } catch (error) {
    console.error('Error deleting file from Supabase exception:', error);
  }
};

/**
 * Generate a signed URL for temporary access to a file.
 */
export const getSignedUrl = async (
  storagePath: string,
  expiresInMinutes: number = 60
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresInMinutes * 60);

  if (error || !data) {
    console.error('Error getting signed URL from Supabase:', error);
    throw new Error('Could not generate signed URL');
  }

  return data.signedUrl;
};
