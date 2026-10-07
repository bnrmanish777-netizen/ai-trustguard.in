import { Router } from 'express';
import {
  getAISystems,
  getAISystemById,
  createAISystem,
  updateAISystem,
  deleteAISystem,
  getAIProfile,
  updateAIProfile,
  getAIPersonalizationCenter,
  getAITrustMemory,
} from '../controllers/aiSystemController.js';
import { getAISafetyDiagnostic, getTrustScoreTimeline } from '../controllers/safetyController.js';
import { getIncidentsByAISystem } from '../controllers/incidentController.js';
import { handleGatewayChat } from '../controllers/gatewayController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all AI system routes
router.use(requireAuth);

router.get('/', getAISystems);
router.post('/', createAISystem);
router.get('/:id', getAISystemById);
router.put('/:id', updateAISystem);
router.delete('/:id', deleteAISystem);

// Profile & Personalization Sub-routes
router.get('/:id/profile', getAIProfile);
router.put('/:id/profile', updateAIProfile);
router.get('/:id/personalization', getAIPersonalizationCenter);
router.get('/:id/trust-memory', getAITrustMemory);

// Safety, Incidents & Inline Gateway
router.get('/:id/safety', getAISafetyDiagnostic);
router.get('/:id/trust-score-history', getTrustScoreTimeline);
router.get('/:id/incidents', getIncidentsByAISystem);
router.post('/:id/gateway', (req, res, next) => {
  req.body.aiSystemId = req.params.id;
  return handleGatewayChat(req, res, next);
});

export default router;
