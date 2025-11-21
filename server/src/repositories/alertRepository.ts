import AlertModel from '../models/Alert';

export const findAll = async () => {
  return AlertModel.find().lean();
};

export const createOne = async (payload: any) => {
  return AlertModel.create(payload);
};

export default { findAll, createOne };
