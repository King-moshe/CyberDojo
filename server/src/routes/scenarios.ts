import { Router } from 'express';
import scenariosController from '../controllers/scenariosController';

const router = Router();

// GET /api/scenarios
router.get('/', scenariosController.listScenarios);

// GET /api/scenarios/:id
router.get('/:id', scenariosController.getScenario);

// POST /api/scenarios
router.post('/', scenariosController.createScenario);

// PUT /api/scenarios/:id
router.put('/:id', scenariosController.updateScenario);

// POST /api/scenarios/:id/run
router.post('/:id/run', scenariosController.runScenario);

export default router;
