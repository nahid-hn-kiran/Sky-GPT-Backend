import app from './app';
import { config } from './app/config';
import mongoose from 'mongoose';

async function bootstrap() {
  try {
    if (config.mongoUri) {
      await mongoose.connect(config.mongoUri);
      console.log(`[chat-service] Connected to MongoDB at ${config.mongoUri}`);
    }
  } catch (error) {
    console.warn(
      `[chat-service] MongoDB connection warning: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    console.warn(`[chat-service] Service is running without active database connection.`);
  }

  app.listen(config.port, () => {
    console.log(`[chat-service] Server running on http://localhost:${config.port}`);
  });
}

bootstrap();
