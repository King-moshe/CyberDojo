type OnMessage = (ev: MessageEvent) => void;
type OnError = (ev: Event | Error) => void;
type OnOpen = (ev: Event) => void;
type OnReconnect = (delayMs: number, attempt: number) => void;
type OnStatus = (status: 'connected' | 'reconnecting' | 'failed') => void;

export interface RetryOptions {
  onMessage: OnMessage;
  onError?: OnError;
  onOpen?: OnOpen;
  onReconnect?: OnReconnect;
  onStatus?: OnStatus;
  initialDelayMs?: number; // default 1000
  maxDelayMs?: number; // default 30000
  maxRetries?: number | null; // null = infinite
}

export function createEventSourceWithRetry(url: string, opts: RetryOptions) {
  const initialDelay = opts.initialDelayMs ?? 1000;
  const maxDelay = opts.maxDelayMs ?? 30000;
  const maxRetries = opts.maxRetries ?? null; // null = infinite

  let es: EventSource | null = null;
  let closed = false;
  let retries = 0;
  let delay = initialDelay;
  let timerId: number | null = null;

  const clearTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const connect = () => {
    if (closed) return;

    try {
      es = new EventSource(url);
    } catch (err) {
      // scheduling reconnect on construction error
      scheduleReconnect();
      return;
    }

    es.onopen = (ev) => {
      // reset backoff
      retries = 0;
      delay = initialDelay;
      opts.onOpen?.(ev);
      opts.onStatus?.('connected');
    };

    es.onmessage = (ev) => {
      // only deliver raw messages here
      opts.onMessage(ev);
    };

    es.onerror = (ev) => {
      opts.onError?.(ev);
      // close the instance and schedule reconnect
      try { es?.close(); } catch (e) {}
      es = null;
      // increment retry count and decide
      retries += 1;
      if (maxRetries !== null && retries > maxRetries) {
        // final error
        opts.onError?.(new Error('SSE max retries exceeded'));
        opts.onStatus?.('failed');
        return;
      }
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (closed) return;
    clearTimer();
    const nextDelay = Math.min(Math.max(1, delay), maxDelay);
    // notify the caller about upcoming reconnect
    opts.onReconnect?.(nextDelay, retries);
    opts.onStatus?.('reconnecting');
    timerId = window.setTimeout(() => {
      // exponential backoff
      delay = Math.min(delay * 2, maxDelay);
      connect();
    }, nextDelay);
  };

  // public close
  const close = () => {
    closed = true;
    clearTimer();
    try { es?.close(); } catch (e) {}
    es = null;
  };

  // start immediately
  connect();

  return { close };
}

export default createEventSourceWithRetry;
