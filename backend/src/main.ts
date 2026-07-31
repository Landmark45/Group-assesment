import type { Server } from 'node:http';

import { createExpressApplication } from './app';
import { connectToMongoDatabase, disconnectFromMongoDatabase } from './shared/database.connection';
import { environmentConfiguration } from './shared/environment.config';

async function startEduConnectApiServer(): Promise<void> {
  await connectToMongoDatabase();

  const application = createExpressApplication();
  const httpServer: Server = application.listen(environmentConfiguration.httpPort, () => {
    console.log(
      `[server] EduConnect API listening on http://localhost:${environmentConfiguration.httpPort} (${environmentConfiguration.nodeEnvironment})`
    );
  });

  const shutdownGracefully = (signalName: string): void => {
    console.log(`[server] received ${signalName}, shutting down`);
    httpServer.close(() => {
      void disconnectFromMongoDatabase().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdownGracefully('SIGINT'));
  process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
}

startEduConnectApiServer().catch((startupError: unknown) => {
  console.error('[server] failed to start:', startupError);
  process.exit(1);
});
