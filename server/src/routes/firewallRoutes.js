import { Router } from 'express';
import {
  checkPrompt,
  checkResponse,
  getFirewallEvents,
  getFirewallPolicy,
  updateFirewallPolicy,
} from '../controllers/firewallController.js';
import { requireAuth } from '../middleware/auth.js';
import { firewallLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.post('/check-prompt', firewallLimiter, checkPrompt);
router.post('/check-response', firewallLimiter, checkResponse);
router.get('/events', getFirewallEvents);
router.get('/policy/:aiSystemId', getFirewallPolicy);
router.put('/policy/:aiSystemId', updateFirewallPolicy);

export default router;
