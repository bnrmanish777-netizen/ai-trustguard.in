import { Router } from 'express';
import {
  getLiveMonitoringStream,
  getMonitoringStats,
} from '../controllers/monitoringController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/stream', getLiveMonitoringStream);
router.get('/stats', getMonitoringStats);

export default router;
