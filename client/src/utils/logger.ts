export const log = (...args: unknown[]) => console.log('[client]', ...args);
export const warn = (...args: unknown[]) => console.warn('[client]', ...args);
export const error = (...args: unknown[]) => console.error('[client]', ...args);

export default { log, warn, error };
