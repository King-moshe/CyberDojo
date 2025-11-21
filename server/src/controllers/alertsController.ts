import { Request, Response } from 'express';

export const listAlerts = async (req: Request, res: Response) => {
  res.json({ data: [], message: 'listAlerts placeholder' });
};

export default { listAlerts };
