import path from 'path';

// set env before importing modules that capture config at import time
process.env.ATTACK_ALLOWLIST = 'localhost,127.0.0.1';
process.env.ATTACK_BLOCK_BEHAVIOR = 'continue';

import { mockRunRepo, mockScenarioRepo, setScenario } from './mocks/mockRepos';
import { getRun } from './setupTests';

// Replace real repositories with mocks
jest.mock('../repositories/runRepository', () => mockRunRepo);
jest.mock('../repositories/scenarioRepository', () => mockScenarioRepo);

// Mock HttpExecutor to return controlled responses
jest.mock('../core/attack/HttpExecutor', () => {
  return jest.fn().mockImplementation(() => ({
    execute: async (req: any) => ({ status: 200, body: `OK ${req.method} ${req.url}` })
  }));
});

import runService from '../services/runService';
import { runScenario } from '../core/attack/AttackEngine';

// Helper to poll for run status
async function waitForRunStatus(runId: string, predicate: (s: string) => boolean, timeout = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await getRun(runId);
    if (r && predicate(r.status)) return r;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('Timeout waiting for run status');
}

// setupTests handles resetting mocks before each test

describe('AttackEngine lifecycle', () => {
  it('creates run as pending and transitions to running then completed on success', async () => {
    // Create a scenario with an http step and an assertion that passes
    const scenarioId = 'sc1';
    const scenario = {
      _id: scenarioId,
      name: 'happy-path',
      steps: [
        { type: 'http', method: 'GET', url: 'http://localhost/health' },
        { type: 'assertStatus', expected: 200 }
      ]
    };
    setScenario(scenarioId, scenario);

    const run = await runService.createRun(scenarioId);
    expect(run.status).toBe('pending');

    // wait until run is not pending
    const finished = await waitForRunStatus(run._id, (s) => s === 'completed' || s === 'failed');
    expect(finished.status).toBe('completed');

    // parse structured logs
    const logs = (finished.logs || []).map((l: string) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
    // must include assertStatus success
    const as = logs.find((x: any) => x.type === 'assertStatus');
    expect(as).toBeDefined();
    expect(as.status).toBe('success');
  });

  it('fails the run on first failing assertion', async () => {
    const scenarioId = 'sc2';
    const scenario = {
      _id: scenarioId,
      name: 'assert-fail',
      steps: [
        { type: 'http', method: 'GET', url: 'http://localhost/health' },
        { type: 'assertStatus', expected: 500 }
      ]
    };
    setScenario(scenarioId, scenario);

    const run = await runService.createRun(scenarioId);
    expect(run.status).toBe('pending');

    const finished = await waitForRunStatus(run._id, (s) => s === 'completed' || s === 'failed');
    expect(finished.status).toBe('failed');

    const logs = (finished.logs || []).map((l: string) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
    const assertionLog = logs.find((x: any) => x.type === 'assertStatus');
    expect(assertionLog).toBeDefined();
    expect(assertionLog.status).toBe('failed');
  });

  it('logs blocked step and continues when ATTACK_BLOCK_BEHAVIOR=continue', async () => {
    process.env.ATTACK_BLOCK_BEHAVIOR = 'continue';
    // scenario with blocked URL (not in allowlist)
    const scenarioId = 'sc3';
    const scenario = { _id: scenarioId, name: 'blocked-continue', steps: [ { type: 'http', url: 'http://blocked.local' } ] };
    setScenario(scenarioId, scenario);

    const run = await runService.createRun(scenarioId);
    const finished = await waitForRunStatus(run._id, (s) => s === 'completed' || s === 'failed');
    expect(finished.status).toBe('completed');
    const logs = (finished.logs || []).map((l: string) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const blocked = logs.find((x: any) => x.status === 'blocked');
    expect(blocked).toBeDefined();
  });

  it('fails run when ATTACK_BLOCK_BEHAVIOR=fail on blocked step', async () => {
    process.env.ATTACK_BLOCK_BEHAVIOR = 'fail';
    const scenarioId = 'sc4';
    const scenario = { _id: scenarioId, name: 'blocked-fail', steps: [ { type: 'http', url: 'http://blocked.local' } ] };
    setScenario(scenarioId, scenario);

    const run = await runService.createRun(scenarioId);
    const finished = await waitForRunStatus(run._id, (s) => s === 'completed' || s === 'failed');
    expect(finished.status).toBe('failed');
    const logs = (finished.logs || []).map((l: string) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const blocked = logs.find((x: any) => x.status === 'blocked');
    expect(blocked).toBeDefined();
  });
});
