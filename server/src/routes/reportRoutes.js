import { Router } from 'express';
import {
  listReports,
  getReportById,
  createReportForEvaluation,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listReports);
router.get('/:id', getReportById);
router.post('/:evaluationId/generate', createReportForEvaluation);

export default router;
