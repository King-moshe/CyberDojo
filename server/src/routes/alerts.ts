import { Router } from 'express';
import alertsController from '../controllers/alerts.controller';

const router = Router();

router.get('/', alertsController.listAlerts);
// SSE stream for real-time alerts (keep before param routes)
router.get('/stream', alertsController.stream);
router.get('/:id', alertsController.getAlertById);
router.patch('/:id/resolve', alertsController.resolveAlert);

export default router;
