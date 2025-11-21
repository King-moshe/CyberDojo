import ScenarioModel from '../models/Scenario';

export const findAll = async () => {
  return ScenarioModel.find().lean();
};

export const findByQuery = async (q: string) => {
  if (!q || q.trim().length === 0) return findAll();
  const regex = new RegExp(q.trim(), 'i');
  return ScenarioModel.find({ $or: [{ name: regex }, { description: regex }] }).lean();
};

export const createOne = async (payload: any) => {
  return ScenarioModel.create(payload);
};

export const findById = async (id: string) => {
  return ScenarioModel.findById(id).exec();
};

export const updateById = async (id: string, payload: Partial<any>) => {
  return ScenarioModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export default { findAll, createOne };
