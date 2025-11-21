import * as runRepo from '../repositories/runRepository';
import * as scenarioRepo from '../repositories/scenarioRepository';
import * as alertsRepo from '../repositories/alerts.repository';
import { runScenario } from '../core/attack/AttackEngine';
import AlertEngine from '../core/detection/AlertEngine';
import { emitAlert } from '../utils/alertEvents';

export const createRun = async (scenarioId: string) => {
  // create a run record in 'pending' state
  const run = await runRepo.createOne({ scenario: scenarioId, status: 'pending', logs: [] });

  // Kick off attack engine asynchronously (do not await) — engine will mark run as 'running'
  (async () => {
    try {
      const scenario = await scenarioRepo.findById(scenarioId);
      if (scenario) {
        await runScenario(scenario as any, String(run._id ?? run.id), 'real');
      } else {
        await appendLog(String(run._id ?? run.id), `Scenario ${scenarioId} not found`);
        await finishRun(String(run._id ?? run.id), 'failed');
      }
    } catch (err) {
      await appendLog(String(run._id ?? run.id), `Engine error: ${err}`);
      await finishRun(String(run._id ?? run.id), 'failed');
    }
  })();

  return run;
};

export const appendLog = async (runId: string, log: string) => {
  return runRepo.appendLog(runId, log);
};

export const finishRun = async (runId: string, status: string) => {
  // update run status and endedAt
  const updated = await runRepo.updateById(runId, { status, endedAt: new Date() });

  try {
    // load latest run and scenario
    const run = await getRunById(runId);
    if (!run) return updated;

    const scenario = await scenarioRepo.findById(String((run as any).scenario));

    // parse structured step logs only (ignore free-text)
    const rawLogs: string[] = Array.isArray((run as any).logs) ? (run as any).logs : [];
    const stepLogs = rawLogs
      .map((l) => {
        try {
          const parsed = JSON.parse(l);
          if (parsed && (parsed.type || parsed.status)) return parsed;
        } catch (_) {
          // ignore non-json
        }
        return null;
      })
      .filter(Boolean);

    // evaluate alerts via AlertEngine (pure)
    const engine = new AlertEngine();
    const alerts = engine.evaluate({ run: run as any, scenario: scenario as any, stepLogs });

    // persist alerts
    for (const a of alerts) {
      try {
        const created = await alertsRepo.createAlert({
          scenario: String(a.scenario || (run as any).scenario),
          run: String(a.run || (run as any)._id || (run as any).id),
          type: a.type,
          severity: a.severity,
          message: a.message,
          details: a.details || (a as any).metadata || null,
        } as any);
        try { emitAlert(created); } catch (_) {}
      } catch (e) {
        // non-fatal: continue
      }
    }
  } catch (e) {
    // swallow detection errors so they don't break run completion
  }

  return updated;
};

export const getRunById = async (id: string) => {
  return runRepo.findById(id);
};

export const dryRun = async (scenarioId: string) => {
  // create pending run
  const run = await runRepo.createOne({ scenario: scenarioId, status: 'pending', logs: [] });

  try {
    const scenario = await scenarioRepo.findById(scenarioId);
    if (!scenario) {
      await appendLog(String(run._id ?? run.id), `Scenario ${scenarioId} not found`);
      await finishRun(String(run._id ?? run.id), 'failed');
      return await getRunById(String(run._id ?? run.id));
    }

    // Run engine synchronously in dry-run mode
    await runScenario(scenario as any, String(run._id ?? run.id), 'dry-run');

    // return updated run
    return await getRunById(String(run._id ?? run.id));
  } catch (err) {
    await appendLog(String(run._id ?? run.id), `Dry-run engine error: ${err}`);
    await finishRun(String(run._id ?? run.id), 'failed');
    return await getRunById(String(run._id ?? run.id));
  }
};

export default { createRun, appendLog, finishRun, getRunById, dryRun };
