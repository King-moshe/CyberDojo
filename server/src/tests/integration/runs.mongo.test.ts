import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

// Ensure env set before importing app/engine
process.env.ATTACK_ALLOWLIST = 'localhost,127.0.0.1';
process.env.ATTACK_BLOCK_BEHAVIOR = 'continue';

import app from '../../app';
import ScenarioModel from '../../models/Scenario';
import RunModel from '../../models/Run';
import { HttpExecutor } from '../../core/attack/HttpExecutor';

// Integration tests against a real in-memory MongoDB instance.
describe('Integration: Runs with mongodb-memory-server', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    // clear DB between tests
    await ScenarioModel.deleteMany({}).exec();
    await RunModel.deleteMany({}).exec();
  });

  it('persists real run lifecycle and dry-run returns structured logs', async () => {
    // stub HttpExecutor to avoid network calls
    jest.spyOn(HttpExecutor.prototype, 'execute').mockImplementation(async () => ({ status: 200, body: 'ok' } as any));

    // create scenario in real DB
    const scenario = await ScenarioModel.create({
      name: 'integration-scenario',
      steps: [
        { type: 'http', method: 'GET', url: 'http://localhost/health' },
        { type: 'assertStatus', expected: 200 },
      ],
    });

    const scenarioId = scenario._id.toString();

    // Trigger a real run (POST /api/runs with scenarioId in body)
    const res = await request(app).post('/api/runs').send({ scenarioId });
    expect(res.status).toBe(201);
    const createdRun = res.body?.data;
    expect(createdRun).toBeDefined();
    // run created should be pending initially
    expect(createdRun.status).toBe('pending');

    // Wait for run to transition to completed/failed in DB
    const waitFor = async (id: string, timeout = 5000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const r = await RunModel.findById(id).lean().exec();
        if (r && (r.status === 'completed' || r.status === 'failed')) return r as any;
        await new Promise((r) => setTimeout(r, 50));
      }
      throw new Error('Timeout waiting for run status');
    };

    const finished = await waitFor(createdRun._id);
    expect(['completed', 'failed']).toContain(finished.status);

    // logs should exist and be parseable JSON StepLog strings
    expect(Array.isArray(finished.logs)).toBeTruthy();
    const parsed = finished.logs?.map((l: string) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty('mode');

    // Now call dry-run endpoint and assert logs contain mode: 'dry-run'
    const dr = await request(app).post(`/api/runs/${scenarioId}/dry-run`).send();
    expect(dr.status).toBe(200);
    const dryRun = dr.body?.data;
    expect(dryRun).toBeDefined();
    const dryLogs = (dryRun.logs || []).map((l: string) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    expect(dryLogs.length).toBeGreaterThan(0);
    for (const lg of dryLogs) {
      expect(lg).toHaveProperty('mode', 'dry-run');
      expect(lg).toHaveProperty('type');
      expect(typeof lg.stepIndex === 'number' || lg.type === 'http').toBeTruthy();
    }

    (HttpExecutor.prototype.execute as jest.MockedFunction<any>).mockRestore();
  });
});
