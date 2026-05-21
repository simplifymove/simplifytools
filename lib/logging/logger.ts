// lib/logging/logger.ts
// Pino structured logging setup for Phase 7

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
  // Production uses JSON logging by default
});

// Child loggers for different modules
export const workerLogger = logger.child({ module: 'worker' });
export const queueLogger = logger.child({ module: 'queue' });
export const testLogger = logger.child({ module: 'test-execution' });
export const alertLogger = logger.child({ module: 'alerting' });
export const recoveryLogger = logger.child({ module: 'auto-recovery' });
export const apiLogger = logger.child({ module: 'api' });

export default logger;
