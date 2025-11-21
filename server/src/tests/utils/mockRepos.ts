import { ObjectId } from 'mongodb';

type RunRecord = any;
const runs = new Map<string, RunRecord>();

export function resetRuns() {
  runs.clear();
}

export function getRun(id: string) {
  return runs.get(id) || null;
}

export const mockRunRepo = {
  createOne: async (payload: any) => {
    const _id = (new ObjectId()).toHexString();
    const run = { _id, id: _id, ...payload };
    runs.set(_id, run);
    return run;
  },
  findById: async (id: string) => {
    return runs.get(id) || null;
  },
  findAll: async () => Array.from(runs.values()),
  updateById: async (id: string, payload: Partial<any>) => {
    const r = runs.get(id);
    if (!r) return null;
    const updated = Object.assign({}, r, payload);
    runs.set(id, updated);
    return updated;
  },
  appendLog: async (id: string, log: string) => {
    const r = runs.get(id);
    if (!r) return null;
    const logs = Array.isArray(r.logs) ? r.logs.slice() : [];
    logs.push(log);
    const updated = Object.assign({}, r, { logs });
    runs.set(id, updated);
    return updated;
  }
};

let scenarios = new Map<string, any>();
export function setScenario(id: string, obj: any) {
  scenarios.set(id, obj);
}

export const mockScenarioRepo = {
  findById: async (id: string) => {
    return scenarios.get(id) || null;
  },
  // minimal stubs for create/update if needed
  createOne: async (payload: any) => payload,
  updateById: async (id: string, payload: any) => payload,
};

export function resetScenarios() { scenarios = new Map(); }
