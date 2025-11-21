import { Request, Response } from 'express';
import runService from '../services/runService';
import { onLog } from '../utils/runEvents';

export const listRuns = async (req: Request, res: Response) => {
  // For now return all runs via repository if needed
  // Keep simple: use runRepository directly not exposed here; but repository has findAll
  const runs = await (await import('../repositories/runRepository')).findAll();
  res.json({ data: runs });
};

export const createRun = async (req: Request, res: Response) => {
  const { scenarioId } = req.body;
  if (!scenarioId) return res.status(400).json({ error: 'scenarioId required' });
  const run = await runService.createRun(scenarioId);
  res.status(201).json({ data: run });
};

export const dryRun = async (req: Request, res: Response) => {
  const { scenarioId } = req.params;
  if (!scenarioId) return res.status(400).json({ error: 'scenarioId required' });
  const run = await runService.dryRun(scenarioId);
  res.status(200).json({ data: run });
};

export const getRun = async (req: Request, res: Response) => {
  const { runId } = req.params;
  const run = await runService.getRunById(runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json({ data: run });
};

export const streamLogs = async (req: Request, res: Response) => {
  const { runId } = req.params;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send existing logs
  const run = await runService.getRunById(runId);
  if (run && (run as any).logs) {
    for (const l of (run as any).logs) {
      res.write(`data: ${JSON.stringify({ log: l })}\n\n`);
    }
  }

  const listener = (payload: { runId: string; log: string }) => {
    if (payload.runId === runId) {
      res.write(`data: ${JSON.stringify({ log: payload.log })}\n\n`);
    }
  };

  const off = onLog(listener);

  // cleanup on client disconnect
  req.on('close', () => {
    off();
    res.end();
  });
};

export default { listRuns, createRun, dryRun, getRun, streamLogs };
