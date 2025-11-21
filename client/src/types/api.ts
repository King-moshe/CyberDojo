export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AttackStepBase {
  type: string;
}

export interface HttpStep extends AttackStepBase {
  type: 'http';
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface PauseStep extends AttackStepBase {
  type: 'pause';
  durationMs: number;
}

export interface AssertStatusStep extends AttackStepBase {
  type: 'assertStatus';
  expected: number;
}

export interface AssertBodyContainsStep extends AttackStepBase {
  type: 'assertBodyContains';
  contains: string;
}

export type AttackStep = HttpStep | PauseStep | AssertStatusStep | AssertBodyContainsStep;

export interface StepLog {
  mode: 'real' | 'dry-run';
  type: string;
  stepIndex?: number;
  status: 'success' | 'failed' | 'blocked' | 'info';
  message?: string;
  timestamp?: string;
}

export interface Scenario {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  steps?: AttackStep[];
}

export interface Run {
  _id?: string;
  id?: string;
  scenario: string | Scenario;
  status: RunStatus;
  logs?: string[];
  startedAt?: string;
  endedAt?: string;
}

export interface Alert {
  _id?: string;
  id?: string;
  type: 'RUN_FAILED' | 'BLOCKED_STEP' | 'MANY_BLOCKED_STEPS' | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  message: string;
  scenarioId?: string;
  runId?: string;
  details?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlertListResponse {
  results: Alert[];
  total: number;
  page: number;
  limit: number;
}

export interface SummaryStats {
  totalScenarios?: number;
  runsByStatus?: Record<RunStatus, number>;
  alertsBySeverity?: Record<string, number>;
}

// Input shape for creating/updating a scenario (no _id)
export interface ScenarioInput {
  name: string;
  description?: string;
  steps?: AttackStep[];
}
