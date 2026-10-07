import app from './app.js';
import { env } from './config/env.js';
import { initDb } from './db/index.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await initDb();

    const server = app.listen(env.PORT, () => {
      logger.info(`AI TrustGuard Server running on port ${env.PORT}`, {
        port: env.PORT,
        env: env.NODE_ENV,
      });
    });

    const shutdown = () => {
      logger.info('Shutting down AI TrustGuard Server...');
      server.close(() => {
        logger.info('Server terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server:', { error: err.message });
    process.exit(1);
  }
};

startServer();
