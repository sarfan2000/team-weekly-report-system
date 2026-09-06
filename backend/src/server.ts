import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(config.port, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('  Weekly Report Generator API');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  Environment: ${config.env}`);
      console.log(`  Server:      http://localhost:${config.port}`);
      console.log(`  API:         http://localhost:${config.port}/api`);
      console.log(`  Health:      http://localhost:${config.port}/api/health`);
      console.log('═══════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
