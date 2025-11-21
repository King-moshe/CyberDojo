import { Router } from 'express';
import summaryController from '../controllers/summaryController';

const router = Router();

// GET /api/summary
router.get('/', summaryController.getSummary);

export default router;
