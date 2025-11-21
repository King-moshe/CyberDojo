import AlertModel, { IAlert } from '../models/Alert';
import mongoose from 'mongoose';

type ListFilter = {
  status?: string;
  severity?: string;
  scenarioId?: string;
  runId?: string;
  page?: number;
  limit?: number;
};

export const createAlert = async (payload: Partial<IAlert> & { scenario: string; run: string; type: string; message: string; severity?: string }) => {
  const doc = await AlertModel.create({
    scenario: new mongoose.Types.ObjectId(payload.scenario),
    run: new mongoose.Types.ObjectId(payload.run),
    type: payload.type,
    message: payload.message,
    severity: (payload.severity as any) || 'medium',
    details: (payload as any).details,
    status: (payload as any).status || 'open',
  });
  return doc;
};

export const listAlerts = async (filter: ListFilter = {}) => {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, filter.limit || 50);
  const query: any = {};
  if (filter.status) query.status = filter.status;
  if (filter.severity) query.severity = filter.severity;
  if (filter.scenarioId) query.scenario = filter.scenarioId;
  if (filter.runId) query.run = filter.runId;

  const docs = await AlertModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
  const total = await AlertModel.countDocuments(query).exec();
  return { results: docs, total, page, limit };
};

export const getAlertById = async (id: string) => {
  return AlertModel.findById(id).populate('scenario', 'name').populate('run', '_id').exec();
};

export const updateAlertStatus = async (id: string, status: 'open' | 'resolved') => {
  return AlertModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
};

export default { createAlert, listAlerts, getAlertById, updateAlertStatus };
