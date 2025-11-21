import { Document } from 'mongoose';
import * as scenarioRepo from '../repositories/scenarioRepository';

export const getAll = async (q?: string): Promise<Document[]> => {
  if (q && String(q).trim().length > 0) return scenarioRepo.findByQuery(String(q));
  return scenarioRepo.findAll();
};

export const getById = async (id: string): Promise<Document | null> => {
  return scenarioRepo.findById(id);
};

export const createScenario = async (payload: any): Promise<Document> => {
  return scenarioRepo.createOne(payload);
};

export const updateScenario = async (id: string, payload: Partial<any>): Promise<Document | null> => {
  return scenarioRepo.updateById(id, payload);
};

export default { getAll, getById, createScenario, updateScenario };
