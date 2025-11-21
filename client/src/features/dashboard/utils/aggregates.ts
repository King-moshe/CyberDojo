import { Scenario } from '../../../types/api';
import { Run } from '../../../types/api';
import { Alert } from '../../../types/api';

export function countByStatusRuns(runs: Run[]) {
  const map: Record<string, number> = {};
  runs.forEach((r) => { map[r.status] = (map[r.status] || 0) + 1; });
  return map;
}

export function countBySeverityAlerts(alerts: Alert[]) {
  const map: Record<string, number> = {};
  alerts.forEach((a) => { map[a.severity || 'unknown'] = (map[a.severity || 'unknown'] || 0) + 1; });
  return map;
}

export function scenariosSummary(scenarios: Scenario[]) {
  return {
    total: scenarios.length,
  };
}

console.log('Dashboard aggregates utilities loaded.', countBySeverityAlerts, scenariosSummary);