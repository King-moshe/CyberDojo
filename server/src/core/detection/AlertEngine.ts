import runFailedRule from './rules/runFailedRule';
import blockedStepRule from './rules/blockedStepRule';
import manyBlockedRule from './rules/manyBlockedRule';
import type { RuleFn, AlertInput, StepLog } from './types';

const RULES: RuleFn[] = [runFailedRule, blockedStepRule, manyBlockedRule];

export class AlertEngine {
  constructor() {}

  public evaluate(opts: { run: any; scenario?: any; stepLogs: StepLog[] }): AlertInput[] {
    const results: AlertInput[] = [];
    for (const r of RULES) {
      try {
        const out = r(opts as any);
        if (Array.isArray(out) && out.length > 0) results.push(...out);
      } catch (e) {
        // swallow rule errors to avoid breaking detection pipeline
        // in future we could log these
      }
    }
    return results;
  }
}

export default AlertEngine;
