/**
 * Simple console-based logger with consistent [tag] formatting.
 * Matches the project's existing patterns seen in neon-provision-service.ts,
 * vercel-deploy-service.ts, and google-cloud-service.ts.
 *
 * Supports the logger.info/warn/error API used in tenant cleanup and workflows.
 * Does not depend on external logging libraries (no winston, pino, etc.).
 */
const createLogFn = (level, defaultTag = 'tenant') => {
    return (message, meta) => {
        const tag = `[${defaultTag}]`;
        const fullMsg = `${tag} ${message}`;
        if (meta !== undefined && meta !== null) {
            if (level === 'error') {
                console.error(fullMsg, meta);
            }
            else if (level === 'warn') {
                console.warn(fullMsg, meta);
            }
            else {
                console.log(fullMsg, meta);
            }
        }
        else {
            if (level === 'error') {
                console.error(fullMsg);
            }
            else if (level === 'warn') {
                console.warn(fullMsg);
            }
            else {
                console.log(fullMsg);
            }
        }
    };
};
export const logger = {
    info: createLogFn('info', 'tenant-cleanup'),
    warn: createLogFn('warn', 'tenant-cleanup'),
    error: createLogFn('error', 'tenant-cleanup'),
};
