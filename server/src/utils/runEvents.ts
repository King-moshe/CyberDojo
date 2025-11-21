import { EventEmitter } from 'events';

const emitter = new EventEmitter();

export function emitLog(runId: string, log: string) {
  emitter.emit('log', { runId, log });
}

export function onLog(listener: (payload: { runId: string; log: string }) => void) {
  emitter.on('log', listener);
  return () => emitter.off('log', listener);
}

export default { emitLog, onLog };
