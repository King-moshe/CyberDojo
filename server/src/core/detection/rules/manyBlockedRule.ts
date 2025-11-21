import { RuleFn, AlertInput, StepLog } from '../types';

export const manyBlockedRule: RuleFn = ({ run, scenario, stepLogs }) => {
  const alerts: AlertInput[] = [];
  if (!stepLogs || stepLogs.length === 0) return alerts;

  const count = stepLogs.filter((s) => s.status === 'blocked' || s.status === 'failed').length;
  if (count >= 3) {
    alerts.push({
      scenario: String(run.scenario || (scenario && scenario._id) || ''),
      run: String(run._id || run.id || ''),
      type: 'MANY_BLOCKED_STEPS',
      severity: count >= 5 ? 'critical' : 'high',
      message: `${count} steps blocked or failed`,
      details: { count },
    });
  }

  return alerts;
};

export default manyBlockedRule;
