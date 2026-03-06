import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start server
    app.listen(env.port, () => {
      console.log(`
╔══════════════════════════════════════════╗
║       StudyRoom AI — Backend Server      ║
╠══════════════════════════════════════════╣
║  🚀 Server running on port ${env.port}          ║
║  📦 MongoDB connected                   ║
║  🔥 Firebase initialized                ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
