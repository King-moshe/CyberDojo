export type HttpStep = {
  type: 'http';
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  payload?: 'sqlInjection' | 'xssPayload' | string;
};

export type PauseStep = {
  type: 'pause';
  ms: number;
};

export type AssertStatusStep = {
  type: 'assertStatus';
  expected: number;
};

export type AssertBodyContainsStep = {
  type: 'assertBodyContains';
  expected: string;
};

export type AttackStep = HttpStep | PauseStep | AssertStatusStep | AssertBodyContainsStep | ({ type: string } & Record<string, any>);

export type StepLog = {
  stepIndex: number;
  type: string;
  status: 'success' | 'failed' | 'blocked';
  message?: string;
  mode?: 'real' | 'dry-run';
};
