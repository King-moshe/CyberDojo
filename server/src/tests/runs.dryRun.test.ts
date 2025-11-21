import request from 'supertest';

// Ensure env set before importing app/engine
process.env.ATTACK_ALLOWLIST = 'localhost,127.0.0.1';
process.env.ATTACK_BLOCK_BEHAVIOR = 'continue';
import { mockRunRepo, mockScenarioRepo, setScenario } from './mocks/mockRepos';

jest.mock('../repositories/runRepository.ts', () => mockRunRepo);
jest.mock('../repositories/scenarioRepository', () => mockScenarioRepo);

jest.mock('../core/attack/HttpExecutor.ts', () => {
  return jest.fn().mockImplementation(() => ({
    execute: async (req: any) => ({ status: 200, body: `OK ${req.method} ${req.url}` })
  }));
});

// Import Express app after mocks
import app from '../app';

// setupTests handles resetting mocks before each test

describe('Dry-run endpoint', () => {
  it('executes scenario in dry-run mode and returns run with logs', async () => {
    const scenarioId = 'dry1';
    const scenario = { _id: scenarioId, name: 'dry-run-scenario', steps: [ { type: 'http', method: 'GET', url: 'http://localhost/health' }, { type: 'assertStatus', expected: 200 } ] };
    setScenario(scenarioId, scenario);

    const res = await request(app).post(`/api/runs/${scenarioId}/dry-run`).send();
    expect(res.status).toBe(200);
    const run = res.body?.data;
    expect(run).toBeDefined();
    expect(run.status === 'completed' || run.status === 'failed').toBeTruthy();

    // logs should contain structured entries with mode: 'dry-run'
    const logs = (run.logs || []).map((l: string) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
    expect(logs.length).toBeGreaterThan(0);
    for (const lg of logs) {
      expect(lg).toHaveProperty('mode', 'dry-run');
      expect(lg).toHaveProperty('stepIndex');
      expect(lg).toHaveProperty('type');
      expect(['success','failed','blocked']).toContain(lg.status);
    }
  });
});
