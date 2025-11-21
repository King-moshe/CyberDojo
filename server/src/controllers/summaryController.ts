import { Request, Response } from 'express';
import summaryService from '../services/summaryService';

export const getSummary = async (req: Request, res: Response) => {
  const data = await summaryService.getSummary();
  res.json({ data });
};

export default { getSummary };
