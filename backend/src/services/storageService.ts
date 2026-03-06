import { v4 as uuidv4 } from 'uuid';
import { firebaseStorage } from '../config/firebase';

/**
 * Upload a file to Firebase Storage.
 */
export const uploadToFirebase = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  roomId: string,
  folderId: string
): Promise<{ fileUrl: string; storagePath: string }> => {
  const ext = originalName.split('.').pop() || '';
  const storagePath = `rooms/${roomId}/${folderId}/${uuidv4()}.${ext}`;

  const file = firebaseStorage.file(storagePath);

  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        originalName,
        roomId,
        folderId,
      },
    },
  });

  // Try to make the file publicly readable (may fail if Uniform Bucket-Level Access is enforced)
  try {
    await file.makePublic();
  } catch (err) {
    console.warn('Could not make file public (ACLs might be disabled on bucket). File upload will continue.', err);
  }

  const fileUrl = `https://storage.googleapis.com/${firebaseStorage.name}/${storagePath}`;

  return { fileUrl, storagePath };
};

/**
 * Delete a file from Firebase Storage.
 */
export const deleteFromFirebase = async (storagePath: string): Promise<void> => {
  try {
    const file = firebaseStorage.file(storagePath);
    await file.delete();
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
  }
};

/**
 * Generate a signed URL for temporary access to a file.
 */
export const getSignedUrl = async (
  storagePath: string,
  expiresInMinutes: number = 60
): Promise<string> => {
  const file = firebaseStorage.file(storagePath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
};
