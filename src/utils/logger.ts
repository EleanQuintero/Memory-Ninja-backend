/**
 * Simple logger utility that only logs in development mode
 * In production, logs are suppressed to avoid performance impact
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
    log: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    error: (...args: unknown[]): void => {
        // Always log errors, even in production
        console.error(...args);
    },
    warn: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    info: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};

export const queryLog = (query: string): void => {
    if (isDevelopment) {
        const hour = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        console.log(`query: ${query} - Hora de ejecucion: ${hour}`);
    }
};
