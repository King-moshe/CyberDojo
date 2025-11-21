import * as alertsRepo from '../repositories/alerts.repository';

type ListFilter = {
  status?: 'open' | 'resolved';
  severity?: string;
  scenarioId?: string;
  runId?: string;
  page?: number;
  limit?: number;
};

/**
 * List alerts with optional filters and pagination.
 */
export const listAlerts = async (filter: ListFilter = {}) => {
  const res = await alertsRepo.listAlerts(filter as any);
  return res;
};

/**
 * Get a single alert by id.
 */
export const getAlertById = async (id: string) => {
  return alertsRepo.getAlertById(id);
};

/**
 * Resolve an alert by id (set status = 'resolved').
 */
export const resolveAlert = async (id: string) => {
  return alertsRepo.updateAlertStatus(id, 'resolved');
};

export default { listAlerts, getAlertById, resolveAlert };
