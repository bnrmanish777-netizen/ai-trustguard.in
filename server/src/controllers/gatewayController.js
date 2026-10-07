import { routeThroughTrustGuard } from '../services/gatewayService.js';

export const handleGatewayChat = async (req, res, next) => {
  try {
    const { prompt, aiSystemId, throughFirewall = true } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required' });
    }
    if (!aiSystemId) {
      return res.status(400).json({ error: 'aiSystemId is required' });
    }

    const userId = req.user ? req.user.id : '00000000-0000-4000-8000-000000000001';

    const result = await routeThroughTrustGuard({
      aiSystemId,
      userId,
      prompt,
      throughFirewall: throughFirewall !== false,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
