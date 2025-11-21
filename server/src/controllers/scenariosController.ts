import { Request, Response } from 'express';
import scenarioService from '../services/scenarioService';
import runService from '../services/runService';

export const listScenarios = async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const data = await scenarioService.getAll(q);
  res.json({ data });
};

export const getScenario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await scenarioService.getById(id);
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json({ data });
};

export const createScenario = async (req: Request, res: Response) => {
  const payload = req.body;
  const created = await scenarioService.createScenario(payload);
  res.status(201).json({ data: created });
};

export const updateScenario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updated = await scenarioService.updateScenario(id, payload);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ data: updated });
};

export const runScenario = async (req: Request, res: Response) => {
  const { id } = req.params; // scenario id
  // ensure scenario exists
  const scenario = await scenarioService.getById(id);
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

  const run = await runService.createRun(id);
  res.status(201).json({ data: run });
};

export default { listScenarios, createScenario, getScenario, updateScenario, runScenario };
