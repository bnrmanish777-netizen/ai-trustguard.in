import { Router } from 'express';
import { runPlaygroundTest } from '../controllers/playgroundController.js';
import { requireAuth } from '../middleware/auth.js';
import { firewallLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.post('/test', firewallLimiter, runPlaygroundTest);

export default router;
