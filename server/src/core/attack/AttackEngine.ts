import { IScenario } from '../../models/Scenario';
import * as runRepo from '../../repositories/runRepository';
import HttpExecutor from './HttpExecutor';
import { getConfig } from '../../config/env';
import { AttackStep, StepLog } from './types';

const config = getConfig();

function hostMatchesPattern(host: string, pattern: string): boolean {
  if (!pattern) return false;
  if (pattern.startsWith('*.')) {
    const suffix = pattern.substring(2).toLowerCase();
    return host.toLowerCase().endsWith('.' + suffix) || host.toLowerCase() === suffix;
  }
  return host.toLowerCase() === pattern.toLowerCase();
}

function isUrlAllowed(targetUrl: string): boolean {
  if (!config.allowedHosts || config.allowedHosts.length === 0) return true;
  try {
    const u = new URL(targetUrl);
    const hostWithPort = u.port ? `${u.hostname}:${u.port}` : u.hostname;
    for (const p of config.allowedHosts) {
      if (hostMatchesPattern(hostWithPort, p) || hostMatchesPattern(u.hostname, p)) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function makeLog(stepIndex: number, type: string, status: StepLog['status'], message?: string, mode: StepLog['mode'] = 'real') {
  const l: StepLog = { stepIndex, type, status, message, mode };
  return JSON.stringify(l);
}

// Executes a scenario and appends structured logs to the associated run.
export async function runScenario(scenario: IScenario, runId: string, mode: 'real' | 'dry-run' = 'real'): Promise<void> {
  try {
    await runRepo.updateById(runId, { status: 'running', startedAt: new Date() });

    await runRepo.appendLog(runId, `Starting scenario: ${scenario.name}`);
    if (scenario.description) await runRepo.appendLog(runId, `Description: ${scenario.description}`);

    const steps: AttackStep[] = Array.isArray((scenario as any).steps) ? (scenario as any).steps : [];
    if (steps.length === 0) {
      await runRepo.appendLog(runId, makeLog(0, 'info', 'success', 'No steps defined', mode));
    }

    const executor = new HttpExecutor();
    let lastResponse: { status: number; body: string } | null = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as any;
      try {
        // Record execution start
        await runRepo.appendLog(runId, makeLog(i, step.type || 'unknown', 'success', `Executing step ${i + 1}`, mode));

        if (!step || !step.type) {
          await runRepo.appendLog(runId, makeLog(i, 'unknown', 'failed', 'Missing step type', mode));
          // fail run on malformed step
          await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
          return;
        }

        if (step.type === 'http') {
          const req = { method: (step.method || 'GET').toUpperCase(), url: step.url, body: step.body };
          if (!isUrlAllowed(req.url)) {
            await runRepo.appendLog(runId, makeLog(i, 'http', 'blocked', `Blocked by allowlist: ${req.url}`, mode));
            if (config.attackBlockBehavior === 'fail') {
              await runRepo.appendLog(runId, makeLog(i, 'http', 'failed', 'Run failed due to blocked step', mode));
              await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
              return;
            }
            continue; // skip blocked step
          }

          if (mode === 'dry-run') {
            // simulate response
            const simulated = { status: 200, body: `DRY-RUN simulated response for ${req.method} ${req.url}` };
            lastResponse = simulated;
            await runRepo.appendLog(runId, makeLog(i, 'http', 'success', `Simulated response status: ${simulated.status}`, mode));
            await runRepo.appendLog(runId, makeLog(i, 'http', 'success', `Simulated body: ${simulated.body}`.substring(0, 1000), mode));
            continue;
          }

          // real execution
          const res = await executor.execute(req as any);
          lastResponse = { status: res.status, body: res.body };
          await runRepo.appendLog(runId, makeLog(i, 'http', 'success', `Response status: ${res.status}`, mode));
          await runRepo.appendLog(runId, makeLog(i, 'http', 'success', `Response body: ${String(res.body).substring(0, 1000)}`, mode));

        } else if (step.type === 'pause') {
          const ms = Number(step.ms) || 0;
          await runRepo.appendLog(runId, makeLog(i, 'pause', 'success', `Pausing ${ms}ms`, mode));
          await new Promise((r) => setTimeout(r, ms));

        } else if (step.type === 'assertStatus') {
          const expected = Number(step.expected);
          const actual = lastResponse ? lastResponse.status : 0;
          if (actual === expected) {
            await runRepo.appendLog(runId, makeLog(i, 'assertStatus', 'success', `Expected ${expected}, got ${actual}`, mode));
          } else {
            await runRepo.appendLog(runId, makeLog(i, 'assertStatus', 'failed', `Expected ${expected}, got ${actual}`, mode));
            await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
            return;
          }

        } else if (step.type === 'assertBodyContains') {
          const expected = String(step.expected || '');
          const body = lastResponse ? String(lastResponse.body || '') : '';
          if (body.includes(expected)) {
            await runRepo.appendLog(runId, makeLog(i, 'assertBodyContains', 'success', `Body contains '${expected}'`, mode));
          } else {
            await runRepo.appendLog(runId, makeLog(i, 'assertBodyContains', 'failed', `Body does not contain '${expected}'`, mode));
            await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
            return;
          }

        } else {
          await runRepo.appendLog(runId, makeLog(i, step.type, 'failed', `Unsupported step type: ${step.type}`, mode));
          await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
          return;
        }

      } catch (stepErr) {
        await runRepo.appendLog(runId, makeLog(i, step?.type || 'unknown', 'failed', `Step error: ${String(stepErr)}`, mode));
        await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
        return;
      }
    }

    await runRepo.appendLog(runId, makeLog(-1, 'info', 'success', 'Scenario execution finished', mode));
    await runRepo.updateById(runId, { status: 'completed', endedAt: new Date() });
  } catch (err) {
    try { await runRepo.appendLog(runId, makeLog(-1, 'error', 'failed', `AttackEngine error: ${String(err)}`, 'real')); } catch (e) { /* ignore */ }
    await runRepo.updateById(runId, { status: 'failed', endedAt: new Date() });
    throw err;
  }
}

export default runScenario;
