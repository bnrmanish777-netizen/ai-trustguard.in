import { Router } from 'express';
import { handleGatewayChat } from '../controllers/gatewayController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', handleGatewayChat);
router.post('/route', handleGatewayChat);

export default router;
