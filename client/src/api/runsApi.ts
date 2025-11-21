import http from './httpClient';
import { Run } from '../types/api';

export const getRuns = async (): Promise<Run[]> => {
  const res = await http.get('/runs');
  return res.data?.data || [];
};

export const getRun = async (id: string): Promise<Run | null> => {
  const res = await http.get(`/runs/${id}`);
  return res.data?.data || null;
};

export const createRun = async (scenarioId: string): Promise<Run> => {
  const res = await http.post('/runs', { scenarioId });
  return res.data?.data;
};

export const dryRun = async (scenarioId: string): Promise<Run> => {
  const res = await http.post(`/runs/${scenarioId}/dry-run`);
  return res.data?.data;
};

export function subscribeRunLogs(runId: string, onMessage: (data: any) => void) {
  const url = `/api/runs/${runId}/stream`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data);
      onMessage(parsed);
    } catch (err) {
      onMessage(e.data);
    }
  };
  es.onerror = () => { /* noop - consumer handles */ };
  return () => {
    try { es.close(); } catch (_) {}
  };
}

export default { getRuns, getRun, createRun, dryRun, subscribeRunLogs };
