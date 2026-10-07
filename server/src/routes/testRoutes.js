import { Router } from 'express';
import { listTests, generatePersonalizedTests } from '../controllers/testController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiExecutionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTests);
router.post('/generate', aiExecutionLimiter, generatePersonalizedTests);
router.post('/generate-personalized', aiExecutionLimiter, generatePersonalizedTests);

export default router;
