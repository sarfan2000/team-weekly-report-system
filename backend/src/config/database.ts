import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly-reports';

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('✓ MongoDB connected successfully');
      console.log(`  Database: ${mongoose.connection.name}`);
    } catch (err: any) {
      if (err.name === 'MongooseServerSelectionError') {
        console.warn('⚠ Local/Remote MongoDB not found. Starting in-memory fallback...');
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log('✓ Fallback In-Memory MongoDB connected successfully (Data will reset on restart)');
        console.log(`  Database: in-memory-fallback`);

        const { seedDatabase } = require('../scripts/seed');
        await seedDatabase(true);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});
