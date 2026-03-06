import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/studyroom',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID?.replace(/['"]/g, '') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/['"]/g, '') || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/['"]/g, '') // Aggressively remove all quotes
      .replace(/\\n/g, '\n') // Convert literal \n to actual newlines
      .trim(), // Remove extra spaces
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.replace(/['"]/g, '') || '',
  },

  groqApiKey: process.env.GROQ_API_KEY || '',
};
