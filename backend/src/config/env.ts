import dotenv from 'dotenv';
dotenv.config();

function formatPrivateKey(key: string) {
  if (!key) return '';
  // 1. Clean quotes and unescape newlines
  let formatted = key.replace(/^"|"$/g, '').replace(/^'|'$/g, '').replace(/\\n/g, '\n');

  // 2. Extract the Base64 section
  const match = formatted.match(/-----\s*BEGIN PRIVATE KEY\s*-----(.*?)-----\s*END PRIVATE KEY\s*-----/s);

  if (match) {
    // 3. Remove all existing whitespace/newlines from the base64 string
    const base64 = match[1].replace(/\s+/g, '');

    // 4. OpenSSL requires exactly 64-character lines for PEM certificates
    const lines = base64.match(/.{1,64}/g) || [];

    // 5. Reconstruct perfectly formatted PEM
    return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }

  return formatted;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/studyroom',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID?.replace(/['"]/g, '') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/['"]/g, '') || '',
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || ''),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.replace(/['"]/g, '') || '',
  },

  groqApiKey: process.env.GROQ_API_KEY || '',
};
