import http from './httpClient';
import type { Alert, AlertListResponse } from '../types/api';
import createEventSourceWithRetry from '../utils/sseWithRetry';

export const listAlerts = async (params?: { page?: number; limit?: number; severity?: string; status?: string; type?: string; search?: string }): Promise<AlertListResponse> => {
  const res = await http.get('/alerts', { params });
  return res.data?.data || { results: [], total: 0, page: 1, limit: 50 };
};

export const getAlertById = async (id: string): Promise<Alert> => {
  const res = await http.get(`/alerts/${id}`);
  return res.data?.data;
};

export const resolveAlert = async (id: string): Promise<Alert> => {
  const res = await http.patch(`/alerts/${id}/resolve`);
  return res.data?.data;
};

export default { listAlerts, getAlertById, resolveAlert };

export function subscribeAlertsStream(
  onAlert: (alert: Alert) => void,
  onError?: (err: unknown) => void,
  onOpen?: () => void,
  onReconnect?: (delayMs: number, attempt: number) => void,
  onStatus?: (status: 'connected' | 'reconnecting' | 'failed') => void,
) {
  const url = '/api/alerts/stream';

  const conn = createEventSourceWithRetry(url, {
    onOpen: () => onOpen?.(),
    onMessage: (ev) => {
      try {
        const payload = JSON.parse(ev.data) as Alert;
        onAlert(payload);
      } catch (err) {
        console.error('Failed to parse SSE alert', err);
      }
    },
    onError: (e) => {
      onError?.(e);
    },
    onReconnect: (delayMs, attempt) => onReconnect?.(delayMs, attempt),
    onStatus: (s) => onStatus?.(s),
    // sensible defaults
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    maxRetries: null,
  });

  return () => conn.close();
}
