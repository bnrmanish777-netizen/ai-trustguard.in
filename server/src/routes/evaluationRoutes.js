import { Router } from 'express';
import {
  listEvaluations,
  getEvaluationById,
  getEvaluationResults,
  createAndRunEvaluation,
  compareEvaluationsHandler,
} from '../controllers/evaluationController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiExecutionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.get('/compare', compareEvaluationsHandler);
router.get('/', listEvaluations);
router.post('/', aiExecutionLimiter, createAndRunEvaluation);
router.get('/:id', getEvaluationById);
router.post('/:id/run', aiExecutionLimiter, createAndRunEvaluation);
router.get('/:id/results', getEvaluationResults);

export default router;
