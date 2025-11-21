import RunModel from '../models/Run';
import { emitLog } from '../utils/runEvents';

export const findAll = async () => {
  return RunModel.find().lean();
};

export const createOne = async (payload: any) => {
  return RunModel.create(payload);
};

export const findById = async (id: string) => {
  return RunModel.findById(id).exec();
};

export const updateById = async (id: string, payload: Partial<any>) => {
  return RunModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

export const appendLog = async (id: string, log: string) => {
  const res = await RunModel.findByIdAndUpdate(id, { $push: { logs: log } }, { new: true }).exec();
  try {
    emitLog(String(id), log);
  } catch (e) {
    // non-fatal
  }
  return res;
};

export default { findAll, createOne };
