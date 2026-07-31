import mongoose from 'mongoose';

import { environmentConfiguration } from './environment.config';

/**
 * Opens the single shared Mongoose connection. Repositories are the only layer
 * that touches models, so this is the only place the connection is managed.
 */
export async function connectToMongoDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (connectionError: Error) => {
    console.error('[database] connection error:', connectionError.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[database] disconnected from MongoDB');
  });

  await mongoose.connect(environmentConfiguration.mongoDbConnectionUri);
  console.log('[database] connected to MongoDB');
}

export async function disconnectFromMongoDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[database] disconnected from MongoDB');
}
