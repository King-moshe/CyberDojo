import { RuleFn, AlertInput } from '../types';

export const runFailedRule: RuleFn = ({ run, scenario, stepLogs }) => {
  const alerts: AlertInput[] = [];
  if (!run) return alerts;
  if (run.status === 'failed') {
    alerts.push({
      scenario: String(run.scenario || (scenario && scenario._id) || ''),
      run: String(run._id || run.id || ''),
      type: 'RUN_FAILED',
      severity: 'medium',
      message: `Run ${run._id || run.id} failed`,
      details: { runStatus: run.status },
    });
  }
  return alerts;
};

export default runFailedRule;
