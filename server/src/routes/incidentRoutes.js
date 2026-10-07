import { Router } from 'express';
import {
  getIncidents,
  getIncidentsByAISystem,
  recordIncidentFeedback,
} from '../controllers/incidentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getIncidents);
router.get('/ai-system/:id', getIncidentsByAISystem);
router.post('/:id/feedback', recordIncidentFeedback);

export default router;
