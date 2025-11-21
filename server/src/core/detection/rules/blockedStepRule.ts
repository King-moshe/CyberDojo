import { RuleFn, AlertInput, StepLog } from '../types';

export const blockedStepRule: RuleFn = ({ run, scenario, stepLogs }) => {
  const alerts: AlertInput[] = [];
  if (!stepLogs || stepLogs.length === 0) return alerts;

  const blocked: StepLog[] = stepLogs.filter((s) => s.status === 'blocked');
  for (const b of blocked) {
    // severity mapping by step type
    const stepType = b.type || 'unknown';
    const severity: AlertInput['severity'] = ['http', 'assertStatus', 'assertBodyContains'].includes(stepType)
      ? 'high'
      : 'low';

    alerts.push({
      scenario: String(run.scenario || (scenario && scenario._id) || ''),
      run: String(run._id || run.id || ''),
      type: 'BLOCKED_STEP',
      severity,
      message: `Step ${b.stepIndex ?? '-'} blocked (${stepType})`,
      details: b,
    });
  }

  return alerts;
};

export default blockedStepRule;
