import type { IRun } from '../../models/Run';

export type StepLog = {
  stepIndex?: number;
  type?: string;
  status: 'success' | 'failed' | 'blocked' | 'info';
  message?: string;
  mode?: 'real' | 'dry-run';
  timestamp?: string;
};

export type AlertInput = {
  scenario: string;
  run: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
};

export type RuleFn = (opts: { run: any; scenario?: any; stepLogs: StepLog[] }) => AlertInput[];

export default {};
