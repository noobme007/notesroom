/**
 * Generate a unique 6-character alphanumeric room code.
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a unique room code, verifying it doesn't already exist.
 */
export const generateUniqueRoomCode = async (
  checkExists: (code: string) => Promise<boolean>
): Promise<string> => {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateRoomCode();
    const exists = await checkExists(code);
    if (!exists) return code;
    attempts++;
  } while (attempts < maxAttempts);

  throw new Error('Failed to generate unique room code');
};
