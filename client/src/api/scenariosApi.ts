import http from './httpClient';
import { Scenario, ScenarioInput } from '../types/api';
import * as runsApi from './runsApi';

export const getScenarios = async (): Promise<Scenario[]> => {
  const res = await http.get('/scenarios');
  return res.data?.data || [];
};

export const getScenario = async (id: string): Promise<Scenario | null> => {
  const res = await http.get(`/scenarios/${id}`);
  return res.data?.data || null;
};

export const runScenario = async (id: string): Promise<any> => {
  // create a real run via runs API
  return runsApi.createRun(id);
};

export const dryRunScenario = async (id: string): Promise<any> => {
  return runsApi.dryRun(id);
};

export const createScenario = async (payload: ScenarioInput): Promise<Scenario> => {
  const res = await http.post('/scenarios', payload);
  return res.data?.data;
};

export const getScenarioById = getScenario;

export const updateScenario = async (id: string, payload: ScenarioInput): Promise<Scenario | null> => {
  const res = await http.put(`/scenarios/${id}`, payload);
  return res.data?.data || null;
};

export default { getScenarios, runScenario, dryRunScenario, getScenario, createScenario, updateScenario };
