import { Router } from 'express';
import runsController from '../controllers/runsController';

const router = Router();

router.get('/', runsController.listRuns);

router.post('/', runsController.createRun);

// POST /api/runs/:scenarioId/dry-run
router.post('/:scenarioId/dry-run', runsController.dryRun);

// SSE stream for logs (keep before :runId if necessary)
router.get('/:runId/stream', runsController.streamLogs);

router.get('/:runId', runsController.getRun);

export default router;
