import { EventEmitter } from 'events';

const emitter = new EventEmitter();

export function emitAlert(alert: any) {
  try {
    emitter.emit('alert', alert);
  } catch (e) {
    // noop
  }
}

export function onAlert(listener: (alert: any) => void) {
  emitter.on('alert', listener);
  return () => emitter.off('alert', listener);
}

export default { emitAlert, onAlert };
