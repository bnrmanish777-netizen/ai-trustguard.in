import { Router } from 'express';
import { submitFeedback, listFeedback } from '../controllers/feedbackController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', submitFeedback);
router.get('/', listFeedback);

export default router;
